import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { code, orderAmount } = await req.json();

    if (!code) {
      return NextResponse.json({ error: "Coupon code is required" }, { status: 400 });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase().trim() },
    });

    if (!coupon || !coupon.isActive) {
      return NextResponse.json({ error: "Invalid or expired coupon code" }, { status: 404 });
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return NextResponse.json({ error: "This coupon has expired" }, { status: 400 });
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json({ error: "Coupon usage limit reached" }, { status: 400 });
    }

    const amount = Number(orderAmount) || 0;
    const minOrder = Number(coupon.minOrderValue) || 0;

    if (amount < minOrder) {
      return NextResponse.json(
        {
          error: `Minimum order amount of ₹${minOrder.toLocaleString("en-IN")} required for this coupon.`,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      coupon: {
        code: coupon.code,
        discountPercent: coupon.discountPercent,
        discountAmount: coupon.discountAmount ? Number(coupon.discountAmount) : null,
        maxDiscount: coupon.maxDiscount ? Number(coupon.maxDiscount) : null,
        minOrderValue: minOrder,
      },
    });
  } catch (error) {
    console.error("Coupon validation error:", error);
    return NextResponse.json({ error: "Failed to validate coupon" }, { status: 500 });
  }
}
