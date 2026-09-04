import React from "react";
import { AdminOrdersClient } from "@/components/admin/AdminOrdersClient";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: {
      user: { select: { name: true, email: true } },
      shippingAddress: true,
      items: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const serializableOrders = orders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    totalAmount: Number(o.totalAmount),
    discountAmount: Number(o.discountAmount),
    shippingAmount: Number(o.shippingAmount),
    finalAmount: Number(o.finalAmount),
    status: o.status,
    paymentStatus: o.paymentStatus,
    paymentMethod: o.paymentMethod,
    createdAt: o.createdAt.toISOString(),
    user: o.user,
    shippingAddress: o.shippingAddress,
    items: o.items.map((i) => ({
      id: i.id,
      productName: i.productName,
      productImage: i.productImage,
      price: Number(i.price),
      quantity: i.quantity,
      subtotal: Number(i.subtotal),
    })),
  }));

  return <AdminOrdersClient initialOrders={serializableOrders} />;
}

