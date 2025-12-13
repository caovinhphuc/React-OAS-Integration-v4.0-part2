// src/services/notifications/notificationCenter.ts
import { TelegramNotificationService } from './telegramService';
import { EmailNotificationService } from './emailService';
import { Order } from '@/services/googleSheets/ordersService';

export interface NotificationChannel {
  id: string;
  name: string;
  type: 'telegram' | 'email' | 'push' | 'sms';
  enabled: boolean;
  config: Record<string, any>;
}

export interface UserNotificationPreferences {
  userId: string;
  channels: {
    telegram?: {
      enabled: boolean;
      chatId?: string;
      events: string[];
    };
    email?: {
      enabled: boolean;
      address: string;
      events: string[];
    };
    push?: {
      enabled: boolean;
      subscription?: any;
      events: string[];
    };
  };
  quietHours?: {
    start: string;
    end: string;
    timezone: string;
  };
  language: string;
}

export interface NotificationEvent {
  id: string;
  type: string;
  title: string;
  message: string;
  data: Record<string, any>;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  channels: string[];
  userId?: string;
  createdAt: Date;
  deliveredAt?: Date;
  readAt?: Date;
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'read';
}

export class NotificationCenterService {
  private telegramService: TelegramNotificationService;
  private emailService: EmailNotificationService;
  private userPreferences: Map<string, UserNotificationPreferences> = new Map();
  private notificationHistory: NotificationEvent[] = [];

  constructor(
    telegramService: TelegramNotificationService,
    emailService: EmailNotificationService
  ) {
    this.telegramService = telegramService;
    this.emailService = emailService;
    this.loadUserPreferences();
  }

  private loadUserPreferences(): void {
    // Mock user preferences - integrate with user service
    const defaultPreferences: UserNotificationPreferences = {
      userId: 'default',
      channels: {
        telegram: {
          enabled: true,
          chatId: '123456789',
          events: ['order_created', 'order_confirmed', 'order_delivered'],
        },
        email: {
          enabled: true,
          address: 'user@mia.vn',
          events: ['weekly_report', 'monthly_report', 'order_confirmation'],
        },
      },
      quietHours: {
        start: '22:00',
        end: '07:00',
        timezone: 'Asia/Ho_Chi_Minh',
      },
      language: 'vi',
    };

    this.userPreferences.set('default', defaultPreferences);
  }

  public async sendOrderNotification(
    eventType: string,
    order: Order,
    additionalData: Record<string, any> = {}
  ): Promise<void> {
    const users = await this.getUsersForOrderNotification(order);

    for (const userId of users) {
      const preferences = this.userPreferences.get(userId);
      if (!preferences) continue;

      const notificationEvent: NotificationEvent = {
        id: `${eventType}_${order.orderId}_${Date.now()}`,
        type: eventType,
        title: this.getEventTitle(eventType, order),
        message: this.getEventMessage(eventType, order),
        data: { orderId: order.orderId, ...additionalData },
        priority: this.getEventPriority(eventType),
        channels: this.getEnabledChannels(preferences, eventType),
        userId,
        createdAt: new Date(),
        status: 'pending',
      };

      await this.deliverNotification(notificationEvent, preferences);
    }
  }

  public async sendBulkNotification(
    eventType: string,
    title: string,
    message: string,
    data: Record<string, any> = {},
    targetUsers?: string[]
  ): Promise<void> {
    const users = targetUsers || Array.from(this.userPreferences.keys());

    for (const userId of users) {
      const preferences = this.userPreferences.get(userId);
      if (!preferences) continue;

      const notificationEvent: NotificationEvent = {
        id: `${eventType}_${userId}_${Date.now()}`,
        type: eventType,
        title,
        message,
        data,
        priority: 'normal',
        channels: this.getEnabledChannels(preferences, eventType),
        userId,
        createdAt: new Date(),
        status: 'pending',
      };

      await this.deliverNotification(notificationEvent, preferences);
    }
  }

