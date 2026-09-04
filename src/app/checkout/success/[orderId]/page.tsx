import React from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Package, ArrowRight, Truck, Sparkles, MapPin } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

interface SuccessPageProps {
  params: Promise<{ orderId: string }>;
}

export default async function OrderSuccessPage({ params }: SuccessPageProps) {
  const { orderId } = await params;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      shippingAddress: true,
      payment: true,
    },
  });

  if (!order) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-12 max-w-3xl">
        <div className="text-center space-y-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Order Confirmed!</h1>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Thank you for shopping with AuraStore. Your order <strong>#{order.orderNumber}</strong> has been placed and is now being prepared for shipping.
          </p>
        </div>

        <Card className="shadow-lg border-border/80 overflow-hidden mb-8">
          <CardHeader className="bg-muted/40 border-b flex flex-row items-center justify-between py-4">
            <div>
              <p className="text-xs text-muted-foreground">Order ID</p>
              <CardTitle className="text-base font-mono font-bold text-primary">
                #{order.orderNumber}
              </CardTitle>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Placed On</p>
              <p className="text-xs font-semibold">{new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Ordered Items */}
            <div className="space-y-3">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Package className="w-4 h-4 text-primary" /> Ordered Items ({order.items.length})
              </h3>
              <div className="divide-y border rounded-xl overflow-hidden bg-card">
                {order.items.map((item) => (
                  <div key={item.id} className="p-3.5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {item.productImage && (
                        <div className="relative w-12 h-12 rounded-md overflow-hidden bg-muted shrink-0 border">
                          <Image src={item.productImage} alt={item.productName} fill className="object-cover" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-xs sm:text-sm line-clamp-1">{item.productName}</p>
                        <p className="text-xs text-muted-foreground">Quantity: {item.quantity}</p>
                      </div>
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-right">
                      {formatPrice(Number(item.subtotal))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Address & Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl border bg-muted/20 space-y-1">
                <h4 className="font-bold text-xs flex items-center gap-1.5 text-foreground uppercase tracking-wider">
                  <MapPin className="w-3.5 h-3.5 text-primary" /> Shipping Address
                </h4>
                <p className="text-xs font-semibold text-foreground pt-1">{order.shippingAddress.fullName}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {order.shippingAddress.street},<br />
                  {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}
                </p>
                <p className="text-xs text-muted-foreground font-mono">📞 {order.shippingAddress.phone}</p>
              </div>

              <div className="p-4 rounded-xl border bg-muted/20 space-y-2 text-xs">
                <h4 className="font-bold text-xs uppercase tracking-wider text-foreground">
                  Payment Summary
                </h4>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span>{formatPrice(Number(order.totalAmount))}</span>
                </div>
                {Number(order.discountAmount) > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Discount:</span>
                    <span>-{formatPrice(Number(order.discountAmount))}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping:</span>
                  <span>{Number(order.shippingAmount) === 0 ? "FREE" : formatPrice(Number(order.shippingAmount))}</span>
                </div>
                <div className="flex justify-between font-bold text-sm pt-2 border-t text-primary">
                  <span>Total Paid:</span>
                  <span>{formatPrice(Number(order.finalAmount))}</span>
                </div>
              </div>
            </div>

            {/* Email dispatch notice */}
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-xs text-primary flex items-center gap-2">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>A transactional order confirmation invoice has been sent to your email address via Resend.</span>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button className="flex-1 rounded-xl shadow-md gap-2" asChild>
                <Link href={`/orders/${order.id}`}>
                  Track Order Progress <Truck className="w-4 h-4" />
                </Link>
              </Button>
              <Button variant="outline" className="flex-1 rounded-xl" asChild>
                <Link href="/products">
                  Continue Shopping <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}

