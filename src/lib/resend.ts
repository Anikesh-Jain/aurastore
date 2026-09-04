import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY || "re_placeholder";
export const resend = new Resend(resendApiKey);

const fromEmail = process.env.EMAIL_FROM || "AuraStore <onboarding@resend.dev>";

export async function sendWelcomeEmail(to: string, name: string) {
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY.startsWith("re_placeholder")) {
    console.log(`✉️ [Mock Resend Email] Welcome email to ${to} (${name})`);
    return { success: true, mock: true };
  }

  try {
    const data = await resend.emails.send({
      from: fromEmail,
      to,
      subject: "Welcome to AuraStore! 🎉",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
          <h2 style="color: #2563eb; margin-top: 0;">Welcome to AuraStore, ${name}!</h2>
          <p style="font-size: 16px; color: #4b5563; line-height: 1.5;">
            Thank you for creating an account with us. You now have access to premium electronics, audio gear, and lifestyle products with instant tracking and exclusive offers.
          </p>
          <div style="background-color: #f3f4f6; padding: 16px; border-radius: 6px; margin: 24px 0;">
            <p style="margin: 0; font-weight: bold; color: #1f2937;">Special Welcome Gift:</p>
            <p style="margin: 4px 0 0 0; color: #4b5563;">Use coupon code <strong style="color: #2563eb;">WELCOME20</strong> at checkout for 20% off your first order over ₹2,000!</p>
          </div>
          <p style="font-size: 14px; color: #9ca3af; margin-top: 32px; border-top: 1px solid #e5e7eb; padding-top: 16px;">
            If you have any questions, our 24/7 customer support team is always here to assist you.
          </p>
        </div>
      `,
    });
    return { success: true, data };
  } catch (error) {
    console.error("Failed to send welcome email via Resend:", error);
    return { success: false, error };
  }
}

export async function sendOrderConfirmationEmail(order: {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: Array<{ productName: string; quantity: number; price: number | string }>;
  finalAmount: number | string;
  paymentMethod: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
  };
}) {
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY.startsWith("re_placeholder")) {
    console.log(`✉️ [Mock Resend Email] Order confirmation for #${order.orderNumber} to ${order.customerEmail}`);
    return { success: true, mock: true };
  }

  const itemsHtml = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #374151;">${item.productName}</td>
        <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; text-align: center; color: #374151;">x${item.quantity}</td>
        <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; text-align: right; font-weight: bold; color: #111827;">₹${Number(item.price).toLocaleString("en-IN")}</td>
      </tr>
    `
    )
    .join("");

  try {
    const data = await resend.emails.send({
      from: fromEmail,
      to: order.customerEmail,
      subject: `Order Confirmed: #${order.orderNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h2 style="color: #10b981; margin-top: 0;">Thank You for Your Order!</h2>
          <p style="color: #4b5563;">Hi ${order.customerName}, your order <strong>#${order.orderNumber}</strong> has been received and is being processed.</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
            <thead>
              <tr style="border-bottom: 2px solid #e5e7eb;">
                <th style="text-align: left; padding-bottom: 8px; color: #6b7280; font-size: 12px; text-transform: uppercase;">Product</th>
                <th style="text-align: center; padding-bottom: 8px; color: #6b7280; font-size: 12px; text-transform: uppercase;">Qty</th>
                <th style="text-align: right; padding-bottom: 8px; color: #6b7280; font-size: 12px; text-transform: uppercase;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding-top: 16px; font-weight: bold; text-align: right; color: #111827;">Total Amount:</td>
                <td style="padding-top: 16px; font-weight: bold; text-align: right; font-size: 18px; color: #2563eb;">₹${Number(order.finalAmount).toLocaleString("en-IN")}</td>
              </tr>
            </tfoot>
          </table>

          <div style="background-color: #f9fafb; padding: 16px; border-radius: 6px; margin: 24px 0;">
            <h4 style="margin: 0 0 8px 0; color: #1f2937;">Shipping Address</h4>
            <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.4;">
              ${order.shippingAddress.street},<br/>
              ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.postalCode}
            </p>
          </div>

          <p style="font-size: 13px; color: #9ca3af; text-align: center; margin-top: 32px;">
            AuraStore Marketplace &bull; Track your order anytime at our store portal.
          </p>
        </div>
      `,
    });
    return { success: true, data };
  } catch (error) {
    console.error("Failed to send order confirmation email via Resend:", error);
    return { success: false, error };
  }
}

export async function sendOrderStatusUpdateEmail(
  to: string,
  customerName: string,
  orderNumber: string,
  newStatus: string
) {
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY.startsWith("re_placeholder")) {
    console.log(`✉️ [Mock Resend Email] Status update for #${orderNumber} (${newStatus}) to ${to}`);
    return { success: true, mock: true };
  }

  try {
    const data = await resend.emails.send({
      from: fromEmail,
      to,
      subject: `Order #${orderNumber} Status Update: ${newStatus}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h2 style="color: #2563eb; margin-top: 0;">Order Status Update</h2>
          <p style="color: #4b5563;">Hi ${customerName},</p>
          <p style="color: #4b5563; font-size: 16px;">
            The status of your order <strong>#${orderNumber}</strong> has been updated to:
          </p>
          <div style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 8px 18px; border-radius: 9999px; font-weight: bold; font-size: 14px; margin: 12px 0 24px 0;">
            ${newStatus}
          </div>
          <p style="color: #6b7280; font-size: 14px;">
            You can view complete delivery tracking and live progress directly on your account dashboard.
          </p>
        </div>
      `,
    });
    return { success: true, data };
  } catch (error) {
    console.error("Failed to send order status email via Resend:", error);
    return { success: false, error };
  }
}

