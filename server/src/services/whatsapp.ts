/**
 * Modular WhatsApp Alert Service Hook
 * Pre-configured for Meta WhatsApp Cloud API / Twilio
 * Falls back to structured system logging in development/staging.
 */

export interface WhatsAppAlertPayload {
  toPhone: string;
  templateName: 'SOS_DISPATCH_ALERT' | 'QUOTE_RECEIVED' | 'ORDER_OUT_FOR_DELIVERY' | 'DELIVERY_OTP';
  recipientName: string;
  parameters: Record<string, string | number>;
}

export class WhatsAppService {
  private static isEnabled = process.env.WHATSAPP_ENABLED === 'true';
  private static apiUrl = process.env.WHATSAPP_API_URL || '';
  private static apiToken = process.env.WHATSAPP_API_TOKEN || '';

  /**
   * Send WhatsApp notification or log alert cleanly
   */
  public static async sendAlert(payload: WhatsAppAlertPayload): Promise<boolean> {
    const formattedPhone = this.normalizeIndianPhone(payload.toPhone);
    const messageBody = this.renderMessage(payload);

    console.log(`\n======================================================`);
    console.log(`📱 [WHATSAPP HOOK] Alert to ${formattedPhone} (${payload.recipientName})`);
    console.log(`   Template: ${payload.templateName}`);
    console.log(`   Message:\n   ${messageBody.replace(/\n/g, '\n   ')}`);
    console.log(`======================================================\n`);

    if (!this.isEnabled || !this.apiUrl || !this.apiToken) {
      // In dev mode, return true after logging
      return true;
    }

    try {
      // Plug into Meta WhatsApp Cloud API
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: formattedPhone,
          type: 'text',
          text: { body: messageBody }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ WhatsApp API Error:', errorText);
        return false;
      }

      return true;
    } catch (error) {
      console.error('❌ Failed to dispatch WhatsApp API call:', error);
      return false;
    }
  }

  /**
   * Helper template compiler
   */
  private static renderMessage(payload: WhatsAppAlertPayload): string {
    const { templateName, recipientName, parameters } = payload;

    switch (templateName) {
      case 'SOS_DISPATCH_ALERT':
        return `🚨 *EMERGENCY SOS ALERT - SHORTEDGE*\n` +
          `Namaste ${recipientName},\n` +
          `You have a new emergency dispatch request!\n` +
          `• Booking: ${parameters.bookingNumber}\n` +
          `• Service: ${parameters.categoryName}\n` +
          `• Location: ${parameters.pickupAddress}\n` +
          `• Start OTP: ${parameters.startOtp}\n` +
          `Open your Vendor App to accept immediately: ${parameters.vendorPortalUrl || 'http://localhost:3001'}`;

      case 'QUOTE_RECEIVED':
        return `💬 *NEW QUOTE RECEIVED - SHORTEDGE*\n` +
          `Namaste ${recipientName},\n` +
          `Vendor *${parameters.vendorName}* submitted an itemized quote for your RFQ #${parameters.rfqNumber}.\n` +
          `• Total Estimate: ₹${parameters.totalAmount}\n` +
          `• Timeline: ${parameters.estimatedDays} days\n` +
          `Compare quotes and negotiate now: ${parameters.clientUrl || 'http://localhost:3000'}`;

      case 'ORDER_OUT_FOR_DELIVERY':
        return `🚚 *ORDER OUT FOR DELIVERY - SHORTEDGE*\n` +
          `Namaste ${recipientName},\n` +
          `Your order #${parameters.orderNumber} is on the way!\n` +
          `• Delivery Partner: ${parameters.partnerName}\n` +
          `• Share this OTP upon arrival: *${parameters.deliveryOtp}*`;

      case 'DELIVERY_OTP':
        return `🔐 *YOUR VERIFICATION OTP - SHORTEDGE*\n` +
          `Namaste ${recipientName},\n` +
          `Your verification code for service #${parameters.bookingNumber} is: *${parameters.otp}*.\n` +
          `Do not share this OTP until service is physically completed/fuel delivered.`;

      default:
        return `Namaste ${recipientName}, you have an update regarding your ShortEdge service.`;
    }
  }

  private static normalizeIndianPhone(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10) {
      return `91${digits}`;
    }
    return digits;
  }
}
