import React from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  CreditCard,
  ArrowLeft,
  XCircle,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

interface OrderTrackingProps {
  params: Promise<{ id: string }>;
}

export default async function OrderTrackingPage({ params }: OrderTrackingProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/orders");
  }

  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      shippingAddress: true,
      payment: true,
      coupon: true,
    },
  });

  if (!order) {
    notFound();
  }

  // Security check: Only the order owner or an ADMIN can view the order
  if (order.userId !== session.user.id && session.user.role !== "ADMIN") {
    redirect("/");
  }

  const steps = [
    { key: "PENDING", label: "Order Placed", icon: Clock, desc: "Order received & pending payment/confirmation" },
    { key: "PROCESSING", label: "Processing & Packing", icon: Package, desc: "Payment verified, gear packed in warehouse" },
    { key: "SHIPPED", label: "Shipped & In Transit", icon: Truck, desc: "Courier picked up parcel and on the way" },
    { key: "DELIVERED", label: "Delivered", icon: CheckCircle2, desc: "Successfully delivered to your address" },
  ];

  const statusHierarchy: { [key: string]: number } = {
    PENDING: 1,
    PROCESSING: 2,
    SHIPPED: 3,
    DELIVERED: 4,
    CANCELLED: -1,
  };

  const currentLevel = statusHierarchy[order.status] || 1;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        {/* Top bar */}
        <div className="flex items-center justify-between pb-6 border-b mb-8">
          <Link href="/orders" className="text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Back to Orders
          </Link>
          <div className="flex items-center gap-2">
            <Badge
              variant={
                order.status === "DELIVERED"
                  ? "success"
                  : order.status === "CANCELLED"
                  ? "destructive"
                  : "default"
              }
              className="text-xs px-3 py-1 font-bold"
            >
              STATUS: {order.status}
            </Badge>
          </div>
        </div>

        <div className="space-y-8">
          {/* Order Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-6 rounded-2xl border shadow-sm">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Order Tracking</p>
              <h1 className="text-2xl font-extrabold tracking-tight mt-1 text-primary font-mono">
                #{order.orderNumber}
              </h1>
              <p className="text-xs text-muted-foreground mt-1">
                Placed on {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Total Paid</p>
              <p className="text-2xl font-extrabold text-foreground">{formatPrice(Number(order.finalAmount))}</p>
              <Badge variant="outline" className="text-[11px] mt-1">
                Payment: {order.paymentStatus} ({order.paymentMethod})
              </Badge>
            </div>
          </div>

          {/* Timeline Tracker */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Truck className="w-5 h-5 text-primary" /> Delivery Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              {order.status === "CANCELLED" ? (
                <div className="p-6 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive flex items-center gap-3">
                  <XCircle className="w-6 h-6 shrink-0" />
                  <div>
                    <h4 className="font-bold text-sm">Order Cancelled</h4>
                    <p className="text-xs">This order has been cancelled and will not be processed for delivery.</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
                  {steps.map((step, idx) => {
                    const stepLevel = statusHierarchy[step.key];
                    const isCompleted = currentLevel >= stepLevel;
                    const isCurrent = currentLevel === stepLevel;
                    const Icon = step.icon;

                    return (
                      <div
                        key={step.key}
                        className={`p-4 rounded-xl border transition flex flex-col justify-between ${
                          isCurrent
                            ? "bg-primary/10 border-primary shadow-sm"
                            : isCompleted
                            ? "bg-muted/40 border-border"
                            : "opacity-50 bg-background"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                              isCompleted
                                ? "bg-primary text-primary-foreground shadow"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] font-bold text-muted-foreground">0{idx + 1}</span>
                        </div>

                        <div>
                          <h4 className="font-bold text-xs sm:text-sm text-foreground">{step.label}</h4>
                          <p className="text-[11px] text-muted-foreground mt-1 leading-snug">{step.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ordered Items Breakdown */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" /> Package Contents ({order.items.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y border rounded-xl overflow-hidden bg-card">
                {order.items.map((item) => (
                  <div key={item.id} className="p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {item.productImage && (
                        <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-muted shrink-0 border">
                          <Image src={item.productImage} alt={item.productName} fill className="object-cover" />
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-sm">{item.productName}</h4>
                        <p className="text-xs text-muted-foreground">
                          {formatPrice(Number(item.price))} &times; {item.quantity} units
                        </p>
                      </div>
                    </div>
                    <div className="font-bold text-sm text-right">
                      {formatPrice(Number(item.subtotal))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Invoice calculation */}
              <div className="pt-6 border-t mt-6 space-y-2 text-xs max-w-xs ml-auto">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="font-medium">{formatPrice(Number(order.totalAmount))}</span>
                </div>
                {Number(order.discountAmount) > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount ({order.coupon?.code || "PROMO"}):</span>
                    <span>-{formatPrice(Number(order.discountAmount))}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping:</span>
                  <span>{Number(order.shippingAmount) === 0 ? "FREE" : formatPrice(Number(order.shippingAmount))}</span>
                </div>
                <div className="flex justify-between font-bold text-base pt-2 border-t text-primary">
                  <span>Grand Total:</span>
                  <span>{formatPrice(Number(order.finalAmount))}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping & Payment Meta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" /> Delivery Destination
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-1">
                <p className="font-bold text-foreground text-sm">{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.street}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}</p>
                <p className="font-mono pt-1 text-foreground">Phone: {order.shippingAddress.phone}</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-primary" /> Payment Record
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-2">
                <div className="flex justify-between">
                  <span>Method:</span>
                  <span className="font-semibold text-foreground">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="font-semibold text-emerald-600">{order.paymentStatus}</span>
                </div>
                {order.payment?.razorpayPaymentId && (
                  <div className="flex justify-between font-mono">
                    <span>Razorpay ID:</span>
                    <span className="truncate max-w-[140px]">{order.payment.razorpayPaymentId}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

