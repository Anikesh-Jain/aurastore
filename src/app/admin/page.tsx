import React from "react";
import { AdminDashboardClient } from "@/components/admin/AdminDashboardClient";
import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

export const dynamic = "force-dynamic";

// Consolidated KPIs cached for 15s to eliminate redundant WAN roundtrips on rapid admin navigations
const getCachedKPIs = unstable_cache(
  async () => {
    const [result] = await prisma.$queryRaw<
      Array<{
        totalProducts: number;
        totalOrders: number;
        totalCustomers: number;
        totalRevenue: number;
      }>
    >`
      SELECT 
        (SELECT COUNT(*)::int FROM "Product" WHERE "isActive" = true) as "totalProducts",
        (SELECT COUNT(*)::int FROM "Order") as "totalOrders",
        (SELECT COUNT(*)::int FROM "User" WHERE "role" = 'CUSTOMER') as "totalCustomers",
        (SELECT COALESCE(SUM("finalAmount"), 0)::float FROM "Order" WHERE "paymentStatus" = 'COMPLETED') as "totalRevenue"
    `;
    return result || { totalProducts: 0, totalOrders: 0, totalCustomers: 0, totalRevenue: 0 };
  },
  ["admin-dashboard-kpis"],
  { revalidate: 15, tags: ["admin-kpis"] }
);

export default async function AdminDashboardPage() {
  // Execute consolidated KPIs alongside recent orders and low stock in parallel
  const [
    kpiData,
    recentOrdersData,
    lowStock,
  ] = await Promise.all([
    getCachedKPIs(),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        orderNumber: true,
        finalAmount: true,
        status: true,
        paymentStatus: true,
        createdAt: true,
        user: { select: { name: true, email: true } },
        _count: { select: { items: true } },
      },
    }),
    prisma.product.findMany({
      where: { stock: { lte: 10 }, isActive: true },
      take: 5,
      select: { id: true, name: true, stock: true, price: true, slug: true },
      orderBy: { stock: "asc" },
    }),
  ]);

  const totalRevenue = Number(kpiData.totalRevenue || 0);
  const totalOrders = Number(kpiData.totalOrders || 0);
  const totalProducts = Number(kpiData.totalProducts || 0);
  const totalCustomers = Number(kpiData.totalCustomers || 0);

  const recentOrders = recentOrdersData.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    customerName: o.user?.name || o.user?.email || "Customer",
    totalAmount: Number(o.finalAmount),
    status: o.status,
    paymentStatus: o.paymentStatus,
    createdAt: o.createdAt.toISOString(),
    itemCount: o._count.items,
  }));

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

