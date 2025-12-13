// src/services/notifications/telegramService.ts
import TelegramBot from 'node-telegram-bot-api';
import { Order } from '@/services/googleSheets/ordersService';

export interface TelegramMessage {
  chatId: string;
  message: string;
  options?: TelegramBot.SendMessageOptions;
}

export interface TelegramNotificationTemplate {
  id: string;
  name: string;
  template: string;
  variables: string[];
}

export class TelegramNotificationService {
  private bot: TelegramBot;
  private webhookUrl: string;
  private templates: Map<string, TelegramNotificationTemplate> = new Map();

  constructor(token: string, webhookUrl?: string) {
    this.bot = new TelegramBot(token, { polling: !webhookUrl });
    this.webhookUrl = webhookUrl || '';
    this.initializeTemplates();
    this.setupCommands();

    if (webhookUrl) {
      this.setupWebhook();
    }
  }

  private async setupWebhook(): Promise<void> {
    try {
      await this.bot.setWebHook(`${this.webhookUrl}/webhook/telegram`);
      console.log('✅ Telegram webhook setup successful');
    } catch (error) {
      console.error('❌ Telegram webhook setup failed:', error);
    }
  }

  private initializeTemplates(): void {
    const templates: TelegramNotificationTemplate[] = [
      {
        id: 'order_created',
        name: 'Đơn hàng được tạo',
        template: `
🆕 *Đơn hàng mới được tạo*

📦 Mã đơn: \`{{orderId}}\`
👤 Khách hàng: {{customerName}}
📱 SĐT: {{customerPhone}}
📍 Từ: {{pickupAddress}}
📍 Đến: {{deliveryAddress}}
💰 Ước tính: {{estimatedCost}} VND
📅 Ngày tạo: {{createdAt}}

[Xem chi tiết]({{detailUrl}})
        `,
        variables: [
          'orderId',
          'customerName',
          'customerPhone',
          'pickupAddress',
          'deliveryAddress',
          'estimatedCost',
          'createdAt',
          'detailUrl',
        ],
      },
      {
        id: 'order_confirmed',
        name: 'Đơn hàng được xác nhận',
        template: `
✅ *Đơn hàng đã được xác nhận*

📦 Mã đơn: \`{{orderId}}\`
🚛 Nhà vận chuyển: {{carrierName}}
📅 Thời gian lấy hàng: {{scheduledPickup}}
💰 Chi phí: {{actualCost}} VND

[Theo dõi đơn hàng]({{trackingUrl}})
        `,
        variables: [
          'orderId',
          'carrierName',
          'scheduledPickup',
          'actualCost',
          'trackingUrl',
        ],
      },
      {
        id: 'order_pickup',
        name: 'Đã lấy hàng',
        template: `
📤 *Đã lấy hàng thành công*

📦 Mã đơn: \`{{orderId}}\`
📅 Thời gian lấy: {{actualPickup}}
🚛 Đang vận chuyển đến: {{deliveryAddress}}
⏱️ Dự kiến giao: {{estimatedDelivery}}

[Theo dõi real-time]({{trackingUrl}})
        `,
        variables: [
          'orderId',
          'actualPickup',
          'deliveryAddress',
          'estimatedDelivery',
          'trackingUrl',
        ],
      },
      {
        id: 'order_delivered',
        name: 'Đã giao hàng',
        template: `
🎉 *Giao hàng thành công*

📦 Mã đơn: \`{{orderId}}\`
📅 Thời gian giao: {{actualDelivery}}
👤 Người nhận: {{receiverName}}
📋 Ghi chú: {{deliveryNotes}}

Cảm ơn bạn đã sử dụng dịch vụ MIA! 🙏
        `,
        variables: [
          'orderId',
          'actualDelivery',
          'receiverName',
          'deliveryNotes',
        ],
      },
      {
        id: 'daily_summary',
        name: 'Tổng kết ngày',
        template: `
📊 *Báo cáo cuối ngày* - {{date}}

📦 Tổng đơn hàng: {{totalOrders}}
✅ Đã hoàn thành: {{completedOrders}}
🚛 Đang vận chuyển: {{inTransitOrders}}
⏳ Chờ xử lý: {{pendingOrders}}
💰 Doanh thu: {{totalRevenue}} VND

📈 [Xem báo cáo chi tiết]({{reportUrl}})
        `,
        variables: [
          'date',
          'totalOrders',
          'completedOrders',
          'inTransitOrders',
          'pendingOrders',
          'totalRevenue',
          'reportUrl',
        ],
      },
    ];

    templates.forEach((template) => {
      this.templates.set(template.id, template);
    });
  }