  private async deliverNotification(
    event: NotificationEvent,
    preferences: UserNotificationPreferences
  ): Promise<void> {
    try {
      // Check quiet hours
      if (
        this.isQuietHours(preferences.quietHours) &&
        event.priority !== 'urgent'
      ) {
        console.log(`Skipping notification during quiet hours: ${event.id}`);
        return;
      }

      const deliveryPromises = [];

      // Telegram delivery
      if (
        event.channels.includes('telegram') &&
        preferences.channels.telegram?.enabled &&
        preferences.channels.telegram.chatId
      ) {
        const telegramPromise = this.deliverTelegram(
          event,
          preferences.channels.telegram.chatId
        );
        deliveryPromises.push(telegramPromise);
      }

      // Email delivery
      if (
        event.channels.includes('email') &&
        preferences.channels.email?.enabled &&
        preferences.channels.email.address
      ) {
        const emailPromise = this.deliverEmail(
          event,
          preferences.channels.email.address
        );
        deliveryPromises.push(emailPromise);
      }

      // Wait for all deliveries
      await Promise.allSettled(deliveryPromises);

      event.status = 'sent';
      event.deliveredAt = new Date();
      this.notificationHistory.push(event);
    } catch (error) {
      event.status = 'failed';
      this.notificationHistory.push(event);
      console.error('Error delivering notification:', error);
    }
  }

  private async deliverTelegram(
    event: NotificationEvent,
    chatId: string
  ): Promise<void> {
    const message = this.formatTelegramMessage(event);
    const options = {
      parse_mode: 'Markdown' as const,
      reply_markup: this.generateTelegramKeyboard(event),
    };

    await this.telegramService.sendBulkNotification([chatId], message, options);
  }

  private async deliverEmail(
    event: NotificationEvent,
    emailAddress: string
  ): Promise<void> {
    const templateId = this.getEmailTemplateId(event.type);
    const variables = {
      title: event.title,
      message: event.message,
      ...event.data,
      notificationId: event.id,
      timestamp: event.createdAt.toLocaleString('vi-VN'),
    };

    await this.emailService.sendTemplatedEmail(
      templateId,
      emailAddress,
      variables
    );
  }

  private formatTelegramMessage(event: NotificationEvent): string {
    const priorityEmoji = {
      low: '🔵',
      normal: '🟡',
      high: '🟠',
      urgent: '🔴',
    };

    return `
${priorityEmoji[event.priority]} *${event.title}*

${event.message}

_${event.createdAt.toLocaleString('vi-VN')}_
    `;
  }

  private generateTelegramKeyboard(event: NotificationEvent): any {
    const buttons = [];

    if (event.data.orderId) {
      buttons.push([
        {
          text: '📍 Theo dõi',
          url: `${process.env.REACT_APP_BASE_URL}/tracking/${event.data.orderId}`,
        },
        { text: '📞 Liên hệ', callback_data: `contact_${event.data.orderId}` },
      ]);
    }

    buttons.push([
      { text: '✅ Đã đọc', callback_data: `mark_read_${event.id}` },
    ]);

    return { inline_keyboard: buttons };
  }

  private getEmailTemplateId(eventType: string): string {
    const templateMap: Record<string, string> = {
      order_created: 'order_confirmation',
      order_confirmed: 'order_confirmation',
      order_delivered: 'order_confirmation',
      weekly_report: 'weekly_report',
      monthly_report: 'monthly_report',
    };

    return templateMap[eventType] || 'order_confirmation';
  }

  private getEventTitle(eventType: string, order: Order): string {
    const titleMap: Record<string, string> = {
      order_created: `Đơn hàng mới: ${order.orderId}`,
      order_confirmed: `Đơn hàng được xác nhận: ${order.orderId}`,
      order_pickup: `Đã lấy hàng: ${order.orderId}`,
      order_in_transit: `Đang vận chuyển: ${order.orderId}`,
      order_delivered: `Đã giao hàng: ${order.orderId}`,
      order_cancelled: `Đơn hàng bị hủy: ${order.orderId}`,
    };

    return titleMap[eventType] || `Cập nhật đơn hàng: ${order.orderId}`;
  }

