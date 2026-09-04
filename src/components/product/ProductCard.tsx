"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatPrice, calculateDiscountPercentage } from "@/lib/utils";
import { useCartStore } from "@/stores/cartStore";
import { useWishlistStore } from "@/stores/wishlistStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingBag, Star, Check } from "lucide-react";
import { toast } from "sonner";

export interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  price: number;
  discountPrice?: number | null;
  image: string;
  categoryName?: string;
  ratingAvg?: number;
  ratingCount?: number;
  stock: number;
  isFeatured?: boolean;
}

export function ProductCard({
  id,
  name,
  slug,
  price,
  discountPrice,
  image,
  categoryName,
  ratingAvg = 0,
  ratingCount = 0,
  stock,
  isFeatured,
}: ProductCardProps) {
  const [mounted, setMounted] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const { toggleWishlist, isInWishlist } = useWishlistStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isFavorite = mounted ? isInWishlist(id) : false;
  const discountPercent = discountPrice
    ? calculateDiscountPercentage(price, discountPrice)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (stock <= 0) {
      toast.error("This item is currently out of stock.");
      return;
    }

    addItem({
      id,
      name,
      slug,
      price,
      discountPrice,
      image,
      stock,
    });

    toast.success(`Added ${name} to your cart!`);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const added = toggleWishlist({
      id,
      name,
      slug,
      price,
      discountPrice,
      image,
      categoryName,
      inStock: stock > 0,
    });

    if (added) {
      toast.success(`Saved to your wishlist!`);
    } else {
      toast.info(`Removed from wishlist.`);
    }
  };

  return (
    <div className="group relative rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between overflow-hidden">
      {/* Product Image Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-muted/40">
        <Link href={`/products/${slug}`} className="block w-full h-full">
          <Image
            src={image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80"}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {discountPercent > 0 && (
            <Badge variant="destructive" className="font-bold text-xs shadow-sm">
              {discountPercent}% OFF
            </Badge>
          )}
          {isFeatured && (
            <Badge className="bg-amber-500 text-white font-semibold text-[10px] shadow-sm">
              FEATURED
            </Badge>
          )}
          {stock <= 0 && (
            <Badge variant="secondary" className="bg-black/70 text-white text-[10px]">
              OUT OF STOCK
            </Badge>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleToggleWishlist}
          aria-label={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center text-foreground hover:text-destructive hover:scale-110 transition shadow-sm z-10"
        >
          <Heart
            className={`w-4 h-4 transition ${
              isFavorite ? "fill-rose-500 text-rose-500" : "text-muted-foreground"
            }`}
          />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          {categoryName && (
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1">
              {categoryName}
            </p>
          )}

          <Link href={`/products/${slug}`} className="block group-hover:text-primary transition">
            <h3 className="font-semibold text-sm line-clamp-2 leading-snug">{name}</h3>
          </Link>

          {/* Rating */}
          <div className="flex items-center gap-1 mt-2">
            <div className="flex items-center text-amber-400">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            </div>
            <span className="text-xs font-semibold">{ratingAvg.toFixed(1)}</span>
            <span className="text-[11px] text-muted-foreground">({ratingCount})</span>
          </div>
        </div>

        {/* Pricing and Action */}
        <div className="mt-4 pt-3 border-t flex items-center justify-between gap-2">
          <div>
            <div className="text-base font-bold text-foreground">
              {formatPrice(discountPrice ?? price)}
            </div>
            {discountPrice && discountPrice < price && (
              <div className="text-xs text-muted-foreground line-through">
                {formatPrice(price)}
              </div>
            )}
          </div>

          <Button
            size="sm"
            onClick={handleAddToCart}
            disabled={stock <= 0}
            className="rounded-lg gap-1.5 px-3 h-9"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">Add</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