  private setupCommands(): void {
    // Help command
    this.bot.onText(/\/help/, (msg) => {
      const chatId = msg.chat.id;
      const helpMessage = `
🤖 *MIA Logistics Bot Commands*

📊 /status - Trạng thái hệ thống
📦 /orders - Danh sách đơn hàng
🔍 /track [mã đơn] - Theo dõi đơn hàng
📈 /report - Báo cáo hôm nay
⚙️ /settings - Cài đặt thông báo
❓ /help - Hiển thị trợ giúp

Liên hệ hỗ trợ: @mia_support
      `;

      this.bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
    });

    // Status command
    this.bot.onText(/\/status/, async (msg) => {
      const chatId = msg.chat.id;
      try {
        const status = await this.getSystemStatus();
        this.bot.sendMessage(chatId, status, { parse_mode: 'Markdown' });
      } catch (error) {
        this.bot.sendMessage(chatId, '❌ Lỗi khi lấy trạng thái hệ thống');
      }
    });

    // Track order command
    this.bot.onText(/\/track (.+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const orderId = match?.[1];

      if (!orderId) {
        this.bot.sendMessage(
          chatId,
          '❌ Vui lòng nhập mã đơn hàng. Ví dụ: /track ORD-123'
        );
        return;
      }

      try {
        const orderInfo = await this.getOrderInfo(orderId);
        this.bot.sendMessage(chatId, orderInfo, { parse_mode: 'Markdown' });
      } catch (error) {
        this.bot.sendMessage(chatId, `❌ Không tìm thấy đơn hàng: ${orderId}`);
      }
    });

    // Settings command
    this.bot.onText(/\/settings/, (msg) => {
      const chatId = msg.chat.id;
      const keyboard = {
        inline_keyboard: [
          [
            { text: '🔔 Bật thông báo', callback_data: 'enable_notifications' },
            {
              text: '🔕 Tắt thông báo',
              callback_data: 'disable_notifications',
            },
          ],
          [
            { text: '📊 Báo cáo hàng ngày', callback_data: 'daily_reports' },
            { text: '📈 Báo cáo hàng tuần', callback_data: 'weekly_reports' },
          ],
          [
            {
              text: '⚙️ Tùy chỉnh nâng cao',
              callback_data: 'advanced_settings',
            },
          ],
        ],
      };

      this.bot.sendMessage(
        chatId,
        '⚙️ *Cài đặt thông báo*\n\nChọn tùy chọn bên dưới:',
        {
          parse_mode: 'Markdown',
          reply_markup: keyboard,
        }
      );
    });

    // Handle callback queries
    this.bot.on('callback_query', async (callbackQuery) => {
      const action = callbackQuery.data;
      const chatId = callbackQuery.message?.chat.id;

      if (!chatId) return;

      switch (action) {
        case 'enable_notifications':
          await this.updateUserSettings(chatId.toString(), {
            notifications: true,
          });
          this.bot.answerCallbackQuery(callbackQuery.id, {
            text: '✅ Đã bật thông báo',
          });
          break;
        case 'disable_notifications':
          await this.updateUserSettings(chatId.toString(), {
            notifications: false,
          });
          this.bot.answerCallbackQuery(callbackQuery.id, {
            text: '🔕 Đã tắt thông báo',
          });
          break;
        default:
          this.bot.answerCallbackQuery(callbackQuery.id, {
            text: 'Tính năng đang phát triển',
          });
      }
    });
  }

