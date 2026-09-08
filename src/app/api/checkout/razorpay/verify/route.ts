import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import { sendOrderConfirmationEmail } from "@/lib/resend";
import { PaymentStatus, OrderStatus } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = body;

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required." }, { status: 400 });
    }

    // Verify cryptographic signature if live keys are present
    const isValid = verifyRazorpaySignature(
      razorpayOrderId || "",
      razorpayPaymentId || "",
      razorpaySignature || ""
    );

    if (!isValid) {
      return NextResponse.json({ error: "Invalid payment signature verification failed." }, { status: 400 });
    }

    // Execute update in PostgreSQL (pooled connection safe)
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        shippingAddress: true,
        coupon: true,
        user: true,
      },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (existingOrder.paymentStatus === PaymentStatus.COMPLETED) {
      return NextResponse.json({
        success: true,
        orderId: existingOrder.id,
        orderNumber: existingOrder.orderNumber,
      });
    }

    // 1. Update Payment Record
    await prisma.payment.updateMany({
      where: { orderId: existingOrder.id },
      data: {
        status: PaymentStatus.COMPLETED,
        razorpayPaymentId: razorpayPaymentId || `pay_mock_${Date.now()}`,
        razorpaySignature: razorpaySignature || "mock_signature",
      },
    });

    // 2. Decrement Stock for all purchased items
    for (const item of existingOrder.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
    }

    // 3. Increment coupon usage if applied
    if (existingOrder.couponId) {
      await prisma.coupon.update({
        where: { id: existingOrder.couponId },
        data: {
          usedCount: {
            increment: 1,
          },
        },
      });
    }

    // 4. Update Order Status
    const updatedOrder = await prisma.order.update({
      where: { id: existingOrder.id },
      data: {
        status: OrderStatus.PROCESSING,
        paymentStatus: PaymentStatus.COMPLETED,
      },
      include: {
        items: true,
        shippingAddress: true,
        user: true,
      },
    });



    // 5. Dispatch Resend Transactional Email
    try {
      await sendOrderConfirmationEmail({
        orderNumber: updatedOrder.orderNumber,
        customerName: updatedOrder.user?.name || "Customer",
        customerEmail: updatedOrder.user?.email || session.user?.email || "customer@ecommerce.com",
        items: updatedOrder.items.map((i) => ({
          productName: i.productName,
          quantity: i.quantity,
          price: Number(i.price),
        })),
        finalAmount: Number(updatedOrder.finalAmount),
        paymentMethod: updatedOrder.paymentMethod,
        shippingAddress: {
          street: updatedOrder.shippingAddress.street,
          city: updatedOrder.shippingAddress.city,
          state: updatedOrder.shippingAddress.state,
          postalCode: updatedOrder.shippingAddress.postalCode,
        },
      });
    } catch (emailErr) {
      console.warn("Could not dispatch confirmation email:", emailErr);
    }

    return NextResponse.json({
      success: true,
      orderId: updatedOrder.id,
      orderNumber: updatedOrder.orderNumber,
    });
  } catch (error: any) {
    console.error("Payment verification error:", error);
    return NextResponse.json({ error: error.message || "Payment verification failed." }, { status: 500 });
  }
}
