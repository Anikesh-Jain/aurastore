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
  ambientGlow: string;
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
    gradientTheme: "from-[#0B1020] via-[#0D152A] to-[#111827]",
    ambientGlow: "rgba(37, 99, 235, 0.32)",
    accentBadgeColor: "bg-blue-500/15 text-blue-400 border-blue-400/30",
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
    gradientTheme: "from-[#0B1020] via-[#0D152A] to-[#111827]",
    ambientGlow: "rgba(56, 189, 248, 0.28)",
    accentBadgeColor: "bg-sky-500/15 text-sky-400 border-sky-400/30",
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
    gradientTheme: "from-[#0B1020] via-[#0D152A] to-[#111827]",
    ambientGlow: "rgba(96, 165, 250, 0.26)",
    accentBadgeColor: "bg-blue-500/15 text-blue-300 border-blue-400/30",
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
    gradientTheme: "from-[#0B1020] via-[#0D152A] to-[#111827]",
    ambientGlow: "rgba(37, 99, 235, 0.28)",
    accentBadgeColor: "bg-sky-500/15 text-sky-300 border-sky-400/30",
  },

  // SLIDE 5 — SPECIAL OFFER
  {
    id: "slide-offer",
    categoryTag: "Welcome Privileges",
    headline: "Something Special Is Waiting.",
    supportingText: "Get 10% OFF your first AuraStore order.",
    ctaText: "Shop Now",
    ctaHref: "/products",
    productName: "Curated AuraStore First Order Privilege",
    productHref: "/products",
    imageSrc: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&auto=format&fit=crop&q=80",
    imageAlt: "AuraStore Signature Gear Collection",
    highlights: [
      "10% Instant Order Discount",
      "Valid Across All Collections",
      "Complimentary Express Delivery",
      "30-Day Guaranteed Returns",
    ],
    gradientTheme: "from-[#0B1020] via-[#0D152A] to-[#111827]",
    ambientGlow: "rgba(56, 189, 248, 0.32)",
    accentBadgeColor: "bg-blue-500/15 text-blue-300 border-blue-400/30",
    isOfferSlide: true,
    couponCode: "WELCOME10",
  },
];