  private getEventMessage(eventType: string, order: Order): string {
    const messageMap: Record<string, string> = {
      order_created: `Đơn hàng ${order.orderId} đã được tạo cho khách hàng ${order.customerName}`,
      order_confirmed: `Đơn hàng ${order.orderId} đã được xác nhận và chuẩn bị vận chuyển`,
      order_pickup: `Đã lấy hàng thành công cho đơn ${order.orderId}`,
      order_in_transit: `Đơn hàng ${order.orderId} đang được vận chuyển`,
      order_delivered: `Đơn hàng ${order.orderId} đã được giao thành công`,
      order_cancelled: `Đơn hàng ${order.orderId} đã bị hủy`,
    };

    return messageMap[eventType] || `Đơn hàng ${order.orderId} có cập nhật mới`;
  }

  private getEventPriority(
    eventType: string
  ): 'low' | 'normal' | 'high' | 'urgent' {
    const priorityMap: Record<string, 'low' | 'normal' | 'high' | 'urgent'> = {
      order_created: 'normal',
      order_confirmed: 'normal',
      order_pickup: 'normal',
      order_in_transit: 'normal',
      order_delivered: 'high',
      order_cancelled: 'high',
      system_alert: 'urgent',
      payment_failed: 'high',
    };

    return priorityMap[eventType] || 'normal';
  }

  private getEnabledChannels(
    preferences: UserNotificationPreferences,
    eventType: string
  ): string[] {
    const channels = [];

    if (
      preferences.channels.telegram?.enabled &&
      preferences.channels.telegram.events.includes(eventType)
    ) {
      channels.push('telegram');
    }

    if (
      preferences.channels.email?.enabled &&
      preferences.channels.email.events.includes(eventType)
    ) {
      channels.push('email');
    }

    return channels;
  }

  private async getUsersForOrderNotification(order: Order): Promise<string[]> {
    // Mock user identification - integrate with user service
    return ['default'];
  }

  private isQuietHours(
    quietHours?: UserNotificationPreferences['quietHours']
  ): boolean {
    if (!quietHours) return false;

    const now = new Date();
    const currentTime = now.toLocaleTimeString('en-GB', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      timeZone: quietHours.timezone,
    });

    return currentTime >= quietHours.start || currentTime <= quietHours.end;
  }

  public async updateUserPreferences(
    userId: string,
    preferences: Partial<UserNotificationPreferences>
  ): Promise<void> {
    const existing = this.userPreferences.get(userId) || {
      userId,
      channels: {},
      language: 'vi',
    };

    const updated = { ...existing, ...preferences };
    this.userPreferences.set(userId, updated);

    // Save to persistent storage
    await this.saveUserPreferences(userId, updated);
  }

  public getUserPreferences(
    userId: string
  ): UserNotificationPreferences | undefined {
    return this.userPreferences.get(userId);
  }

  public getNotificationHistory(
    userId?: string,
    limit: number = 50
  ): NotificationEvent[] {
    let history = this.notificationHistory;

    if (userId) {
      history = history.filter((event) => event.userId === userId);
    }

    return history
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  public async markAsRead(notificationId: string): Promise<void> {
    const notification = this.notificationHistory.find(
      (n) => n.id === notificationId
    );
    if (notification) {
      notification.status = 'read';
      notification.readAt = new Date();
    }
  }

  private async saveUserPreferences(
    userId: string,
    preferences: UserNotificationPreferences
  ): Promise<void> {
    // Mock save - integrate with persistent storage
    console.log(`Saving preferences for user ${userId}:`, preferences);
  }

  public getDeliveryStats(): {
    total: number;
    sent: number;
    delivered: number;
    failed: number;
    read: number;
  } {
    const total = this.notificationHistory.length;
    const sent = this.notificationHistory.filter(
      (n) => n.status === 'sent'
    ).length;
    const delivered = this.notificationHistory.filter(
      (n) => n.deliveredAt
    ).length;
    const failed = this.notificationHistory.filter(
      (n) => n.status === 'failed'
    ).length;
    const read = this.notificationHistory.filter(
      (n) => n.status === 'read'
    ).length;

    return { total, sent, delivered, failed, read };
  }
}
