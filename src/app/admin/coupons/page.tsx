import React from "react";
import { AdminCouponsClient } from "@/components/admin/AdminCouponsClient";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminCouponsPage() {
  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
  });

  const serializableCoupons = coupons.map((c) => ({
    id: c.id,
    code: c.code,
    discountPercent: c.discountPercent,
    discountAmount: c.discountAmount ? Number(c.discountAmount) : null,
    minOrderValue: Number(c.minOrderValue),
    maxDiscount: c.maxDiscount ? Number(c.maxDiscount) : null,
    usageLimit: c.usageLimit,
    usedCount: c.usedCount,
    expiresAt: c.expiresAt ? c.expiresAt.toISOString() : null,
    isActive: c.isActive,
  }));

  return <AdminCouponsClient initialCoupons={serializableCoupons} />;
}

