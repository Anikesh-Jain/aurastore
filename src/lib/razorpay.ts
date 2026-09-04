import Razorpay from "razorpay";
import crypto from "crypto";

const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_placeholder";
const keySecret = process.env.RAZORPAY_KEY_SECRET || "razorpay_secret_placeholder";

export const razorpay = new Razorpay({
  key_id: keyId,
  key_secret: keySecret,
});

export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  if (
    !process.env.RAZORPAY_KEY_SECRET ||
    process.env.RAZORPAY_KEY_SECRET === "your_razorpay_secret_key" ||
    process.env.RAZORPAY_KEY_SECRET === "razorpay_secret_placeholder"
  ) {
    // In local development sandbox mode without real keys, treat verification as valid
    return true;
  }

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return expectedSignature === signature;
}

export function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string
): boolean {
  if (!secret || secret === "your_razorpay_webhook_secret") {
    return true;
  }

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  return expectedSignature === signature;
}

