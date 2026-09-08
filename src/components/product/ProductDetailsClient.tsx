"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCartStore } from "@/stores/cartStore";
import { useWishlistStore } from "@/stores/wishlistStore";
import { formatPrice, calculateDiscountPercentage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Heart,
  ShoppingBag,
  Zap,
  Star,
  Truck,
  ShieldCheck,
  RotateCcw,
  Plus,
  Minus,
  Upload,
  Loader2,
  CheckCircle2,
  X,
  Camera,
  Maximize2,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

interface ProductImage {
  id: string;
  url: string;
  altText?: string | null;
  isPrimary: boolean;
}

interface ReviewImage {
  id: string;
  url: string;
}

interface Review {
  id: string;
  rating: number;
  title?: string | null;
  comment: string;
  createdAt: string;
  user: {
    name?: string | null;
    image?: string | null;
  };
  images: ReviewImage[];
}

interface ProductDetailsProps {
  product: {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    discountPrice?: number | null;
    stock: number;
    sku?: string | null;
    ratingAvg: number;
    ratingCount: number;
    category: { name: string; slug: string };
    images: ProductImage[];
    reviews: Review[];
  };
  relatedProducts: Array<{
    id: string;
    name: string;
    slug: string;
    price: number;
    discountPrice?: number | null;
    stock: number;
    ratingAvg: number;
    ratingCount: number;
    image?: string;
  }>;
}

export function ProductDetailsClient({ product, relatedProducts }: ProductDetailsProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const addItem = useCartStore((state) => state.addItem);
  const { toggleWishlist, isInWishlist } = useWishlistStore();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // Review state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [uploadedReviewImages, setUploadedReviewImages] = useState<Array<{ url: string; publicId: string }>>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Fullscreen Lightbox & Image Zoom state
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  const images = product.images.length > 0
    ? product.images
    : [{ id: "1", url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80", isPrimary: true }];

  // Lock body scroll and handle keyboard shortcuts in lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsLightboxOpen(false);
        setZoomLevel(1);
      } else if (e.key === "ArrowRight") {
        setActiveImageIndex((prev) => (prev + 1) % images.length);
        setZoomLevel(1);
      } else if (e.key === "ArrowLeft") {
        setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
        setZoomLevel(1);
      } else if (e.key === "+" || e.key === "=") {
        setZoomLevel((prev) => Math.min(3, Number((prev + 0.5).toFixed(1))));
      } else if (e.key === "-") {
        setZoomLevel((prev) => Math.max(1, Number((prev - 0.5).toFixed(1))));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isLightboxOpen, images.length]);

  const currentImage = images[activeImageIndex] || images[0];
  const activePrice = product.discountPrice ?? product.price;
  const discountPercent = product.discountPrice
    ? calculateDiscountPercentage(product.price, product.discountPrice)
    : 0;
  const isFavorite = isInWishlist(product.id);

  const handleAddToCart = () => {
    if (product.stock <= 0) {
      toast.error("This product is currently out of stock.");
      return;
    }
    addItem(
      {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        discountPrice: product.discountPrice,
        image: currentImage.url,
        stock: product.stock,
      },
      quantity
    );
    toast.success(`Added ${quantity} ${product.name} to cart!`);
  };

  const handleBuyNow = () => {
    if (product.stock <= 0) {
      toast.error("This product is currently out of stock.");
      return;
    }
    addItem(
      {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        discountPrice: product.discountPrice,
        image: currentImage.url,
        stock: product.stock,
      },
      quantity
    );
    router.push("/checkout");
  };

  const handleToggleWishlist = () => {
    const added = toggleWishlist({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      discountPrice: product.discountPrice,
      image: currentImage.url,
      categoryName: product.category?.name,
      inStock: product.stock > 0,
    });
    if (added) {
      toast.success("Saved to wishlist!");
    } else {
      toast.info("Removed from wishlist.");
    }
  };

  // Review Image Upload to Cloudinary
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (uploadedReviewImages.length >= 3) {
      toast.error("You can upload a maximum of 3 photos per review.");
      return;
    }

    setUploadingImage(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "ecommerce-reviews");

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to upload review image.");
      } else {
        setUploadedReviewImages((prev) => [
          ...prev,
          { url: data.url, publicId: data.publicId },
        ]);
        toast.success("Review photo attached!");
      }
    } catch (err) {
      toast.error("Error uploading photo.");
    } finally {
      setUploadingImage(false);
    }
  };

  const removeReviewImage = (index: number) => {
    setUploadedReviewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) {
      toast.error("Please sign in to post a review.");
      router.push(`/auth/signin?callbackUrl=/products/${product.slug}`);
      return;
    }

    if (!reviewComment.trim()) {
      toast.error("Please provide review feedback comments.");
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          rating: reviewRating,
          title: reviewTitle.trim() || undefined,
          comment: reviewComment.trim(),
          images: uploadedReviewImages,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to submit review.");
      } else {
        toast.success("Thank you for your review!");
        setReviewComment("");
        setReviewTitle("");
        setUploadedReviewImages([]);
        setShowReviewForm(false);
        router.refresh();
      }
    } catch (err) {
      toast.error("An unexpected error occurred while saving review.");
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-xs text-muted-foreground mb-6 flex items-center gap-2">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-foreground">Products</Link>
        <span>/</span>
        <Link href={`/products?category=${product.category?.slug}`} className="hover:text-foreground">
          {product.category?.name}
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Product Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Gallery */}
        <div className="space-y-4">
          <div
            onClick={() => {
              setIsLightboxOpen(true);
              setZoomLevel(1);
            }}
            className="group relative aspect-square w-full rounded-2xl overflow-hidden border bg-muted/30 shadow-sm cursor-zoom-in"
            title="Click to expand fullscreen & zoom"
          >
            <Image
              src={currentImage.url}
              alt={currentImage.altText || product.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 600px"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {discountPercent > 0 && (
              <Badge variant="destructive" className="absolute top-4 left-4 text-xs font-bold shadow-md">
                {discountPercent}% OFF
              </Badge>
            )}
            <div className="absolute bottom-3 right-3 bg-black/60 hover:bg-black/80 backdrop-blur-sm text-white px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition opacity-80 group-hover:opacity-100 shadow-md">
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Fullscreen & Zoom</span>
            </div>
          </div>

          {/* Thumbnail list */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={img.id || idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 shrink-0 transition ${
                    activeImageIndex === idx
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <Image src={img.url} alt="Thumbnail" fill sizes="80px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details & Actions */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs font-bold text-primary uppercase tracking-widest">
                {product.category?.name}
              </span>
              {product.sku && (
                <span className="text-xs text-muted-foreground font-mono">SKU: {product.sku}</span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 text-foreground">
              {product.name}
            </h1>

            {/* Ratings Summary */}
            <div className="flex items-center gap-2 mt-3">
              <div className="flex items-center text-amber-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.round(product.ratingAvg)
                        ? "fill-amber-400 text-amber-400"
                        : "text-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-semibold">{product.ratingAvg.toFixed(1)}</span>
              <span className="text-xs text-muted-foreground">
                ({product.ratingCount} {product.ratingCount === 1 ? "review" : "reviews"})
              </span>
            </div>
          </div>

          {/* Pricing */}
          <div className="p-4 rounded-xl bg-muted/40 border space-y-1">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-foreground">
                {formatPrice(activePrice)}
              </span>
              {product.discountPrice && product.discountPrice < product.price && (
                <span className="text-base text-muted-foreground line-through">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Inclusive of all taxes & standard warranty</p>
          </div>

          {/* Stock Status */}
          <div className="flex items-center gap-2 text-sm font-medium">
            {product.stock > 5 ? (
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> In Stock ({product.stock} units available)
              </span>
            ) : product.stock > 0 ? (
              <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <Zap className="w-4 h-4" /> Only {product.stock} units left in stock!
              </span>
            ) : (
              <span className="text-destructive font-semibold">Currently Out of Stock</span>
            )}
          </div>

          {/* Quantity and Actions */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center border rounded-lg bg-card">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1 || product.stock <= 0}
                  className="p-2.5 text-muted-foreground hover:text-foreground disabled:opacity-40"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 text-sm font-semibold min-w-[2rem] text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock || product.stock <= 0}
                  className="p-2.5 text-muted-foreground hover:text-foreground disabled:opacity-40"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={handleToggleWishlist}
                className="h-11 w-11 rounded-lg"
                aria-label="Wishlist"
              >
                <Heart className={`w-5 h-5 ${isFavorite ? "fill-rose-500 text-rose-500" : ""}`} />
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                size="lg"
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="rounded-xl gap-2 font-semibold shadow-md h-12"
              >
                <ShoppingBag className="w-5 h-5" /> Add to Cart
              </Button>
              <Button
                size="lg"
                variant="secondary"
                onClick={handleBuyNow}
                disabled={product.stock <= 0}
                className="rounded-xl gap-2 font-semibold h-12 bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-600"
              >
                <Zap className="w-5 h-5" /> Buy Now
              </Button>
            </div>
          </div>

          {/* Value Props */}
          <div className="grid grid-cols-3 gap-3 pt-6 border-t text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-primary shrink-0" />
              <span>Free Shipping</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
              <span>1-Yr Warranty</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-primary shrink-0" />
              <span>30-Day Returns</span>
            </div>
          </div>

          {/* Description */}
          <div className="pt-6 border-t space-y-2">
            <h3 className="font-bold text-sm">Product Overview</h3>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>
        </div>
      </div>

      {/* Customer Reviews & Photo Section */}
      <section className="mt-16 pt-12 border-t">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Customer Reviews</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Real feedback and photos from verified buyers
            </p>
          </div>
          <Button
            onClick={() => setShowReviewForm(!showReviewForm)}
            variant={showReviewForm ? "outline" : "default"}
          >
            {showReviewForm ? "Close Review Form" : "Write a Review"}
          </Button>
        </div>

        {/* Review Form */}
        {showReviewForm && (
          <div className="mb-12 p-6 rounded-2xl border bg-card/60 backdrop-blur shadow-sm space-y-4 max-w-2xl">
            <h3 className="font-bold text-lg">Share Your Experience</h3>
            <form onSubmit={handleSubmitReview} className="space-y-4">
              {/* Star Rating Picker */}
              <div className="space-y-1.5">
                <Label>Rating</Label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className="p-1 text-amber-400 hover:scale-110 transition"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= reviewRating ? "fill-amber-400" : "text-muted-foreground/30"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-sm font-semibold ml-2">{reviewRating} out of 5</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="reviewTitle">Review Title (Optional)</Label>
                <Input
                  id="reviewTitle"
                  placeholder="e.g. Best headphones I've ever owned!"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="reviewComment">Your Feedback *</Label>
                <textarea
                  id="reviewComment"
                  rows={4}
                  placeholder="Write what you like or dislike about this product..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full rounded-md border border-input bg-background p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  required
                />
              </div>

              {/* Review Photos Upload via Cloudinary */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-primary" />
                  <span>Attach Customer Photos (Up to 3 via Cloudinary)</span>
                </Label>

                <div className="flex items-center gap-3">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 border border-dashed rounded-lg text-xs font-medium hover:bg-muted transition">
                    {uploadingImage ? (
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    ) : (
                      <Upload className="w-4 h-4 text-primary" />
                    )}
                    <span>{uploadingImage ? "Uploading to Cloudinary..." : "Upload Photo"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage || uploadedReviewImages.length >= 3}
                      className="hidden"
                    />
                  </label>
                  <span className="text-xs text-muted-foreground">
                    {uploadedReviewImages.length}/3 attached
                  </span>
                </div>

                {/* Previews */}
                {uploadedReviewImages.length > 0 && (
                  <div className="flex gap-3 pt-2">
                    {uploadedReviewImages.map((img, idx) => (
                      <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border">
                        <Image src={img.url} alt="Review upload" fill sizes="64px" className="object-cover" />
                        <button
                          type="button"
                          onClick={() => removeReviewImage(idx)}
                          className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button type="submit" disabled={submittingReview} className="w-full sm:w-auto">
                {submittingReview ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...
                  </>
                ) : (
                  "Submit Review"
                )}
              </Button>
            </form>
          </div>
        )}

        {/* Reviews List */}
        {product.reviews.length === 0 ? (
          <div className="text-center py-12 border rounded-xl bg-muted/20">
            <p className="text-muted-foreground">No customer reviews yet. Be the first to review this product!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {product.reviews.map((rev) => (
              <div key={rev.id} className="p-5 rounded-xl border bg-card space-y-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                      {rev.user?.name?.[0] || "U"}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold">{rev.user?.name || "Customer"}</h4>
                      <div className="flex items-center text-amber-400">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3.5 h-3.5 ${
                              star <= rev.rating
                                ? "fill-amber-400 text-amber-400"
                                : "text-muted-foreground/30"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {rev.title && <h5 className="font-semibold text-sm">{rev.title}</h5>}
                <p className="text-xs text-muted-foreground leading-relaxed">{rev.comment}</p>

                {/* Review Images */}
                {rev.images && rev.images.length > 0 && (
                  <div className="flex gap-2 pt-2">
                    {rev.images.map((img) => (
                      <div key={img.id} className="relative w-16 h-16 rounded-lg overflow-hidden border">
                        <Image src={img.url} alt="Review attachment" fill sizes="64px" className="object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-16 pt-12 border-t">
          <h2 className="text-2xl font-bold tracking-tight mb-8">You May Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedProducts.map((rel) => (
              <div
                key={rel.id}
                className="group rounded-xl border bg-card p-4 hover:shadow-lg transition space-y-3"
              >
                <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                  <Image
                    src={rel.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80"}
                    alt={rel.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition duration-300"
                  />
                </div>
                <div>
                  <Link href={`/products/${rel.slug}`} className="font-semibold text-sm line-clamp-1 hover:text-primary transition">
                    {rel.name}
                  </Link>
                  <div className="text-sm font-bold text-primary mt-1">
                    {formatPrice(rel.discountPrice ?? rel.price)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Fullscreen Lightbox & In-Viewer Zoom Modal */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between select-none"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsLightboxOpen(false);
              setZoomLevel(1);
            }
          }}
        >
          {/* Top Bar: Counter, Title, Zoom Controls, Close Button */}
          <div className="flex items-center justify-between px-4 sm:px-8 py-3.5 border-b border-white/10 text-white z-10 bg-black/50">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold tracking-wide text-zinc-300">
                {activeImageIndex + 1} / {images.length}
              </span>
              <span className="hidden sm:inline text-zinc-600">|</span>
              <span className="hidden sm:inline text-sm font-medium text-zinc-200 truncate max-w-md">
                {product.name}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* In-Viewer Zoom Controls */}
              <div className="flex items-center bg-white/10 rounded-lg p-1 mr-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setZoomLevel((prev) => Math.max(1, Number((prev - 0.5).toFixed(1))))}
                  disabled={zoomLevel <= 1}
                  className="h-8 w-8 text-white hover:bg-white/20 disabled:opacity-30"
                  title="Zoom Out (-)"
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className="text-xs font-mono px-2 text-zinc-200 min-w-[3.2rem] text-center">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setZoomLevel((prev) => Math.min(3, Number((prev + 0.5).toFixed(1))))}
                  disabled={zoomLevel >= 3}
                  className="h-8 w-8 text-white hover:bg-white/20 disabled:opacity-30"
                  title="Zoom In (+)"
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
                {zoomLevel > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setZoomLevel(1)}
                    className="h-8 w-8 text-white hover:bg-white/20 ml-1"
                    title="Reset Zoom (100%)"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>

              {/* Close Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setIsLightboxOpen(false);
                  setZoomLevel(1);
                }}
                className="h-9 w-9 rounded-full bg-white/10 hover:bg-white/25 text-white transition"
                title="Close Viewer (Esc)"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Central Image Stage with In-Viewer Zoom */}
          <div className="relative flex-1 flex items-center justify-center p-4 overflow-hidden">
            {/* Prev Image Button */}
            {images.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
                  setZoomLevel(1);
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 h-11 w-11 rounded-full bg-white/10 hover:bg-white/25 text-white shadow-lg transition"
                title="Previous Image (Left Arrow)"
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
            )}

            {/* Image Canvas with Scale Transform (Page does not zoom) */}
            <div
              className={`relative max-w-5xl max-h-[72vh] w-full h-full flex items-center justify-center overflow-auto ${
                zoomLevel > 1 ? "cursor-grab active:cursor-grabbing" : "cursor-zoom-in"
              }`}
              onClick={() => {
                // Click toggles between 1x and 2x zoom inside the viewer
                setZoomLevel((prev) => (prev > 1 ? 1 : 2));
              }}
              onWheel={(e) => {
                e.stopPropagation();
                if (e.deltaY < 0) {
                  setZoomLevel((prev) => Math.min(3, Number((prev + 0.25).toFixed(2))));
                } else {
                  setZoomLevel((prev) => Math.max(1, Number((prev - 0.25).toFixed(2))));
                }
              }}
            >
              <div
                className="relative w-full h-full max-h-[72vh] flex items-center justify-center transition-transform duration-200 ease-out"
                style={{
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: "center center",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentImage.url}
                  alt={currentImage.altText || product.name}
                  className="max-w-full max-h-[72vh] object-contain rounded-lg shadow-2xl pointer-events-none select-none"
                />
              </div>
            </div>

            {/* Next Image Button */}
            {images.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setActiveImageIndex((prev) => (prev + 1) % images.length);
                  setZoomLevel(1);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 h-11 w-11 rounded-full bg-white/10 hover:bg-white/25 text-white shadow-lg transition"
                title="Next Image (Right Arrow)"
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            )}
          </div>

          {/* Bottom Bar: Instructions & Thumbnails */}
          <div className="px-4 py-3 border-t border-white/10 bg-black/50 z-10 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-zinc-400">
              {zoomLevel > 1 ? "Click image to reset zoom" : "Click image or use controls to zoom in (up to 300%)"} &bull; Scroll wheel to zoom
            </p>

            {/* Thumbnail switcher */}
            {images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto max-w-full py-1">
                {images.map((img, idx) => (
                  <button
                    key={img.id || idx}
                    onClick={() => {
                      setActiveImageIndex(idx);
                      setZoomLevel(1);
                    }}
                    className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 shrink-0 transition ${
                      activeImageIndex === idx
                        ? "border-primary ring-2 ring-primary/40 scale-105"
                        : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Image src={img.url} alt="Thumbnail" fill sizes="48px" className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

