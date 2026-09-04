"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/stores/cartStore";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ShoppingBag, X, Plus, Minus, ArrowRight, Trash2 } from "lucide-react";

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, getSubtotal, getCartCount } = useCartStore();

  const subtotal = getSubtotal();
  const count = getCartCount();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="fixed inset-y-0 right-0 left-auto translate-x-0 translate-y-0 h-full w-full max-w-md p-0 flex flex-col bg-background border-l shadow-2xl rounded-none data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right">
        <DialogHeader className="p-4 border-b flex flex-row items-center justify-between">
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <ShoppingBag className="w-5 h-5 text-primary" />
            <span>Shopping Cart ({count})</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Your cart is empty</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Discover trending gadgets and premium apparel in our catalog.
                </p>
              </div>
              <Button onClick={() => onOpenChange(false)} asChild>
                <Link href="/products">Start Shopping</Link>
              </Button>
            </div>
          ) : (
            items.map((item) => {
              const activePrice = item.discountPrice ?? item.price;
              return (
                <div
                  key={item.id}
                  className="flex gap-4 p-3 rounded-lg border bg-card/60 relative group transition hover:border-primary/40"
                >
                  <div className="relative w-20 h-20 rounded-md overflow-hidden bg-muted shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/products/${item.slug}`}
                          onClick={() => onOpenChange(false)}
                          className="font-medium text-sm line-clamp-1 hover:text-primary transition"
                        >
                          {item.name}
                        </Link>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-muted-foreground hover:text-destructive transition p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-sm font-semibold text-primary mt-1">
                        {formatPrice(activePrice)}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center border rounded-md">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 text-muted-foreground hover:text-foreground transition"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2 text-xs font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                          className="p-1 text-muted-foreground hover:text-foreground transition disabled:opacity-30"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="text-xs text-muted-foreground ml-auto">
                        Subtotal: {formatPrice(activePrice * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {items.length > 0 && (
          <div className="p-4 border-t bg-muted/20 space-y-3">
            <div className="flex justify-between items-center text-sm font-medium">
              <span>Subtotal:</span>
              <span className="text-base font-bold text-primary">{formatPrice(subtotal)}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Taxes and shipping calculated during checkout.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Button variant="outline" onClick={() => onOpenChange(false)} asChild>
                <Link href="/cart">View Cart</Link>
              </Button>
              <Button onClick={() => onOpenChange(false)} asChild>
                <Link href="/checkout" className="flex items-center justify-center gap-1">
                  Checkout <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

