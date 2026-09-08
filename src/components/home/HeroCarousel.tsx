"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Tag,
  CheckCircle2,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "sonner";

interface SlideData {
  id: string;
  categoryTag: string;
  headline: string;
  supportingText: string;
  ctaText: string;
  ctaHref: string;
  productName: string;
  productHref: string;
  priceFormatted?: string;
  imageSrc: string;
  imageAlt: string;
  highlights: string[];
  gradientTheme: string;
  accentBadgeColor: string;
  isOfferSlide?: boolean;
  couponCode?: string;
}

const slides: SlideData[] = [
  // SLIDE 1 — AUDIO
  {
    id: "slide-audio",
    categoryTag: "Aura Sound Lab",
    headline: "Hear Every Detail.",
    supportingText: "Premium sound. Zero distractions.",
    ctaText: "Shop Audio",
    ctaHref: "/products?category=audio-wearables",
    productName: "Aura Pro Wireless ANC Headphones",
    productHref: "/products/aura-pro-wireless-anc-headphones",
    priceFormatted: "₹16,999",
    imageSrc: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&auto=format&fit=crop&q=80",
    imageAlt: "Aura Pro Wireless ANC Studio Headphones",
    highlights: [
      "Active Noise Cancellation",
      "Up to 40 Hours Battery",
      "Bluetooth 5.3",
      "All-Day Comfort",
    ],
    gradientTheme: "from-zinc-950 via-slate-900 to-black",
    accentBadgeColor: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  },

  // SLIDE 2 — WEARABLES
  {
    id: "slide-wearables",
    categoryTag: "Connected Living",
    headline: "Technology That Moves With You.",
    supportingText: "Smart tech built for your everyday.",
    ctaText: "Explore Wearables",
    ctaHref: "/products?category=audio-wearables",
    productName: "Chronos Stealth Smartwatch Series 7",
    productHref: "/products/chronos-stealth-smartwatch-series-7",
    priceFormatted: "₹24,999",
    imageSrc: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&auto=format&fit=crop&q=80",
    imageAlt: "Chronos Stealth Titanium Smartwatch",
    highlights: [
      "Always-On Retina AMOLED",
      "Grade 5 Titanium Casing",
      "Precision Sensor Suite",
      "50M Water Resistance",
    ],
    gradientTheme: "from-neutral-950 via-cyan-950/40 to-black",
    accentBadgeColor: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  },

  // SLIDE 3 — FASHION
  {
    id: "slide-fashion",
    categoryTag: "Contemporary Essentials",
    headline: "Make Every Day Your Style.",
    supportingText: "Modern pieces. Effortless looks.",
    ctaText: "Shop Fashion",
    ctaHref: "/products?category=fashion",
    productName: "Zenith Heavyweight 450 GSM Hoodie",
    productHref: "/products/zenith-heavyweight-cotton-hoodie",
    priceFormatted: "₹3,499",
    imageSrc: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=1200&auto=format&fit=crop&q=80",
    imageAlt: "Zenith Heavyweight Cotton Apparel",
    highlights: [
      "450 GSM French Terry",
      "Structured Modern Silhouette",
      "Organic Combed Cotton",
      "Reinforced Double-Stitching",
    ],
    gradientTheme: "from-stone-950 via-neutral-900 to-zinc-950",
    accentBadgeColor: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  },

  // SLIDE 4 — HOME & LIFESTYLE
  {
    id: "slide-home",
    categoryTag: "Curated Spaces",
    headline: "Upgrade Your Everyday.",
    supportingText: "Thoughtful products for the way you live.",
    ctaText: "Explore Home & Lifestyle",
    ctaHref: "/products?category=home-living",
    productName: "Lumina Smart Ambient Desk Lamp",
    productHref: "/products/lumina-smart-ambient-desk-lamp",
    priceFormatted: "₹4,299",
    imageSrc: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=1200&auto=format&fit=crop&q=80",
    imageAlt: "Lumina Smart Ambient Living Gear",
    highlights: [
      "Dynamic Circadian Lighting",
      "Anodized Architectural Aluminum",
      "Integrated Fast Charging Base",
      "Touch Gesture Dimming",
    ],
    gradientTheme: "from-orange-950/30 via-neutral-900 to-black",
    accentBadgeColor: "bg-orange-500/15 text-orange-300 border-orange-500/30",
  },

  // SLIDE 5 — SPECIAL OFFER
  {
    id: "slide-offer",
    categoryTag: "Welcome Privileges",
    headline: "Something Special Is Waiting.",
    supportingText: "Get 10% OFF your first AuraStore order.",
    ctaText: "Shop Now",
    ctaHref: "/products",
    productName: "Curated AuraStore First Order Gift",
    productHref: "/products",
    imageSrc: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&auto=format&fit=crop&q=80",
    imageAlt: "AuraStore Signature Gear Collection",
    highlights: [
      "10% Instant Order Discount",
      "Valid Across All Collections",
      "Complimentary Express Delivery",
      "30-Day Guaranteed Returns",
    ],
    gradientTheme: "from-purple-950/40 via-indigo-950/30 to-black",
    accentBadgeColor: "bg-purple-500/15 text-purple-300 border-purple-500/30",
    isOfferSlide: true,
    couponCode: "WELCOME10",
  },
];

