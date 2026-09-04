"use client";

import React from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  ShoppingBag,
  Package,
  Users,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  PackageCheck,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface AdminDashboardClientProps {
  stats: {
    totalRevenue: number;
    totalOrders: number;
    totalProducts: number;
    totalCustomers: number;
  };
  chartData: Array<{ month: string; revenue: number; orders: number }>;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    customerName: string;
    totalAmount: number;
    status: string;
    paymentStatus: string;
    createdAt: string;
    itemCount: number;
  }>;
  lowStockProducts: Array<{
    id: string;
    name: string;
    stock: number;
    price: number;
    slug: string;
  }>;
}

export function AdminDashboardClient({
  stats,
  chartData,
  recentOrders,
  lowStockProducts,
}: AdminDashboardClientProps) {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time platform sales overview, inventory alerts, and order metrics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" asChild>
            <Link href="/admin/products/new">
              <Package className="w-4 h-4 mr-1.5" /> Add New Product
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
              Total Revenue
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold">{formatPrice(stats.totalRevenue)}</div>
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1 text-emerald-600">
              <TrendingUp className="w-3.5 h-3.5" /> Live Verified Razorpay Payments
            </p>
          </CardContent>
        </Card>

        {/* Total Orders */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
              Total Orders
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold">{stats.totalOrders}</div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Across all fulfillment stages
            </p>
          </CardContent>
        </Card>

        {/* Total Products */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
              Active Catalog
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center">
              <PackageCheck className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold">{stats.totalProducts}</div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Active products in database
            </p>
          </CardContent>
        </Card>

        {/* Total Customers */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
              Registered Users
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold">{stats.totalCustomers}</div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Customer accounts created
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts & Analytics */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-bold">Revenue & Sales Trends</CardTitle>
          <CardDescription>Monthly sales performance overview (₹ INR)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="month" fontSize={12} stroke="#888888" />
                <YAxis fontSize={12} stroke="#888888" />
                <Tooltip
                  formatter={(value: any) => [formatPrice(Number(value)), "Revenue"]}
                  contentStyle={{ backgroundColor: "rgba(0, 0, 0, 0.8)", borderRadius: "8px", color: "#fff" }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#2563eb"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRev)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Lower Grid: Recent Orders & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders (2 cols) */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold">Recent Store Orders</CardTitle>
              <CardDescription>Latest customer purchases requiring fulfillment</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/orders" className="text-xs text-primary gap-1">
                View All <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <p className="text-xs text-muted-foreground py-6 text-center">No orders recorded yet.</p>
            ) : (
              <div className="divide-y text-xs">
                {recentOrders.map((ord) => (
                  <div key={ord.id} className="py-3 flex items-center justify-between gap-4">
                    <div>
                      <Link href={`/admin/orders`} className="font-mono font-bold text-foreground hover:text-primary">
                        #{ord.orderNumber}
                      </Link>
                      <p className="text-muted-foreground mt-0.5">
                        {ord.customerName} &bull; {ord.itemCount} items &bull; {new Date(ord.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge
                        variant={
                          ord.status === "DELIVERED"
                            ? "success"
                            : ord.status === "CANCELLED"
                            ? "destructive"
                            : "default"
                        }
                        className="text-[10px] font-bold"
                      >
                        {ord.status}
                      </Badge>
                      <span className="font-bold text-foreground min-w-[4rem] text-right">
                        {formatPrice(ord.totalAmount)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Alerts (1 col) */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" /> Low Stock Alerts
            </CardTitle>
            <CardDescription>Products requiring inventory restocking</CardDescription>
          </CardHeader>
          <CardContent>
            {lowStockProducts.length === 0 ? (
              <p className="text-xs text-muted-foreground py-6 text-center">
                All catalog inventory levels are healthy!
              </p>
            ) : (
              <div className="space-y-3 text-xs">
                {lowStockProducts.map((prod) => (
                  <div
                    key={prod.id}
                    className="p-3 rounded-lg border bg-amber-500/5 border-amber-500/20 flex items-center justify-between gap-2"
                  >
                    <div>
                      <h4 className="font-bold text-foreground line-clamp-1">{prod.name}</h4>
                      <p className="text-muted-foreground">{formatPrice(prod.price)}</p>
                    </div>
                    <Badge variant="destructive" className="font-bold text-xs shrink-0">
                      {prod.stock === 0 ? "Out of Stock" : `${prod.stock} Left`}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

