"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useCartStore } from "@/stores/cartStore";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Tag,
  CheckCircle2,
  X,
  Truck,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";

export default function CartPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const {
    items,
    coupon,
    removeItem,
    updateQuantity,
    clearCart,
    applyCoupon,
    removeCoupon,
    getSubtotal,
    getDiscountAmount,
    getShippingFee,
    getFinalTotal,
  } = useCartStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </div>
    );
  }

  const subtotal = getSubtotal();
  const discount = getDiscountAmount();
  const shipping = getShippingFee();
  const finalTotal = getFinalTotal();

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code.");
      return;
    }

    setValidatingCoupon(true);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponCode.trim(),
          orderAmount: subtotal,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Invalid coupon code.");
      } else {
        applyCoupon(data.coupon);
        toast.success(`Coupon ${data.coupon.code} applied successfully!`);
        setCouponCode("");
      }
    } catch (err) {
      toast.error("Failed to validate coupon.");
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    toast.info("Coupon removed.");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex items-center justify-between pb-6 border-b mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
              <ShoppingBag className="w-8 h-8 text-primary" /> Shopping Cart
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {items.length} unique {items.length === 1 ? "item" : "items"} in your cart
            </p>
          </div>
          {items.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearCart}
              className="text-xs text-muted-foreground hover:text-destructive gap-1.5"
            >
              <Trash2 className="w-4 h-4" /> Clear Cart
            </Button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20 border rounded-2xl bg-muted/20 max-w-lg mx-auto p-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground mx-auto">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold">Your cart is completely empty</h2>
            <p className="text-sm text-muted-foreground">
              Looks like you haven&apos;t added any products to your cart yet. Explore our top trending items today!
            </p>
            <Button className="rounded-xl mt-2 shadow-md" asChild>
              <Link href="/products">Explore Products</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Items List */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => {
                const activePrice = item.discountPrice ?? item.price;
                return (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border bg-card gap-4 shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted shrink-0 border">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <Link
                          href={`/products/${item.slug}`}
                          className="font-bold text-base hover:text-primary transition line-clamp-1"
                        >
                          {item.name}
                        </Link>
                        <div className="text-sm font-semibold text-primary mt-1">
                          {formatPrice(activePrice)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between w-full sm:w-auto gap-6">
                      <div className="flex items-center border rounded-lg bg-background">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-2 text-muted-foreground hover:text-foreground"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 text-xs font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                          className="p-2 text-muted-foreground hover:text-foreground disabled:opacity-40"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-right min-w-[5rem]">
                        <div className="text-base font-bold">
                          {formatPrice(activePrice * item.quantity)}
                        </div>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-muted-foreground hover:text-destructive p-2 transition"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Promo code box */}
              <div className="p-4 rounded-xl border bg-muted/20 space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Tag className="w-4 h-4 text-primary" /> Apply Promo Code
                </div>

                {coupon ? (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/20 text-primary">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="font-bold text-sm">{coupon.code}</span>
                      <span className="text-xs">
                        ({coupon.discountPercent ? `${coupon.discountPercent}% OFF` : `₹${coupon.discountAmount} OFF`})
                      </span>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-muted-foreground hover:text-destructive"
                      aria-label="Remove coupon"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <Input
                      placeholder="Enter promo code (e.g. WELCOME20)"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="bg-background"
                    />
                    <Button type="submit" disabled={validatingCoupon} className="shrink-0">
                      {validatingCoupon ? "Checking..." : "Apply"}
                    </Button>
                  </form>
                )}
                <p className="text-xs text-muted-foreground">
                  Available test codes: <strong>WELCOME20</strong> (20% off over ₹2,000), <strong>MEGA500</strong> (₹500 off over ₹3,000)
                </p>
              </div>
            </div>

            {/* Order Summary */}
            <div className="space-y-4">
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-semibold">{formatPrice(subtotal)}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-emerald-600 dark:text-emerald-400">
                      <span>Promo Discount ({coupon?.code})</span>
                      <span className="font-semibold">-{formatPrice(discount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>
                      {shipping === 0 ? (
                        <span className="text-emerald-600 font-semibold uppercase text-xs">FREE</span>
                      ) : (
                        formatPrice(shipping)
                      )}
                    </span>
                  </div>

                  {shipping > 0 && (
                    <p className="text-[11px] text-muted-foreground">
                      Add {formatPrice(1999 - subtotal)} more to qualify for Free Shipping!
                    </p>
                  )}

                  <div className="border-t pt-3 flex justify-between items-baseline">
                    <span className="text-base font-bold">Total Amount</span>
                    <span className="text-2xl font-extrabold text-primary">
                      {formatPrice(finalTotal)}
                    </span>
                  </div>

                  <Button size="lg" className="w-full mt-4 rounded-xl shadow font-bold" asChild>
                    <Link href="/checkout" className="flex items-center justify-center gap-2">
                      Proceed to Checkout <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Trust badges */}
              <div className="p-4 rounded-xl border bg-muted/30 space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>256-Bit SSL Encrypted Payment</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-primary shrink-0" />
                  <span>Tracked Pan-India Delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-primary shrink-0" />
                  <span>30 Days Return Assurance</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

