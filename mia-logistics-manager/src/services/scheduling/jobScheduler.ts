// src/services/scheduling/jobScheduler.ts
import cron from 'node-cron';
import { Queue, Worker } from 'bull';
import { EmailNotificationService } from '../notifications/emailService';
import { TelegramNotificationService } from '../notifications/telegramService';
import { OrdersService } from '../googleSheets/ordersService';

export interface ScheduledJob {
  id: string;
  name: string;
  schedule: string; // Cron expression
  type: 'email' | 'telegram' | 'system';
  enabled: boolean;
  lastRun?: Date;
  nextRun?: Date;
}

export interface JobContext {
  jobId: string;
  data: any;
  attempt: number;
}

export class JobSchedulerService {
  private emailService: EmailNotificationService;
  private telegramService: TelegramNotificationService;
  private ordersService: OrdersService;
  private emailQueue: Queue;
  private telegramQueue: Queue;
  private jobs: Map<string, ScheduledJob> = new Map();

  constructor(
    emailService: EmailNotificationService,
    telegramService: TelegramNotificationService,
    ordersService: OrdersService
  ) {
    this.emailService = emailService;
    this.telegramService = telegramService;
    this.ordersService = ordersService;

    // Initialize queues
    this.emailQueue = new Queue('email notifications');
    this.telegramQueue = new Queue('telegram notifications');

    this.setupWorkers();
    this.initializeJobs();
    this.startScheduler();
  }

  private setupWorkers(): void {
    // Email worker
    new Worker('email notifications', async (job) => {
      const { type, data } = job.data;

      switch (type) {
        case 'weekly_report':
          await this.emailService.generateWeeklyReport(
            data.recipients,
            data.weekData
          );
          break;
        case 'monthly_report':
          await this.emailService.generateMonthlyReport(
            data.recipients,
            data.monthData
          );
          break;
        case 'order_notification':
          await this.emailService.sendTemplatedEmail(
            data.templateId,
            data.recipients,
            data.variables,
            data.attachments
          );
          break;
        default:
          throw new Error(`Unknown email job type: ${type}`);
      }
    });

    // Telegram worker
    new Worker('telegram notifications', async (job) => {
      const { type, data } = job.data;

      switch (type) {
        case 'order_notification':
          await this.telegramService.sendOrderNotification(
            data.chatId,
            data.templateId,
            data.order,
            data.additionalData
          );
          break;
        case 'bulk_notification':
          await this.telegramService.sendBulkNotification(
            data.chatIds,
            data.message,
            data.options
          );
          break;
        case 'daily_summary':
          await this.sendDailySummary();
          break;
        default:
          throw new Error(`Unknown telegram job type: ${type}`);
      }
    });
  }

  private initializeJobs(): void {
    const defaultJobs: ScheduledJob[] = [
      {
        id: 'daily_telegram_summary',
        name: 'Tổng kết ngày qua Telegram',
        schedule: '0 20 * * *', // 8:00 PM daily
        type: 'telegram',
        enabled: true,
      },
      {
        id: 'weekly_email_report',
        name: 'Báo cáo tuần qua email',
        schedule: '0 9 * * 1', // 9:00 AM every Monday
        type: 'email',
        enabled: true,
      },
      {
        id: 'monthly_email_report',
        name: 'Báo cáo tháng qua email',
        schedule: '0 9 1 * *', // 9:00 AM on 1st of every month
        type: 'email',
        enabled: true,
      },
      {
        id: 'system_health_check',
        name: 'Kiểm tra sức khỏe hệ thống',
        schedule: '*/15 * * * *', // Every 15 minutes
        type: 'system',
        enabled: true,
      },
      {
        id: 'order_reminder',
        name: 'Nhắc nhở đơn hàng quá hạn',
        schedule: '0 10,14,18 * * *', // 10 AM, 2 PM, 6 PM daily
        type: 'telegram',
        enabled: true,
      },
    ];

    defaultJobs.forEach((job) => {
      this.jobs.set(job.id, job);
    });
  }

  private startScheduler(): void {
    this.jobs.forEach((job, jobId) => {
      if (job.enabled) {
        cron.schedule(job.schedule, async () => {
          await this.executeJob(jobId);
        });
        console.log(`✅ Scheduled job: ${job.name} (${job.schedule})`);
      }
    });
  }

  private async executeJob(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job || !job.enabled) return;

