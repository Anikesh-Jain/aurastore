import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { razorpay } from "@/lib/razorpay";
import { PaymentMethod, PaymentStatus, OrderStatus } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    const body = await req.json();
    const { items, addressId, newAddress, couponCode, paymentMethod = "RAZORPAY" } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items in cart." }, { status: 400 });
    }

    // 1. Resolve or Create Address
    let shippingAddressId = addressId;
    if (!shippingAddressId && newAddress) {
      const createdAddress = await prisma.address.create({
        data: {
          userId: session.user.id,
          fullName: newAddress.fullName,
          phone: newAddress.phone,
          street: newAddress.street,
          city: newAddress.city,
          state: newAddress.state,
          postalCode: newAddress.postalCode,
          country: newAddress.country || "India",
          isDefault: false,
        },
      });
      shippingAddressId = createdAddress.id;
    }

    if (!shippingAddressId) {
      return NextResponse.json({ error: "Shipping address is required." }, { status: 400 });
    }

    // 2. Validate Items & Calculate Amounts from DB (Never trust client prices)
    const productIds = items.map((i: any) => i.id);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
    });

    if (dbProducts.length !== items.length) {
      return NextResponse.json(
        { error: "Some products in your cart are unavailable or removed." },
        { status: 400 }
      );
    }

    let subtotal = 0;
    const orderItemsData: any[] = [];

    for (const item of items) {
      const dbProd = dbProducts.find((p) => p.id === item.id);
      if (!dbProd) continue;

      if (dbProd.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${dbProd.name}. Available: ${dbProd.stock}` },
          { status: 400 }
        );
      }

      const unitPrice = dbProd.discountPrice ? Number(dbProd.discountPrice) : Number(dbProd.price);
      const itemSubtotal = unitPrice * item.quantity;
      subtotal += itemSubtotal;

      orderItemsData.push({
        productId: dbProd.id,
        productName: dbProd.name,
        productImage: item.image || null,
        price: unitPrice,
        quantity: item.quantity,
        subtotal: itemSubtotal,
      });
    }

    // 3. Validate Coupon
    let discountAmount = 0;
    let appliedCouponId: string | null = null;

    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase().trim() },
      });

      if (coupon && coupon.isActive && (!coupon.expiresAt || new Date(coupon.expiresAt) >= new Date())) {
        if (subtotal >= Number(coupon.minOrderValue)) {
          if (coupon.discountPercent) {
            discountAmount = (subtotal * coupon.discountPercent) / 100;
            if (coupon.maxDiscount && discountAmount > Number(coupon.maxDiscount)) {
              discountAmount = Number(coupon.maxDiscount);
            }
          } else if (coupon.discountAmount) {
            discountAmount = Number(coupon.discountAmount);
          }
          appliedCouponId = coupon.id;
        }
      }
    }

    const shippingAmount = subtotal >= 1999 ? 0 : 150;
    const finalAmount = Math.max(0, subtotal - discountAmount + shippingAmount);
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

    // 4. Create Razorpay Order if using Razorpay
    let razorpayOrderId = null;
    const isMock =
      !process.env.RAZORPAY_KEY_SECRET ||
      process.env.RAZORPAY_KEY_SECRET === "your_razorpay_secret_key" ||
      process.env.RAZORPAY_KEY_SECRET === "razorpay_secret_placeholder";

    if (paymentMethod === "RAZORPAY" && !isMock) {
      try {
        const rzpOrder = await razorpay.orders.create({
          amount: Math.round(finalAmount * 100), // Amount in paise
          currency: "INR",
          receipt: orderNumber,
          notes: {
            userId: session.user.id,
            orderNumber,
          },
        });
        razorpayOrderId = rzpOrder.id;
      } catch (rzpErr) {
        console.warn("Razorpay API call failed, generating sandbox order id:", rzpErr);
        razorpayOrderId = `order_mock_${Date.now()}`;
      }
    } else {
      razorpayOrderId = `order_mock_${Date.now()}`;
    }

    // 5. Create Pending Order in PostgreSQL
    const createdOrder = await prisma.order.create({
      data: {
        orderNumber,
        userId: session.user.id,
        totalAmount: subtotal,
        discountAmount,
        shippingAmount,
        finalAmount,
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        paymentMethod: paymentMethod === "COD" ? PaymentMethod.COD : PaymentMethod.RAZORPAY,
        shippingAddressId,
        couponId: appliedCouponId,
        items: {
          create: orderItemsData,
        },
        payment: {
          create: {
            method: paymentMethod === "COD" ? PaymentMethod.COD : PaymentMethod.RAZORPAY,
            status: PaymentStatus.PENDING,
            amount: finalAmount,
            razorpayOrderId,
          },
        },
      },
      include: {
        shippingAddress: true,
      },
    });

    return NextResponse.json({
      orderId: createdOrder.id,
      orderNumber: createdOrder.orderNumber,
      razorpayOrderId,
      amount: Math.round(finalAmount * 100), // in paise
      finalAmount,
      currency: "INR",
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_placeholder",
      isMock,
    });
  } catch (error: any) {
    console.error("Create order error:", error);
    return NextResponse.json({ error: error.message || "Failed to initialize order." }, { status: 500 });
  }
}

