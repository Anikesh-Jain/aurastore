import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import {
  ArrowRight,
  Sparkles,
  Zap,
  ShieldCheck,
  Truck,
  RotateCcw,
  Tag,
  Headphones,
  Laptop,
  Shirt,
  Home as HomeIcon,
} from "lucide-react";

export const revalidate = 60; // ISR 60 seconds

export default async function HomePage() {
  // Fetch featured products from PostgreSQL
  let featuredProducts: any[] = [];
  let categories: any[] = [];

  try {
    featuredProducts = await prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      include: {
        category: { select: { name: true, slug: true } },
        images: { orderBy: { isPrimary: "desc" }, take: 1 },
      },
      take: 8,
      orderBy: { createdAt: "desc" },
    });

    categories = await prisma.category.findMany({
      include: {
        _count: { select: { products: true } },
      },
      take: 4,
    });
  } catch (err) {
    console.error("Failed to load homepage data from database:", err);
  }

  const categoryIcons: { [key: string]: any } = {
    electronics: Laptop,
    "audio-wearables": Headphones,
    fashion: Shirt,
    "home-living": HomeIcon,
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-background to-background py-16 md:py-24 border-b">
          <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/20 bg-primary/10 text-primary text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Next-Gen Full-Stack Marketplace</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15]">
                Engineered For <span className="text-primary">Performance</span> & Modern Lifestyle.
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Discover high-fidelity audio, titanium smartwatches, mechanical gear, and designer apparel with seamless Razorpay UPI checkout and instant order tracking.
              </p>

              <div className="flex flex-col sm:flex-row gap-3.5 justify-center lg:justify-start pt-2">
                <Button size="lg" className="rounded-xl gap-2 font-semibold shadow-md" asChild>
                  <Link href="/products">
                    Explore All Gear <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="rounded-xl font-semibold" asChild>
                  <Link href="/products?category=audio-wearables">
                    Audio & Wearables
                  </Link>
                </Button>
              </div>

              {/* Trust Metrics */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t max-w-md mx-auto lg:mx-0 text-center lg:text-left">
                <div>
                  <div className="text-2xl font-bold text-foreground">100%</div>
                  <div className="text-xs text-muted-foreground">Original Gear</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">Fast</div>
                  <div className="text-xs text-muted-foreground">Express Delivery</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">24/7</div>
                  <div className="text-xs text-muted-foreground">Support Portal</div>
                </div>
              </div>
            </div>

            {/* Hero Image / Visual Showcase */}
            <div className="relative mx-auto lg:ml-auto w-full max-w-lg aspect-square rounded-2xl overflow-hidden shadow-2xl border bg-card/60 backdrop-blur">
              <Image
                src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&auto=format&fit=crop&q=80"
                alt="Aura Pro Wireless ANC Studio Headphones"
                fill
                priority
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6 text-white">
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary-foreground/90 bg-primary/80 backdrop-blur-md px-2.5 py-1 rounded-md w-fit mb-2">
                  <Zap className="w-3.5 h-3.5" /> Featured Spotlight
                </div>
                <h3 className="text-xl font-bold">Aura Pro Wireless ANC Headphones</h3>
                <p className="text-xs text-zinc-300 mt-1">Spatial Audio &bull; 40-Hr Battery &bull; Titanium Drivers</p>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/20">
                  <span className="text-lg font-bold text-white">₹16,999</span>
                  <Link
                    href="/products/aura-pro-wireless-anc-headphones"
                    className="text-xs font-semibold bg-white text-black px-3 py-1.5 rounded-lg hover:bg-zinc-200 transition"
                  >
                    View Product
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Categories */}
        <section className="py-16 bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4">
              <div>
                <p className="text-xs font-bold text-primary uppercase tracking-widest">Browse by Department</p>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mt-1">Shop by Category</h2>
              </div>
              <Button variant="ghost" className="gap-1.5 text-primary" asChild>
                <Link href="/products">
                  View All Categories <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((cat) => {
                const IconComponent = categoryIcons[cat.slug] || Laptop;
                return (
                  <Link
                    key={cat.id}
                    href={`/products?category=${cat.slug}`}
                    className="group relative rounded-xl border bg-card p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between overflow-hidden"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-semibold text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                        {cat._count?.products || 0} items
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{cat.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                        {cat.description || "Browse the full collection in this catalog."}
                      </p>
                    </div>

                    <div className="mt-4 pt-4 border-t flex items-center text-xs font-semibold text-primary gap-1">
                      <span>Explore Collection</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* Featured Products Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4">
              <div>
                <p className="text-xs font-bold text-primary uppercase tracking-widest">Handpicked Selections</p>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mt-1">Featured Products</h2>
              </div>
              <Button variant="outline" asChild>
                <Link href="/products">Browse Full Catalog</Link>
              </Button>
            </div>

            {featuredProducts.length === 0 ? (
              <div className="text-center py-12 border rounded-xl bg-muted/20">
                <p className="text-muted-foreground">No featured products found. Run database seed to populate.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {featuredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    slug={product.slug}
                    price={Number(product.price)}
                    discountPrice={product.discountPrice ? Number(product.discountPrice) : null}
                    image={product.images[0]?.url}
                    categoryName={product.category?.name}
                    ratingAvg={Number(product.ratingAvg)}
                    ratingCount={product.ratingCount}
                    stock={product.stock}
                    isFeatured={product.isFeatured}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Promotional Banner */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white p-8 sm:p-12 shadow-xl">
              <div className="relative z-10 max-w-2xl space-y-4">
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  <Tag className="w-3.5 h-3.5" /> Limited Time Promo
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                  Enjoy 20% Off Your Entire Order
                </h2>
                <p className="text-white/80 text-sm sm:text-base leading-relaxed">
                  Enter coupon code <strong className="text-amber-300 font-mono text-base px-2 py-0.5 bg-white/10 rounded">WELCOME20</strong> at checkout on orders of ₹2,000 or more.
                </p>
                <div className="pt-2">
                  <Button size="lg" className="bg-white text-blue-900 font-bold hover:bg-zinc-100 shadow-md rounded-xl" asChild>
                    <Link href="/products">Shop Deals Now</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