    try {
      console.log(`🔄 Executing job: ${job.name}`);

      switch (jobId) {
        case 'daily_telegram_summary':
          await this.scheduleDailySummary();
          break;
        case 'weekly_email_report':
          await this.scheduleWeeklyReport();
          break;
        case 'monthly_email_report':
          await this.scheduleMonthlyReport();
          break;
        case 'system_health_check':
          await this.performHealthCheck();
          break;
        case 'order_reminder':
          await this.scheduleOrderReminders();
          break;
        default:
          console.warn(`Unknown job: ${jobId}`);
      }

      // Update last run time
      job.lastRun = new Date();
      this.jobs.set(jobId, job);

      console.log(`✅ Job completed: ${job.name}`);
    } catch (error) {
      console.error(`❌ Job failed: ${job.name}`, error);
    }
  }

  private async scheduleDailySummary(): Promise<void> {
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

    // Get orders from yesterday
    const orders = await this.ordersService.getOrdersByDateRange(
      yesterday.toISOString(),
      today.toISOString()
    );

    const summary = {
      date: yesterday.toLocaleDateString('vi-VN'),
      totalOrders: orders.length,
      completedOrders: orders.filter((o) => o.status === 'DELIVERED').length,
      inTransitOrders: orders.filter((o) => o.status === 'IN_TRANSIT').length,
      pendingOrders: orders.filter((o) => o.status === 'PENDING').length,
      totalRevenue: orders.reduce((sum, o) => sum + (o.actualCost || 0), 0),
      reportUrl: `${process.env.REACT_APP_BASE_URL}/reports/daily`,
    };

    await this.telegramQueue.add('daily_summary', {
      type: 'bulk_notification',
      data: {
        chatIds: await this.getSubscribedChatIds('daily_summary'),
        message: this.formatDailySummary(summary),
        options: { parse_mode: 'Markdown' },
      },
    });
  }

  private async scheduleWeeklyReport(): Promise<void> {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);

    const orders = await this.ordersService.getOrdersByDateRange(
      startDate.toISOString(),
      endDate.toISOString()
    );

    const weekData = {
      weekNumber: this.getWeekNumber(endDate),
      year: endDate.getFullYear(),
      totalOrders: orders.length,
      revenue: orders.reduce((sum, o) => sum + (o.actualCost || 0), 0),
      topCarriers: this.getTopCarriers(orders),
      ordersByStatus: this.getOrdersByStatus(orders),
    };

    await this.emailQueue.add('weekly_report', {
      type: 'weekly_report',
      data: {
        recipients: await this.getSubscribedEmails('weekly_report'),
        weekData,
      },
    });
  }

  private async scheduleMonthlyReport(): Promise<void> {
    const endDate = new Date();
    const startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);

    const orders = await this.ordersService.getOrdersByDateRange(
      startDate.toISOString(),
      endDate.toISOString()
    );

    const monthData = {
      month: endDate.getMonth() + 1,
      year: endDate.getFullYear(),
      stats: this.calculateMonthlyStats(orders),
      growth: this.calculateGrowth(orders),
      recommendations: this.generateRecommendations(orders),
    };

    await this.emailQueue.add('monthly_report', {
      type: 'monthly_report',
      data: {
        recipients: await this.getSubscribedEmails('monthly_report'),
        monthData,
      },
    });
  }

  private async performHealthCheck(): Promise<void> {
    const healthStatus = {
      timestamp: new Date().toISOString(),
      services: {
        database: await this.checkDatabaseHealth(),
        email: await this.checkEmailHealth(),
        telegram: await this.checkTelegramHealth(),
        googleMaps: await this.checkGoogleMapsHealth(),
      },
    };

    // Send alerts if any service is down
    const downServices = Object.entries(healthStatus.services)
      .filter(([_, status]) => !status)
      .map(([service]) => service);

    if (downServices.length > 0) {
      await this.sendHealthAlert(downServices);
    }
  }

  private async scheduleOrderReminders(): Promise<void> {
    const pendingOrders = await this.ordersService.getOrdersByStatus('PENDING');
    const overdueOrders = pendingOrders.filter((order) => {
      const createdAt = new Date(order.createdAt);
      const hoursSinceCreated =
        (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);
      return hoursSinceCreated > 2; // More than 2 hours
    });

    if (overdueOrders.length > 0) {
      const message = `
⚠️ *Cảnh báo đơn hàng quá hạn*

Có ${overdueOrders.length} đơn hàng chưa được xử lý:

${overdueOrders
  .slice(0, 5)
  .map(
    (order) =>
      `• ${order.orderId} - ${order.customerName} (${Math.floor((Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60))}h)`
  )
  .join('\n')}

[Xem tất cả đơn quá hạn](${process.env.REACT_APP_BASE_URL}/orders?status=overdue)
      `;

      await this.telegramQueue.add('order_reminder', {
        type: 'bulk_notification',
        data: {
          chatIds: await this.getManagerChatIds(),
          message,
          options: { parse_mode: 'Markdown' },
        },
      });
    }
  }

  // Helper methods
  private formatDailySummary(summary: any): string {
    return `
📊 *Báo cáo cuối ngày* - ${summary.date}

📦 Tổng đơn hàng: ${summary.totalOrders}
✅ Đã hoàn thành: ${summary.completedOrders}
🚛 Đang vận chuyển: ${summary.inTransitOrders}
⏳ Chờ xử lý: ${summary.pendingOrders}
💰 Doanh thu: ${summary.totalRevenue.toLocaleString()} VND

📈 [Xem báo cáo chi tiết](${summary.reportUrl})
    `;
  }

  private getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear =
      (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  private getTopCarriers(orders: any[]): any[] {
    const carrierCounts = orders.reduce((acc, order) => {
      const carrier = order.carrierName || 'Unknown';
      acc[carrier] = (acc[carrier] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(carrierCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));
  }

  private getOrdersByStatus(orders: any[]): any {
    return orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});
  }

  private calculateMonthlyStats(orders: any[]): any {
    return {
      totalOrders: orders.length,
      revenue: orders.reduce((sum, o) => sum + (o.actualCost || 0), 0),
      averageOrderValue:
        orders.length > 0
          ? orders.reduce((sum, o) => sum + (o.actualCost || 0), 0) /
            orders.length
          : 0,
      completionRate:
        orders.length > 0
          ? (orders.filter((o) => o.status === 'DELIVERED').length /
              orders.length) *
            100
          : 0,
    };
  }

  private calculateGrowth(orders: any[]): any {
    // Mock growth calculation
    return {
      orderGrowth: '+15%',
      revenueGrowth: '+22%',
      customerGrowth: '+8%',
    };
  }

  private generateRecommendations(orders: any[]): string[] {
    const recommendations = [];

    if (orders.length > 100) {
      recommendations.push('Tăng đội ngũ customer service để xử lý volume cao');
    }

    const completionRate =
      orders.filter((o) => o.status === 'DELIVERED').length / orders.length;
    if (completionRate < 0.9) {
      recommendations.push(
        'Cải thiện quy trình vận chuyển để tăng tỷ lệ hoàn thành'
      );
    }

    return recommendations;
  }

  private async getSubscribedChatIds(jobType: string): Promise<string[]> {
    // Mock subscription data - integrate with user preferences
    return ['123456789', '987654321'];
  }

  private async getSubscribedEmails(jobType: string): Promise<string[]> {
    // Mock subscription data
    return ['manager@mia.vn', 'logistics@mia.vn'];
  }

  private async getManagerChatIds(): Promise<string[]> {
    // Mock manager chat IDs
    return ['123456789'];
  }

  private async checkDatabaseHealth(): Promise<boolean> {
    try {
      await this.ordersService.getOrders(1);
      return true;
    } catch {
      return false;
    }
  }

  private async checkEmailHealth(): Promise<boolean> {
    // Mock health check
    return true;
  }

  private async checkTelegramHealth(): Promise<boolean> {
    // Mock health check
    return true;
  }

  private async checkGoogleMapsHealth(): Promise<boolean> {
    // Mock health check
    return true;
  }

  private async sendHealthAlert(downServices: string[]): Promise<void> {
    const message = `
🚨 *Cảnh báo hệ thống*

Các dịch vụ gặp sự cố:
${downServices.map((service) => `• ${service}`).join('\n')}

Thời gian: ${new Date().toLocaleString('vi-VN')}
Cần kiểm tra ngay lập tức!
    `;

    await this.telegramQueue.add('health_alert', {
      type: 'bulk_notification',
      data: {
        chatIds: await this.getManagerChatIds(),
        message,
        options: { parse_mode: 'Markdown' },
      },
    });
  }

  public addJob(job: ScheduledJob): void {
    this.jobs.set(job.id, job);
    if (job.enabled) {
      cron.schedule(job.schedule, async () => {
        await this.executeJob(job.id);
      });
    }
  }

  public removeJob(jobId: string): void {
    this.jobs.delete(jobId);
  }

  public getJobs(): ScheduledJob[] {
    return Array.from(this.jobs.values());
  }

  public async updateJobStatus(jobId: string, enabled: boolean): Promise<void> {
    const job = this.jobs.get(jobId);
    if (job) {
      job.enabled = enabled;
      this.jobs.set(jobId, job);
    }
  }
}
