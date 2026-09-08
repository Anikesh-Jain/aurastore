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

  const [imgSrc, setImgSrc] = useState(
    image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80"
  );
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgSrc(image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80");
    setImgError(false);
  }, [image]);

  return (
    <div className="group relative rounded-2xl border border-border/60 bg-card text-card-foreground shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1.5 hover:border-blue-500/35 flex flex-col justify-between overflow-hidden">
      {/* Product Image Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-muted/30">
        <Link href={`/products/${slug}`} className="relative block w-full h-full">
          <Image
            src={imgSrc}
            alt={name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
            onError={() => {
              if (!imgError) {
                setImgError(true);
                setImgSrc("https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80");
              }
            }}
            unoptimized={imgError}
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {discountPercent > 0 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-extrabold tracking-wide bg-rose-600 text-white shadow-sm backdrop-blur-sm">
              {discountPercent}% OFF
            </span>
          )}
          {isFeatured && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide bg-blue-600 text-white shadow-sm">
              FEATURED
            </span>
          )}
          {stock <= 0 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-black/80 text-white backdrop-blur-sm">
              OUT OF STOCK
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleToggleWishlist}
          aria-label={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/80 dark:bg-[#0B1020]/75 hover:bg-white dark:hover:bg-[#0B1020] backdrop-blur-md border border-white/40 dark:border-blue-400/25 hover:border-blue-400/50 flex items-center justify-center text-foreground hover:text-rose-500 hover:scale-110 active:scale-95 transition-all duration-200 shadow-sm z-10"
        >
          <Heart
            className={`w-4 h-4 transition ${
              isFavorite ? "fill-rose-500 text-rose-500" : "text-muted-foreground"
            }`}
          />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between">
        <div>
          {categoryName && (
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1">
              {categoryName}
            </p>
          )}

          <Link href={`/products/${slug}`} className="block group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
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
            className="rounded-xl gap-1.5 px-3.5 h-9 font-semibold text-xs bg-blue-600 text-white hover:bg-blue-500 transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md hover:shadow-blue-500/25"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Add</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