  public async sendOrderNotification(
    chatId: string,
    templateId: string,
    order: Order,
    additionalData: Record<string, any> = {}
  ): Promise<void> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    const variables = {
      orderId: order.orderId,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      pickupAddress: order.pickupAddress,
      deliveryAddress: order.deliveryAddress,
      estimatedCost: order.estimatedCost?.toLocaleString('vi-VN'),
      actualCost: order.actualCost?.toLocaleString('vi-VN'),
      createdAt: new Date(order.createdAt).toLocaleDateString('vi-VN'),
      carrierName: order.carrierName || 'Chưa chọn',
      status: this.getStatusText(order.status),
      ...additionalData,
    };

    const message = this.interpolateTemplate(template.template, variables);

    const options: TelegramBot.SendMessageOptions = {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '📍 Theo dõi',
              url: `${process.env.REACT_APP_BASE_URL}/tracking/${order.orderId}`,
            },
            { text: '📞 Liên hệ', callback_data: `contact_${order.orderId}` },
          ],
        ],
      },
    };

    try {
      await this.bot.sendMessage(chatId, message, options);
    } catch (error) {
      console.error('Error sending Telegram notification:', error);
      throw error;
    }
  }

  public async sendBulkNotification(
    chatIds: string[],
    message: string,
    options?: TelegramBot.SendMessageOptions
  ): Promise<void> {
    const promises = chatIds.map((chatId) =>
      this.bot.sendMessage(chatId, message, options).catch((error) => {
        console.error(`Failed to send message to ${chatId}:`, error);
        return null;
      })
    );

    await Promise.allSettled(promises);
  }

  public async sendDocument(
    chatId: string,
    document: Buffer,
    filename: string,
    caption?: string
  ): Promise<void> {
    try {
      await this.bot.sendDocument(chatId, document, {
        filename,
        caption,
      });
    } catch (error) {
      console.error('Error sending document:', error);
      throw error;
    }
  }

  private interpolateTemplate(
    template: string,
    variables: Record<string, any>
  ): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return variables[key] || match;
    });
  }

  private getStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      PENDING: '⏳ Chờ xử lý',
      CONFIRMED: '✅ Đã xác nhận',
      PICKUP: '📤 Đang lấy hàng',
      IN_TRANSIT: '🚛 Đang vận chuyển',
      DELIVERED: '✅ Đã giao',
      CANCELLED: '❌ Đã hủy',
    };
    return statusMap[status] || status;
  }

  private async getSystemStatus(): Promise<string> {
    // Mock system status - in real app, get from monitoring service
    return `
🔧 *Trạng thái hệ thống MIA*

✅ API Server: Hoạt động bình thường
✅ Database: Kết nối ổn định
✅ Google Maps: Hoạt động
✅ Email Service: Hoạt động
🔄 Uptime: 99.9%

📊 Thống kê 24h qua:
- Đơn hàng xử lý: 156
- Thông báo gửi: 423
- Thời gian phản hồi: 0.8s

Cập nhật lúc: ${new Date().toLocaleString('vi-VN')}
    `;
  }

  private async getOrderInfo(orderId: string): Promise<string> {
    // Mock order info - integrate with actual order service
    return `
📦 *Thông tin đơn hàng: ${orderId}*

👤 Khách hàng: Nguyễn Văn A
📱 SĐT: 0901234567
📍 Từ: Hà Nội
📍 Đến: TP.HCM
🚛 Nhà VC: Giao Hàng Nhanh
💰 Chi phí: 250,000 VND

📊 Trạng thái: 🚛 Đang vận chuyển
📅 Dự kiến giao: 19/08/2025 10:00

🔄 Lịch sử:
- 18/08 08:00 - Đã lấy hàng
- 18/08 14:30 - Đang vận chuyển
- 19/08 10:00 - Dự kiến giao hàng
    `;
  }

  private async updateUserSettings(
    chatId: string,
    settings: Record<string, any>
  ): Promise<void> {
    // Mock settings update - integrate with user service
    console.log(`Updating settings for ${chatId}:`, settings);
  }

  public processWebhook(body: any): void {
    this.bot.processUpdate(body);
  }

  public async close(): Promise<void> {
    await this.bot.close();
  }
}
