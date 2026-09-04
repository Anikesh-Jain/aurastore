import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      code,
      discountPercent,
      discountAmount,
      minOrderValue = 0,
      maxDiscount,
      usageLimit,
      expiresAt,
    } = body;

    if (!code) {
      return NextResponse.json({ error: "Coupon code is required" }, { status: 400 });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase().trim(),
        discountPercent: discountPercent ? Number(discountPercent) : null,
        discountAmount: discountAmount ? Number(discountAmount) : null,
        minOrderValue: Number(minOrderValue),
        maxDiscount: maxDiscount ? Number(maxDiscount) : null,
        usageLimit: usageLimit ? Number(usageLimit) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive: true,
      },
    });

    return NextResponse.json({ coupon }, { status: 201 });
  } catch (error: any) {
    console.error("Coupon create error:", error);
    return NextResponse.json({ error: error.message || "Failed to create coupon" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Coupon ID required" }, { status: 400 });
    }

    await prisma.coupon.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Coupon delete error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete coupon" }, { status: 500 });
  }
}