export function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [copied, setCopied] = useState(false);

  // Touch handling
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  // Autoplay effect (5 seconds)
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const deltaX = touchStartX.current - touchEndX.current;
    if (deltaX > 50) {
      nextSlide();
    } else if (deltaX < -50) {
      prevSlide();
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success(`Coupon code ${code} copied to clipboard!`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured Collections"
      className="relative w-full overflow-hidden bg-black text-white select-none border-b border-white/10"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Ambience Layer with Smooth Gradient Crossfade */}
      <div className="absolute inset-0 z-0">
        {slides.map((slide, idx) => (
          <div
            key={slide.id}
            className={`absolute inset-0 bg-gradient-to-br ${slide.gradientTheme} transition-opacity duration-1000 ease-in-out ${
              idx === current ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          />
        ))}
        {/* Subtle lighting overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.06),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(0,0,0,0.8),transparent_70%)]" />
      </div>

      {/* Main Slide Content Stage */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 min-h-[580px] sm:min-h-[620px] lg:min-h-[660px] flex items-center py-12 md:py-16">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Typography & CTAs for all 5 slides */}
          <div className="lg:col-span-6 relative min-h-[430px] sm:min-h-[440px] flex items-center order-2 lg:order-1">
            {slides.map((slide, idx) => (
              <div
                key={slide.id}
                className={`w-full space-y-6 text-center lg:text-left transition-all duration-700 ease-out ${
                  idx === current
                    ? "opacity-100 translate-y-0 relative z-10"
                    : "opacity-0 translate-y-4 absolute inset-0 pointer-events-none z-0"
                }`}
              >
                {/* Category Tag Pill */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-semibold tracking-wide uppercase">
                  <span className={`px-2 py-0.5 rounded-md border text-[11px] font-bold ${slide.accentBadgeColor}`}>
                    {slide.categoryTag}
                  </span>
                  <span className="text-zinc-400 text-xs hidden sm:inline">Collection 2026</span>
                </div>

                {/* Headline */}
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.12] text-white">
                  {slide.headline}
                </h1>

                {/* Supporting Text */}
                <p className="text-base sm:text-lg text-zinc-300 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                  {slide.supportingText}
                </p>

                {/* Special Offer Voucher Block (Slide 5 only) */}
                {slide.isOfferSlide && (
                  <div className="p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 max-w-md mx-auto lg:mx-0 flex items-center justify-between gap-3 shadow-xl">
                    <div>
                      <div className="text-[11px] uppercase tracking-wider text-purple-300 font-semibold flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5" /> First-Time Customer Offer
                      </div>
                      <div className="text-lg sm:text-xl font-bold font-mono tracking-wider text-white mt-0.5">
                        {slide.couponCode}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => handleCopyCode(slide.couponCode || "WELCOME10")}
                      className="rounded-lg gap-1.5 font-semibold text-xs bg-white text-black hover:bg-zinc-200"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? "Copied" : "Copy Code"}</span>
                    </Button>
                  </div>
                )}

                {/* Feature Highlights Grid */}
                <div className="grid grid-cols-2 gap-2.5 max-w-md mx-auto lg:mx-0 pt-1 text-left">
                  {slide.highlights.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-2 text-xs sm:text-sm text-zinc-300">
                      <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
                      <span className="truncate">{feat}</span>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3.5 justify-center lg:justify-start pt-3">
                  <Button
                    size="lg"
                    className="rounded-xl gap-2 font-semibold text-sm sm:text-base px-6 h-12 shadow-lg shadow-black/40 bg-white text-black hover:bg-zinc-100 hover:scale-[1.02] transition-all"
                    asChild
                  >
                    <Link href={slide.ctaHref}>
                      {slide.ctaText} <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="rounded-xl font-semibold text-sm sm:text-base px-6 h-12 border-white/20 text-white bg-white/5 hover:bg-white/15 hover:text-white backdrop-blur-sm"
                    asChild
                  >
                    <Link href={slide.productHref}>
                      View Product
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: Hero Visual Product Showcase */}
          <div className="lg:col-span-6 order-1 lg:order-2">
            <div className="relative mx-auto w-full max-w-md sm:max-w-lg aspect-square">
              {slides.map((slide, idx) => (
                <div
                  key={slide.id}
                  className={`absolute inset-0 transition-all duration-700 ease-out ${
                    idx === current
                      ? "opacity-100 scale-100 translate-y-0 z-10"
                      : "opacity-0 scale-95 translate-y-3 pointer-events-none z-0"
                  }`}
                >
                  <div className="relative w-full h-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-white/15 bg-black/40 backdrop-blur-sm group">
                    <Image
                      src={slide.imageSrc}
                      alt={slide.imageAlt}
                      fill
                      priority={idx === 0}
                      sizes="(max-width: 640px) 90vw, (max-width: 1024px) 500px, 550px"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />

                    {/* Gradient overlay on the image for depth */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                    {/* Bottom floating product card meta */}
                    <div className="absolute bottom-0 inset-x-0 p-5 sm:p-6 text-white space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">
                            {slide.categoryTag}
                          </p>
                          <h3 className="text-base sm:text-lg font-bold truncate max-w-[260px] sm:max-w-xs">
                            {slide.productName}
                          </h3>
                        </div>
                        {slide.priceFormatted && (
                          <div className="text-right shrink-0">
                            <span className="text-xs text-zinc-400 block font-medium">Starting at</span>
                            <span className="text-base sm:text-xl font-extrabold text-white">
                              {slide.priceFormatted}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Navigation Arrows (Desktop & Tablet) */}
      <button
        type="button"
        onClick={prevSlide}
        aria-label="Previous slide"
        className="hidden sm:flex absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full items-center justify-center bg-black/40 hover:bg-black/80 backdrop-blur-md text-white border border-white/15 transition shadow-lg hover:scale-110 active:scale-95"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        type="button"
        onClick={nextSlide}
        aria-label="Next slide"
        className="hidden sm:flex absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full items-center justify-center bg-black/40 hover:bg-black/80 backdrop-blur-md text-white border border-white/15 transition shadow-lg hover:scale-110 active:scale-95"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dot / Pill Pagination Controls */}
      <div className="absolute bottom-4 sm:bottom-6 inset-x-0 z-20 flex items-center justify-center gap-2">
        {slides.map((s, idx) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setCurrent(idx)}
            aria-label={`Go to slide ${idx + 1}: ${s.categoryTag}`}
            className={`h-2 rounded-full transition-all duration-300 ${
              idx === current
                ? "w-8 bg-white shadow-md shadow-white/30"
                : "w-2.5 bg-white/30 hover:bg-white/60"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
