// src/services/notifications/emailService.ts
import sgMail from '@sendgrid/mail';
import nodemailer from 'nodemailer';
import Handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlTemplate: string;
  textTemplate?: string;
  variables: string[];
}

export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  type?: string;
  disposition?: string;
}

export interface EmailMessage {
  to: string | string[];
  from: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: EmailAttachment[];
}

export class EmailNotificationService {
  private transporter: nodemailer.Transporter | null = null;
  private templates: Map<string, EmailTemplate> = new Map();
  private usesSendGrid: boolean;

  constructor(config: {
    provider: 'sendgrid' | 'smtp';
    apiKey?: string;
    smtpConfig?: {
      host: string;
      port: number;
      secure: boolean;
      auth: { user: string; pass: string };
    };
  }) {
    this.usesSendGrid = config.provider === 'sendgrid';

    if (this.usesSendGrid && config.apiKey) {
      sgMail.setApiKey(config.apiKey);
    } else if (config.smtpConfig) {
      this.transporter = nodemailer.createTransporter(config.smtpConfig);
    }

    this.initializeTemplates();
  }

  private initializeTemplates(): void {
    const templates: EmailTemplate[] = [
      {
        id: 'weekly_report',
        name: 'Báo cáo tuần',
        subject: 'Báo cáo logistics tuần {{weekNumber}}/{{year}} - MIA',
        htmlTemplate: this.loadTemplate('weekly-report.html'),
        variables: [
          'weekNumber',
          'year',
          'totalOrders',
          'revenue',
          'topCarriers',
          'ordersByStatus',
        ],
      },
      {
        id: 'monthly_report',
        name: 'Báo cáo tháng',
        subject: 'Báo cáo logistics tháng {{month}}/{{year}} - MIA',
        htmlTemplate: this.loadTemplate('monthly-report.html'),
        variables: [
          'month',
          'year',
          'monthlyStats',
          'growthAnalysis',
          'recommendations',
        ],
      },
      {
        id: 'order_confirmation',
        name: 'Xác nhận đơn hàng',
        subject: 'Xác nhận đơn hàng {{orderId}} - MIA Logistics',
        htmlTemplate: this.loadTemplate('order-confirmation.html'),
        variables: ['orderId', 'customerName', 'orderDetails', 'trackingUrl'],
      },
      {
        id: 'shipping_label',
        name: 'Tem vận chuyển',
        subject: 'Tem vận chuyển đơn hàng {{orderId}}',
        htmlTemplate: this.loadTemplate('shipping-label.html'),
        variables: [
          'orderId',
          'pickupInfo',
          'deliveryInfo',
          'qrCode',
          'barcode',
        ],
      },
    ];

    templates.forEach((template) => {
      this.templates.set(template.id, template);
    });
  }

  private loadTemplate(filename: string): string {
    try {
      const templatePath = path.join(
        __dirname,
        '../../../templates/email',
        filename
      );
      return fs.readFileSync(templatePath, 'utf-8');
    } catch (error) {
      console.error(`Error loading template ${filename}:`, error);
      return `<html><body><h1>Template Error</h1><p>Could not load template: ${filename}</p></body></html>`;
    }
  }

  public async sendEmail(message: EmailMessage): Promise<void> {
    try {
      if (this.usesSendGrid) {
        await sgMail.send(message as any);
      } else if (this.transporter) {
        await this.transporter.sendMail(message);
      } else {
        throw new Error('No email transport configured');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  public async sendTemplatedEmail(
    templateId: string,
    to: string | string[],
    variables: Record<string, any>,
    attachments?: EmailAttachment[]
  ): Promise<void> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    const compiledSubject = Handlebars.compile(template.subject);
    const compiledHtml = Handlebars.compile(template.htmlTemplate);

    const message: EmailMessage = {
      to,
      from: process.env.REACT_APP_EMAIL_FROM || 'noreply@mia.vn',
      subject: compiledSubject(variables),
      html: compiledHtml(variables),
      attachments,
    };

    await this.sendEmail(message);
  }

  public async generateWeeklyReport(
    recipients: string[],
    weekData: any
  ): Promise<void> {
    const variables = {
      weekNumber: weekData.weekNumber,
      year: weekData.year,
      totalOrders: weekData.totalOrders,
      revenue: weekData.revenue.toLocaleString('vi-VN'),
      topCarriers: weekData.topCarriers,
      ordersByStatus: weekData.ordersByStatus,
      charts: await this.generateCharts(weekData),
      reportDate: new Date().toLocaleDateString('vi-VN'),
    };

    // Generate PDF attachment
    const pdfBuffer = await this.generateReportPDF('weekly', variables);
    const attachments: EmailAttachment[] = [
      {
        filename: `bao-cao-tuan-${weekData.weekNumber}-${weekData.year}.pdf`,
        content: pdfBuffer,
        type: 'application/pdf',
      },
    ];

    await this.sendTemplatedEmail(
      'weekly_report',
      recipients,
      variables,
      attachments
    );
  }

  public async generateMonthlyReport(
    recipients: string[],
    monthData: any
  ): Promise<void> {
    const variables = {
      month: monthData.month,
      year: monthData.year,
      monthlyStats: monthData.stats,
      growthAnalysis: monthData.growth,
      recommendations: monthData.recommendations,
      trends: await this.generateTrendAnalysis(monthData),
      reportDate: new Date().toLocaleDateString('vi-VN'),
    };

    const pdfBuffer = await this.generateReportPDF('monthly', variables);
    const attachments: EmailAttachment[] = [
      {
        filename: `bao-cao-thang-${monthData.month}-${monthData.year}.pdf`,
        content: pdfBuffer,
        type: 'application/pdf',
      },
    ];

    await this.sendTemplatedEmail(
      'monthly_report',
      recipients,
      variables,
      attachments
    );
  }

  private async generateCharts(data: any): Promise<string[]> {
    // Mock chart generation - integrate with Chart.js or similar
    return [
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    ];
  }

  private async generateTrendAnalysis(data: any): Promise<any> {
    // Mock trend analysis - integrate with analytics service
    return {
      growth: '+15%',
      bestPerformingRoute: 'Hà Nội - TP.HCM',
      costOptimization: '12%',
      customerSatisfaction: '4.8/5',
    };
  }

  private async generateReportPDF(type: string, data: any): Promise<Buffer> {
    // Mock PDF generation - integrate with puppeteer or jsPDF
    const mockPdf = Buffer.from('Mock PDF content');
    return mockPdf;
  }
}
