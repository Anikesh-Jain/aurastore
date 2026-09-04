"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useWishlistStore } from "@/stores/wishlistStore";
import { useCartStore } from "@/stores/cartStore";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function WishlistPage() {
  const [mounted, setMounted] = useState(false);
  const { items, removeItem, clearWishlist } = useWishlistStore();
  const addItemToCart = useCartStore((state) => state.addItem);

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

  const handleMoveToCart = (item: any) => {
    addItemToCart({
      id: item.id,
      name: item.name,
      slug: item.slug,
      price: item.price,
      discountPrice: item.discountPrice,
      image: item.image,
      stock: 10,
    });
    removeItem(item.id);
    toast.success(`Moved ${item.name} to cart!`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex items-center justify-between pb-6 border-b mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
              <Heart className="w-8 h-8 text-rose-500 fill-rose-500" /> My Wishlist
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {items.length} saved {items.length === 1 ? "item" : "items"}
            </p>
          </div>
          {items.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearWishlist}
              className="text-xs text-muted-foreground hover:text-destructive gap-1.5"
            >
              <Trash2 className="w-4 h-4" /> Clear Wishlist
            </Button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20 border rounded-2xl bg-muted/20 max-w-lg mx-auto p-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground mx-auto">
              <Heart className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold">Your wishlist is empty</h2>
            <p className="text-sm text-muted-foreground">
              Save items you love by clicking the heart icon on any product card.
            </p>
            <Button className="rounded-xl mt-2 shadow-md" asChild>
              <Link href="/products">Explore Products</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map((item) => (
              <div
                key={item.id}
                className="group rounded-xl border bg-card p-4 shadow-sm hover:shadow-lg transition flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-muted mb-3 border">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>
                  {item.categoryName && (
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase">
                      {item.categoryName}
                    </span>
                  )}
                  <Link href={`/products/${item.slug}`} className="font-bold text-sm block hover:text-primary transition line-clamp-1 mt-0.5">
                    {item.name}
                  </Link>
                  <div className="text-base font-bold text-primary mt-2">
                    {formatPrice(item.discountPrice ?? item.price)}
                  </div>
                </div>

                <div className="pt-4 border-t mt-4 flex items-center gap-2">
                  <Button
                    size="sm"
                    className="w-full gap-1.5"
                    onClick={() => handleMoveToCart(item)}
                  >
                    <ShoppingBag className="w-4 h-4" /> Move to Cart
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => removeItem(item.id)}
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

