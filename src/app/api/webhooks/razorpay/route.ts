import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { sendOrderConfirmationEmail } from "@/lib/resend";
import { PaymentStatus, OrderStatus } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const headersList = await headers();
    const signature = headersList.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing x-razorpay-signature header" }, { status: 400 });
    }

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "";

    // Verify SHA-256 HMAC
    const isValid = verifyWebhookSignature(rawBody, signature, webhookSecret);
    if (!isValid) {
      console.error("Razorpay webhook signature verification failed.");
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    console.log(`🔔 Razorpay Webhook Event Received: ${event.event}`);

    if (event.event === "payment.captured" || event.event === "order.paid") {
      const paymentEntity = event.payload.payment.entity;
      const razorpayOrderId = paymentEntity.order_id;
      const razorpayPaymentId = paymentEntity.id;

      if (!razorpayOrderId) {
        return NextResponse.json({ message: "No razorpay order_id in event payload" }, { status: 200 });
      }

      // Find order by razorpayOrderId
      const paymentRecord = await prisma.payment.findUnique({
        where: { razorpayOrderId },
        include: {
          order: {
            include: {
              items: true,
              shippingAddress: true,
              user: true,
              coupon: true,
            },
          },
        },
      });

      if (!paymentRecord || !paymentRecord.order) {
        console.warn(`Webhook: Order for razorpayOrderId ${razorpayOrderId} not found.`);
        return NextResponse.json({ message: "Order not found" }, { status: 200 });
      }

      const order = paymentRecord.order;

      // Idempotency check: if already completed, do not double-decrement stock
      if (order.paymentStatus === PaymentStatus.COMPLETED) {
        return NextResponse.json({ message: "Order already processed (idempotent)" }, { status: 200 });
      }

      // Execute transactional update
      await prisma.$transaction(async (tx) => {
        // 1. Update Payment
        await tx.payment.update({
          where: { id: paymentRecord.id },
          data: {
            status: PaymentStatus.COMPLETED,
            razorpayPaymentId,
            webhookReceivedAt: new Date(),
          },
        });

        // 2. Decrement Stock
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });
        }

        // 3. Update Coupon count if applied
        if (order.couponId) {
          await tx.coupon.update({
            where: { id: order.couponId },
            data: {
              usedCount: {
                increment: 1,
              },
            },
          });
        }

        // 4. Update Order
        await tx.order.update({
          where: { id: order.id },
          data: {
            status: OrderStatus.PROCESSING,
            paymentStatus: PaymentStatus.COMPLETED,
          },
        });
      });

      // Dispatch confirmation email
      try {
        await sendOrderConfirmationEmail({
          orderNumber: order.orderNumber,
          customerName: order.user?.name || "Customer",
          customerEmail: order.user?.email || paymentEntity.email || "customer@ecommerce.com",
          items: order.items.map((i) => ({
            productName: i.productName,
            quantity: i.quantity,
            price: Number(i.price),
          })),
          finalAmount: Number(order.finalAmount),
          paymentMethod: order.paymentMethod,
          shippingAddress: {
            street: order.shippingAddress.street,
            city: order.shippingAddress.city,
            state: order.shippingAddress.state,
            postalCode: order.shippingAddress.postalCode,
          },
        });
      } catch (err) {
        console.warn("Webhook email dispatch failed:", err);
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error("Razorpay webhook handler error:", error);
    return NextResponse.json({ error: error.message || "Webhook handling failed" }, { status: 500 });
  }
}
