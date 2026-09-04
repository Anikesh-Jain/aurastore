import React from "react";
import { AdminDashboardClient } from "@/components/admin/AdminDashboardClient";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  // Aggregate Metrics
  const [totalProducts, totalOrders, totalCustomers, completedOrders] = await Promise.all([
    prisma.product.count({ where: { isActive: true } }),
    prisma.order.count(),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.order.findMany({
      where: { paymentStatus: "COMPLETED" },
      select: { finalAmount: true },
    }),
  ]);

  const totalRevenue = completedOrders.reduce((sum, ord) => sum + Number(ord.finalAmount), 0);

  // Recent Orders
  const recentOrdersData = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      items: { select: { id: true } },
    },
  });

  const recentOrders = recentOrdersData.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    customerName: o.user?.name || o.user?.email || "Customer",
    totalAmount: Number(o.finalAmount),
    status: o.status,
    paymentStatus: o.paymentStatus,
    createdAt: o.createdAt.toISOString(),
    itemCount: o.items.length,
  }));

  // Low stock products
  const lowStock = await prisma.product.findMany({
    where: { stock: { lte: 10 }, isActive: true },
    take: 5,
    select: { id: true, name: true, stock: true, price: true, slug: true },
    orderBy: { stock: "asc" },
  });

  const lowStockProducts = lowStock.map((p) => ({
    id: p.id,
    name: p.name,
    stock: p.stock,
    price: Number(p.price),
    slug: p.slug,
  }));

  // Generate monthly revenue trend mock/real data
  const chartData = [
    { month: "Apr", revenue: 45000, orders: 12 },
    { month: "May", revenue: 68000, orders: 18 },
    { month: "Jun", revenue: 92000, orders: 24 },
    { month: "Jul", revenue: 125000, orders: 35 },
    { month: "Aug", revenue: 180000, orders: 48 },
    { month: "Sep", revenue: totalRevenue > 0 ? totalRevenue : 210000, orders: totalOrders > 0 ? totalOrders : 54 },
  ];

  return (
    <AdminDashboardClient
      stats={{
        totalRevenue,
        totalOrders,
        totalProducts,
        totalCustomers,
      }}
      chartData={chartData}
      recentOrders={recentOrders}
      lowStockProducts={lowStockProducts}
    />
  );
}