export function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [copied, setCopied] = useState(false);

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  const goToSlide = useCallback((idx: number) => {
    setCurrent(idx);
  }, []);

  // Autoplay effect (~5 seconds)
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
    if (deltaX > 45) {
      nextSlide();
    } else if (deltaX < -45) {
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
      className="relative w-full overflow-hidden bg-[#0B1020] text-white select-none border-b border-blue-900/30"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Horizontal Sliding Track (Entire Slide Moves 100% Across the Screen) */}
      <div
        className="flex w-full will-change-transform transition-transform duration-700 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]"
        style={{ transform: `translate3d(-${current * 100}%, 0px, 0px)` }}
      >
        {slides.map((slide, idx) => {
          const isActive = idx === current;
          return (
            <div
              key={slide.id}
              aria-hidden={!isActive}
              className="relative w-full min-w-full shrink-0 flex-none overflow-hidden min-h-[580px] sm:min-h-[620px] lg:min-h-[660px] flex items-center py-12 md:py-16"
            >
              {/* Slide-specific Ambient Background */}
              <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-gradient-to-br from-[#0B1020] via-[#0D152A] to-[#111827]">
                {/* Ambient Radial Glow behind product */}
                <div
                  className="absolute top-1/2 right-[10%] -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[115px] pointer-events-none transition-all duration-700"
                  style={{ backgroundColor: slide.ambientGlow }}
                />
                <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.08),transparent_60%)]" />
                <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-[#0B1020] to-transparent" />
              </div>

              {/* Slide Content */}
              <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
                  
                  {/* Left Column: Typography & CTAs */}
                  <div className="lg:col-span-6 space-y-6 text-center lg:text-left order-2 lg:order-1">
                    {/* Category Tag Glass Pill */}
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/20 bg-white/[0.08] backdrop-blur-md text-xs font-semibold tracking-wide uppercase shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]">
                      <span className={`px-2 py-0.5 rounded-md border text-[11px] font-bold ${slide.accentBadgeColor}`}>
                        {slide.categoryTag}
                      </span>
                      <span className="text-zinc-400 text-xs hidden sm:inline">2026 Collection</span>
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
                      <div className="p-4 rounded-2xl bg-white/[0.08] backdrop-blur-xl border border-blue-400/35 max-w-md mx-auto lg:mx-0 flex items-center justify-between gap-3 shadow-[0_8px_32px_rgba(0,0,0,0.5),0_0_20px_-3px_rgba(37,99,235,0.3)]">
                        <div>
                          <div className="text-[11px] uppercase tracking-wider text-sky-300 font-semibold flex items-center gap-1.5">
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
                          className="rounded-xl gap-1.5 font-semibold text-xs bg-blue-600 text-white hover:bg-blue-500 transition-all duration-200 hover:scale-105 active:scale-95 shadow-md shadow-blue-900/40"
                        >
                          {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copied ? "Copied" : "Copy Code"}</span>
                        </Button>
                      </div>
                    )}

                    {/* Feature Highlights Grid with Subtle Glass Tags */}
                    <div className="grid grid-cols-2 gap-2.5 max-w-md mx-auto lg:mx-0 pt-1 text-left">
                      {slide.highlights.map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.05] backdrop-blur-md border border-white/10 text-xs sm:text-sm text-zinc-200 shadow-sm">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          <span className="truncate font-medium">{feat}</span>
                        </div>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3.5 justify-center lg:justify-start pt-3">
                      <Button
                        size="lg"
                        className="group rounded-xl gap-2 font-semibold text-sm sm:text-base px-6 h-12 shadow-xl shadow-blue-950/50 bg-blue-600 text-white hover:bg-blue-500 hover:scale-[1.03] active:scale-95 transition-all duration-200"
                        asChild
                      >
                        <Link href={slide.ctaHref}>
                          <span>{slide.ctaText}</span>
                          <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                        </Link>
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        className="rounded-xl font-semibold text-sm sm:text-base px-6 h-12 border-white/20 text-white bg-white/[0.08] hover:bg-white/[0.16] hover:text-white hover:border-blue-400/40 backdrop-blur-md hover:scale-[1.02] active:scale-95 transition-all duration-200 shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
                        asChild
                      >
                        <Link href={slide.productHref}>
                          View Product
                        </Link>
                      </Button>
                    </div>
                  </div>

                  {/* Right Column: Natural Product Presentation with Frosted Glass Stage */}
                  <div className="lg:col-span-6 order-1 lg:order-2 flex items-center justify-center">
                    <div className="relative w-full max-w-md sm:max-w-lg aspect-[4/3] sm:aspect-square flex items-center justify-center p-2 sm:p-3">
                      {/* Visible Frosted Glass Stage Pedestal */}
                      <div className="relative w-full h-[90%] rounded-3xl overflow-hidden p-2.5 sm:p-3 bg-white/[0.07] backdrop-blur-2xl border border-white/20 shadow-[0_25px_60px_rgba(0,0,0,0.75),inset_0_1px_0_rgba(255,255,255,0.25)] group">
                        <div className="relative w-full h-full rounded-2xl overflow-hidden">
                          <Image
                            src={slide.imageSrc}
                            alt={slide.imageAlt}
                            fill
                            priority={idx === 0}
                            sizes="(max-width: 640px) 92vw, (max-width: 1024px) 480px, 540px"
                            className="object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.05]"
                          />

                          {/* Subtle lighting edge vignette */}
                          <div className="absolute inset-0 bg-gradient-to-t from-[#0B1020]/90 via-[#0B1020]/20 to-transparent pointer-events-none" />

                          {/* Ambient Glass Floating Badge at bottom */}
                          <div className="absolute bottom-3 inset-x-3 p-3.5 rounded-xl bg-[#0B1020]/75 backdrop-blur-xl border border-white/25 flex items-center justify-between gap-3 text-white transition-all duration-300 group-hover:bg-[#0B1020]/90 group-hover:border-blue-400/50 shadow-[0_8px_32px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.15)]">
                            <div className="truncate">
                              <p className="text-[10px] uppercase tracking-wider text-sky-400 font-semibold">
                                {slide.categoryTag}
                              </p>
                              <h3 className="text-xs sm:text-sm font-bold truncate">
                                {slide.productName}
                              </h3>
                            </div>
                            {slide.priceFormatted && (
                              <div className="text-right shrink-0">
                                <span className="text-[10px] text-zinc-400 block leading-tight">Starting at</span>
                                <span className="text-sm sm:text-base font-extrabold text-white">
                                  {slide.priceFormatted}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Arrows with Real Visible Glass Styling */}
      <button
        type="button"
        onClick={prevSlide}
        aria-label="Previous slide"
        className="hidden sm:flex absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full items-center justify-center bg-white/[0.08] hover:bg-white/[0.16] backdrop-blur-xl text-white hover:text-blue-400 border border-white/20 hover:border-blue-400/50 transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.2)] hover:shadow-[0_0_25px_rgba(37,99,235,0.4)] hover:scale-110 active:scale-95 cursor-pointer"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        type="button"
        onClick={nextSlide}
        aria-label="Next slide"
        className="hidden sm:flex absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full items-center justify-center bg-white/[0.08] hover:bg-white/[0.16] backdrop-blur-xl text-white hover:text-blue-400 border border-white/20 hover:border-blue-400/50 transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.2)] hover:shadow-[0_0_25px_rgba(37,99,235,0.4)] hover:scale-110 active:scale-95 cursor-pointer"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Real Glass Pagination Capsule */}
      <div className="absolute bottom-5 sm:bottom-6 inset-x-0 z-20 flex items-center justify-center">
        <div className="bg-[#0B1020]/60 backdrop-blur-xl border border-white/20 rounded-full px-3.5 py-1.5 flex items-center gap-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.15)]">
          {slides.map((s, idx) => (
            <button
              key={s.id}
              type="button"
              onClick={() => goToSlide(idx)}
              aria-label={`Go to slide ${idx + 1}: ${s.categoryTag}`}
              className={`h-2 rounded-full transition-all duration-500 cursor-pointer ${
                idx === current
                  ? "w-8 bg-blue-500 shadow-[0_0_14px_rgba(37,99,235,0.9)]"
                  : "w-2 bg-white/25 hover:bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
