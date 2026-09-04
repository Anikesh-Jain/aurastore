import React from "react";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Package, ArrowRight, ShoppingBag } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/orders");
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: {
      items: true,
      shippingAddress: true,
      payment: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <div className="pb-6 border-b mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
              <Package className="w-8 h-8 text-primary" /> My Orders
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              View your order history, delivery milestones, and receipts.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/products">Shop More</Link>
          </Button>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-20 border rounded-2xl bg-muted/20 max-w-md mx-auto p-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground mx-auto">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold">No orders placed yet</h2>
            <p className="text-sm text-muted-foreground">
              Once you checkout, your items and delivery tracking status will appear here.
            </p>
            <Button className="rounded-xl mt-2" asChild>
              <Link href="/products">Explore Catalog</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="shadow-sm hover:shadow-md transition overflow-hidden">
                <div className="bg-muted/30 p-4 border-b flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-4">
                    <div>
                      <span className="text-muted-foreground">Order ID:</span>{" "}
                      <span className="font-mono font-bold text-foreground">#{order.orderNumber}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Placed On:</span>{" "}
                      <span className="font-medium text-foreground">{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge
                      variant={
                        order.status === "DELIVERED"
                          ? "success"
                          : order.status === "CANCELLED"
                          ? "destructive"
                          : "default"
                      }
                      className="text-[11px] font-bold"
                    >
                      {order.status}
                    </Badge>
                    <span className="font-bold text-sm text-primary">
                      {formatPrice(Number(order.finalAmount))}
                    </span>
                  </div>
                </div>

                <CardContent className="p-4 space-y-4">
                  <div className="space-y-3">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3">
                          {item.productImage && (
                            <div className="relative w-10 h-10 rounded overflow-hidden bg-muted shrink-0 border">
                              <Image src={item.productImage} alt={item.productName} fill className="object-cover" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-foreground line-clamp-1">{item.productName}</p>
                            <p className="text-muted-foreground">Quantity: {item.quantity}</p>
                          </div>
                        </div>
                        <span className="font-bold">{formatPrice(Number(item.subtotal))}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      Destination: <span className="font-medium text-foreground">{order.shippingAddress.city}, {order.shippingAddress.state}</span>
                    </p>

                    <Button size="sm" variant="outline" className="gap-1.5" asChild>
                      <Link href={`/orders/${order.id}`}>
                        <span>Track Order & Invoice</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

