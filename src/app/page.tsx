import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/product/ProductCard";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Lock,
  Tag,
  Sparkles,
} from "lucide-react";

export const revalidate = 60; // Preserve ISR 60 seconds

interface CategoryCard {
  id: string;
  title: string;
  subtitle: string;
  ctaText: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
  badge: string;
}

const categoryCards: CategoryCard[] = [
  {
    id: "cat-audio",
    title: "Audio",
    subtitle: "Headphones, Earbuds & More",
    ctaText: "Shop Audio",
    href: "/products?category=audio-wearables",
    imageSrc: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80",
    imageAlt: "High-fidelity audio headphones and earbuds",
    badge: "Hi-Res Sound",
  },
  {
    id: "cat-wearables",
    title: "Wearables",
    subtitle: "Smartwatches, Fitness & Everyday Tech",
    ctaText: "Shop Wearables",
    href: "/products?category=audio-wearables",
    imageSrc: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80",
    imageAlt: "Titanium smartwatches and everyday wearables",
    badge: "Smart Living",
  },
  {
    id: "cat-fashion",
    title: "Fashion",
    subtitle: "Apparel for Every Occasion",
    ctaText: "Shop Fashion",
    href: "/products?category=fashion",
    imageSrc: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80",
    imageAlt: "Curated modern apparel and fashion accessories",
    badge: "New Season",
  },
  {
    id: "cat-home",
    title: "Home & Lifestyle",
    subtitle: "Essentials for a Better Everyday",
    ctaText: "Shop Home",
    href: "/products?category=home-living",
    imageSrc: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80",
    imageAlt: "Modern home decor, lighting and smart essentials",
    badge: "Interior Craft",
  },
];

const trustFeatures = [
  {
    icon: ShieldCheck,
    title: "100% Authentic Products",
    description: "Sourced directly from verified brands & makers",
  },
  {
    icon: Truck,
    title: "Free Express Shipping",
    description: "Complimentary delivery on orders over ₹1,999",
  },
  {
    icon: RotateCcw,
    title: "30-Day Easy Returns",
    description: "Hassle-free exchanges and instant refunds",
  },
  {
    icon: Lock,
    title: "Secure & Encrypted",
    description: "Industry-standard 256-bit payment security",
  },
];

export default async function HomePage() {
  // Fetch featured products from PostgreSQL
  let featuredProducts: any[] = [];

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
  } catch (err) {
    console.error("Failed to load homepage data from database:", err);
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        {/* 1. Real 5-Slide Cinematic Carousel */}
        <HeroCarousel />

        {/* 2. Customer Trust & Brand Values Bar */}
        <section className="border-b bg-card/60 backdrop-blur-sm py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {trustFeatures.map((feat, idx) => {
                const Icon = feat.icon;
                return (
                  <div
                    key={idx}
                    className="group flex items-center gap-4 p-4 rounded-2xl border border-border/50 bg-card/50 hover:bg-card hover:border-primary/30 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-110 transition-all duration-300 shadow-sm">
                      <Icon className="w-5 h-5 transition-transform duration-300 group-hover:rotate-3" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors duration-200">
                        {feat.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        {feat.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 3. Image-Driven "Shop by Category" Showcase */}
        <section className="py-16 md:py-20 bg-muted/20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4">
              <div>
                <p className="text-xs font-bold text-primary uppercase tracking-widest">
                  Explore Curated Collections
                </p>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mt-1 text-foreground">
                  Shop by Category
                </h2>
              </div>
              <Button variant="ghost" className="gap-1.5 text-primary hover:text-primary" asChild>
                <Link href="/products">
                  View All Collections <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>

            {/* 4 Image-Driven Category Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {categoryCards.map((cat) => (
                <Link
                  key={cat.id}
                  href={cat.href}
                  className="group relative aspect-[4/5] sm:aspect-[3/4] rounded-2xl overflow-hidden shadow-md hover:shadow-2xl border border-border/50 bg-card transition-all duration-500 hover:-translate-y-2 flex flex-col justify-between p-6 text-white"
                >
                  {/* Full-Bleed Background Image with smooth micro-zoom */}
                  <Image
                    src={cat.imageSrc}
                    alt={cat.imageAlt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  />

                  {/* Multi-Stop Dark Gradient Overlay with subtle shift on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 transition-opacity duration-500 group-hover:opacity-90" />

                  {/* Ambient subtle glow ring on hover */}
                  <div className="absolute inset-0 rounded-2xl ring-1 ring-white/10 group-hover:ring-white/30 transition-all duration-300 pointer-events-none" />

                  {/* Top Badge with glass backdrop */}
                  <div className="relative z-10">
                    <span className="inline-block px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-white/15 backdrop-blur-md border border-white/20 text-white shadow-sm group-hover:bg-white/25 group-hover:border-white/30 transition-all duration-300">
                      {cat.badge}
                    </span>
                  </div>

                  {/* Bottom Text Content & Action */}
                  <div className="relative z-10 space-y-2">
                    <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white group-hover:text-amber-200 transition-colors duration-300">
                      {cat.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed line-clamp-2">
                      {cat.subtitle}
                    </p>
                    <div className="pt-2 flex items-center gap-1.5 text-xs font-semibold text-white group-hover:text-amber-300 transition-colors duration-300">
                      <span>{cat.ctaText}</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-2" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Featured Products Showcase */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4">
              <div>
                <p className="text-xs font-bold text-primary uppercase tracking-widest">
                  Handpicked Recommendations
                </p>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mt-1 text-foreground">
                  Featured Gear
                </h2>
              </div>
              <Button variant="outline" asChild>
                <Link href="/products">Browse Full Catalog</Link>
              </Button>
            </div>

            {featuredProducts.length === 0 ? (
              <div className="text-center py-12 border rounded-2xl bg-muted/20">
                <p className="text-muted-foreground">No featured products found.</p>
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

        {/* 5. Refined Promotional Section */}
        <section className="py-12 md:py-16 border-t bg-muted/10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-zinc-950 via-slate-900 to-indigo-950 text-white p-8 sm:p-14 shadow-2xl border border-white/10">
              {/* Subtle ambient lighting element */}
              <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 max-w-2xl space-y-4">
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/15 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-purple-300 shadow-sm">
                  <Tag className="w-3.5 h-3.5" /> Welcome Privilege
                </div>
                <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                  Enjoy 10% Off Your First Order
                </h2>
                <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
                  Join the AuraStore community today. Apply coupon code{" "}
                  <strong className="text-amber-300 font-mono text-base px-2.5 py-1 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 inline-block shadow-inner">
                    WELCOME10
                  </strong>{" "}
                  at checkout for an instant 10% discount on orders of ₹999 or more.
                </p>
                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <Button
                    size="lg"
                    className="bg-white text-black font-semibold hover:bg-zinc-100 hover:scale-[1.02] active:scale-[0.98] shadow-lg rounded-xl h-12 px-6 transition-all duration-200"
                    asChild
                  >
                    <Link href="/products">Explore Collections</Link>
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
