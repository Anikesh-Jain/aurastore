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
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

interface SlideData {
  id: string;
  categoryTag: string;
  categorySlug: string;
  headline: string;
  supportingText: string;
  ctaText: string;
  ctaHref: string;
  productName: string;
  productHref: string;
  productSlug: string;
  priceFormatted: string;
  originalPriceFormatted?: string;
  imageSrc: string;
  imageAlt: string;
  highlights: string[];
  badgeClass: string;
  lightGlow: string;
  darkGlow: string;
  isOfferSlide?: boolean;
  couponCode?: string;
}

const slides: SlideData[] = [
  // SLIDE 1 — AUDIO
  {
    id: "slide-audio",
    categoryTag: "Aura Sound Lab",
    categorySlug: "audio-wearables",
    headline: "Hear Every Detail.",
    supportingText: "Studio-grade acoustics with active noise cancellation and 40-hour endurance.",
    ctaText: "Shop Audio",
    ctaHref: "/products/aura-pro-wireless-anc-headphones",
    productName: "Aura Pro Wireless ANC Headphones",
    productHref: "/products/aura-pro-wireless-anc-headphones",
    productSlug: "aura-pro-wireless-anc-headphones",
    priceFormatted: "₹16,999",
    originalPriceFormatted: "₹19,999",
    imageSrc: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1000&auto=format&fit=crop&q=80",
    imageAlt: "Aura Pro Wireless ANC Studio Headphones",
    highlights: [
      "Active Noise Cancellation",
      "Up to 40 Hours Battery",
      "Bluetooth 5.3 Low-Latency",
      "Memory Foam Comfort",
    ],
    badgeClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25",
    lightGlow: "rgba(37, 99, 235, 0.14)",
    darkGlow: "rgba(37, 99, 235, 0.32)",
  },

  // SLIDE 2 — WEARABLES
  {
    id: "slide-wearables",
    categoryTag: "Precision Wearables",
    categorySlug: "audio-wearables",
    headline: "Engineered For Movement.",
    supportingText: "Grade 5 titanium chassis with aerospace health sensors and multi-day battery.",
    ctaText: "Shop Smartwatch",
    ctaHref: "/products/chronos-stealth-smartwatch-series-7",
    productName: "Chronos Stealth Smartwatch Series 7",
    productHref: "/products/chronos-stealth-smartwatch-series-7",
    productSlug: "chronos-stealth-smartwatch-series-7",
    priceFormatted: "₹21,999",
    originalPriceFormatted: "₹24,999",
    imageSrc: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1000&auto=format&fit=crop&q=80",
    imageAlt: "Chronos Stealth Smartwatch Series 7",
    highlights: [
      "Always-On Retina AMOLED",
      "Grade 5 Titanium Casing",
      "Precision Sensor Suite",
      "50M Water Resistance",
    ],
    badgeClass: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/25",
    lightGlow: "rgba(14, 165, 233, 0.14)",
    darkGlow: "rgba(56, 189, 248, 0.28)",
  },

  // SLIDE 3 — FASHION
  {
    id: "slide-fashion",
    categoryTag: "Contemporary Essentials",
    categorySlug: "fashion",
    headline: "Comfort Without Compromise.",
    supportingText: "450 GSM organic French terry cotton with tailored modern drop-shoulder silhouette.",
    ctaText: "Shop Apparel",
    ctaHref: "/products/zenith-heavyweight-cotton-hoodie",
    productName: "Zenith Heavyweight 450 GSM Cotton Hoodie",
    productHref: "/products/zenith-heavyweight-cotton-hoodie",
    productSlug: "zenith-heavyweight-cotton-hoodie",
    priceFormatted: "₹2,799",
    originalPriceFormatted: "₹3,499",
    imageSrc: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=1000&auto=format&fit=crop&q=80",
    imageAlt: "Zenith Heavyweight Cotton Hoodie",
    highlights: [
      "450 GSM French Terry",
      "Tailored Silhouette",
      "100% Organic Combed Cotton",
      "Pre-Shrunk Double Weave",
    ],
    badgeClass: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/25",
    lightGlow: "rgba(99, 102, 241, 0.12)",
    darkGlow: "rgba(96, 165, 250, 0.26)",
  },

  // SLIDE 4 — HOME & LIVING
  {
    id: "slide-home",
    categoryTag: "Intelligent Living",
    categorySlug: "home-living",
    headline: "Illuminate Your Workspace.",
    supportingText: "Dynamic circadian color temperature regulation and integrated fast wireless charging.",
    ctaText: "Shop Desk Lamp",
    ctaHref: "/products/lumina-smart-ambient-desk-lamp",
    productName: "Lumina Smart Ambient Desk Lamp",
    productHref: "/products/lumina-smart-ambient-desk-lamp",
    productSlug: "lumina-smart-ambient-desk-lamp",
    priceFormatted: "₹5,999",
    originalPriceFormatted: "₹6,999",
    imageSrc: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=1000&auto=format&fit=crop&q=80",
    imageAlt: "Lumina Smart Ambient Desk Lamp",
    highlights: [
      "Dynamic Circadian Lighting",
      "Anodized Aluminum Body",
      "Fast Qi Wireless Base",
      "Touch Slide Dimming",
    ],
    badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25",
    lightGlow: "rgba(245, 158, 11, 0.12)",
    darkGlow: "rgba(37, 99, 235, 0.28)",
  },

  // SLIDE 5 — SPECIAL OFFER / FLAGSHIP PHONE
  {
    id: "slide-offer",
    categoryTag: "Flagship Showcase",
    categorySlug: "electronics",
    headline: "Ultimate Power, Unlocked.",
    supportingText: "Experience Snapdragon 8 Gen 3 performance. Save 10% on your first order with code WELCOME10.",
    ctaText: "Shop Apex Pro",
    ctaHref: "/products/apex-pro-ultra-smartphone-5g",
    productName: "Apex Pro Ultra 5G Smartphone",
    productHref: "/products/apex-pro-ultra-smartphone-5g",
    productSlug: "apex-pro-ultra-smartphone-5g",
    priceFormatted: "₹59,999",
    originalPriceFormatted: "₹64,999",
    imageSrc: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1000&auto=format&fit=crop&q=80",
    imageAlt: "Apex Pro Ultra 5G Smartphone",
    highlights: [
      "10% Off First Order",
      "Snapdragon 8 Gen 3",
      "120Hz LTPO AMOLED",
      "Free Express Delivery",
    ],
    badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25",
    lightGlow: "rgba(16, 185, 129, 0.14)",
    darkGlow: "rgba(56, 189, 248, 0.32)",
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

  // Autoplay (~5.5 seconds)
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(nextSlide, 5500);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  // Lightweight browser-compatible image cache for the next upcoming slide
  // (No hidden DOM elements, no Link tags, no hydration cost)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const nextIdx = (current + 1) % slides.length;
    const nextImgSrc = slides[nextIdx]?.imageSrc;
    if (nextImgSrc) {
      const img = new window.Image();
      img.src = nextImgSrc;
    }
  }, [current]);

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

  const handleCopyCode = (e: React.MouseEvent, code: string) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success(`Coupon code "${code}" copied to clipboard!`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured Collections"
      className="relative w-full overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-100/80 dark:bg-[#0B1020] text-slate-900 dark:text-white select-none border-b border-slate-200/80 dark:border-blue-900/30 transition-colors duration-300"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Horizontal Sliding Track (Single transform track for smooth sliding) */}
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
              className="relative w-full min-w-full shrink-0 flex-none overflow-hidden min-h-[560px] sm:min-h-[600px] lg:min-h-[640px] flex items-center py-10 sm:py-12 lg:py-16"
            >
              {/* Slide-specific Ambient Background Lighting */}
              <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                {/* Light mode soft gradients */}
                <div
                  className="absolute top-1/2 right-[12%] -translate-y-1/2 w-[480px] h-[480px] rounded-full blur-[100px] pointer-events-none transition-all duration-700 dark:hidden"
                  style={{ backgroundColor: slide.lightGlow }}
                />
                {/* Dark mode electric navy glow */}
                <div
                  className="absolute top-1/2 right-[10%] -translate-y-1/2 w-[520px] h-[520px] rounded-full blur-[115px] pointer-events-none transition-all duration-700 hidden dark:block"
                  style={{ backgroundColor: slide.darkGlow }}
                />
                <div className="absolute -top-32 -left-32 w-80 h-80 bg-blue-500/5 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 right-1/4 w-72 h-72 bg-sky-500/5 dark:bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
              </div>

              {/* Slide Content Container */}
              <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                  
                  {/* Left Column: Typography & CTAs */}
                  <div className="lg:col-span-6 space-y-5 sm:space-y-6 text-center lg:text-left order-2 lg:order-1">
                    {/* Category Tag Pill */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full border border-slate-200/80 dark:border-white/20 bg-white/80 dark:bg-white/[0.08] backdrop-blur-md text-xs font-semibold tracking-wide uppercase shadow-sm">
                      <span className={`px-2 py-0.5 rounded-md border text-[11px] font-bold ${slide.badgeClass}`}>
                        {slide.categoryTag}
                      </span>
                      <span className="text-slate-500 dark:text-zinc-400 text-xs hidden sm:inline">
                        Verified Collection
                      </span>
                    </div>

                    {/* Headline */}
                    <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.12] text-slate-900 dark:text-white">
                      {slide.headline}
                    </h1>

                    {/* Supporting Text */}
                    <p className="text-base sm:text-lg text-slate-600 dark:text-zinc-300 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                      {slide.supportingText}
                    </p>

                    {/* Special Offer Voucher Block (Slide 5 only) */}
                    {slide.isOfferSlide && (
                      <div className="p-4 rounded-2xl bg-white/90 dark:bg-white/[0.08] backdrop-blur-xl border border-emerald-200 dark:border-emerald-500/30 max-w-md mx-auto lg:mx-0 flex items-center justify-between gap-3 shadow-md dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
                        <div>
                          <div className="text-[11px] uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                            <Tag className="w-3.5 h-3.5" /> First-Time Customer Offer
                          </div>
                          <div className="text-lg sm:text-xl font-bold font-mono tracking-wider text-slate-900 dark:text-white mt-0.5">
                            {slide.couponCode}
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={(e) => handleCopyCode(e, slide.couponCode || "WELCOME10")}
                          className="rounded-xl gap-1.5 font-semibold text-xs bg-emerald-600 text-white hover:bg-emerald-500 transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm"
                        >
                          {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copied ? "Copied" : "Copy Code"}</span>
                        </Button>
                      </div>
                    )}

                    {/* Feature Highlights Grid */}
                    <div className="grid grid-cols-2 gap-2.5 max-w-md mx-auto lg:mx-0 pt-1 text-left">
                      {slide.highlights.map((feat, fIdx) => (
                        <div
                          key={fIdx}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/80 dark:bg-white/[0.05] backdrop-blur-md border border-slate-200/80 dark:border-white/10 text-xs sm:text-sm text-slate-700 dark:text-zinc-200 shadow-sm"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                          <span className="truncate font-medium">{feat}</span>
                        </div>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3.5 justify-center lg:justify-start pt-3">
                      <Button
                        size="lg"
                        className="group rounded-xl gap-2 font-semibold text-sm sm:text-base px-6 h-12 shadow-lg shadow-blue-500/20 dark:shadow-blue-950/50 bg-blue-600 text-white hover:bg-blue-500 hover:scale-[1.02] active:scale-95 transition-all duration-200"
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
                        className="rounded-xl font-semibold text-sm sm:text-base px-6 h-12 border-slate-300 dark:border-white/20 text-slate-800 dark:text-white bg-white/80 dark:bg-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/[0.16] hover:text-blue-600 dark:hover:text-white backdrop-blur-md hover:scale-[1.02] active:scale-95 transition-all duration-200 shadow-sm"
                        asChild
                      >
                        <Link href={slide.productHref}>
                          View Details
                        </Link>
                      </Button>
                    </div>
                  </div>

                  {/* Right Column: Clickable Product Stage with Frosted Glass Surfaces */}
                  <div className="lg:col-span-6 order-1 lg:order-2 flex items-center justify-center">
                    <Link
                      href={slide.productHref}
                      aria-label={`View product details for ${slide.productName}`}
                      className="group/stage relative w-full max-w-md sm:max-w-lg aspect-[4/3] sm:aspect-square flex items-center justify-center p-2 sm:p-3 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-3xl"
                    >
                      {/* Premium Frosted Glass Pedestal */}
                      <div className="relative w-full h-[92%] rounded-3xl overflow-hidden p-2.5 sm:p-3 bg-white/75 dark:bg-white/[0.07] backdrop-blur-2xl border border-slate-200/80 dark:border-white/20 shadow-[0_20px_50px_rgba(15,23,42,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.75),inset_0_1px_0_rgba(255,255,255,0.2)] transition-all duration-500 group-hover/stage:shadow-[0_24px_60px_rgba(37,99,235,0.15)] dark:group-hover/stage:shadow-[0_25px_70px_rgba(37,99,235,0.25)] group-hover/stage:border-blue-400/40">
                        <div className="relative w-full h-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-900/50">
                          <Image
                            src={slide.imageSrc}
                            alt={slide.imageAlt}
                            fill
                            priority={idx === 0}
                            sizes="(max-width: 640px) 92vw, (max-width: 1024px) 480px, 540px"
                            className="object-cover transition-transform duration-700 ease-out group-hover/stage:scale-105"
                          />

                          {/* Light/Dark gradient overlay to ground the image */}
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent dark:from-[#0B1020]/90 dark:via-[#0B1020]/20 pointer-events-none" />

                          {/* Ambient Glass Floating Product Badge inside the card */}
                          <div className="absolute bottom-3 inset-x-3 p-3 sm:p-3.5 rounded-xl bg-white/90 dark:bg-[#0B1020]/80 backdrop-blur-xl border border-slate-200/80 dark:border-white/20 flex items-center justify-between gap-3 text-slate-900 dark:text-white transition-all duration-300 shadow-md dark:shadow-[0_8px_32px_rgba(0,0,0,0.6)] group-hover/stage:border-blue-500/40">
                            <div className="truncate">
                              <p className="text-[10px] uppercase tracking-wider text-blue-600 dark:text-sky-400 font-bold">
                                {slide.categoryTag}
                              </p>
                              <h3 className="text-xs sm:text-sm font-bold truncate">
                                {slide.productName}
                              </h3>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="flex items-baseline gap-1.5 justify-end">
                                {slide.originalPriceFormatted && (
                                  <span className="text-[11px] text-slate-400 dark:text-zinc-400 line-through">
                                    {slide.originalPriceFormatted}
                                  </span>
                                )}
                                <span className="text-sm sm:text-base font-extrabold text-blue-600 dark:text-white">
                                  {slide.priceFormatted}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-500 dark:text-zinc-400 inline-flex items-center gap-0.5 justify-end font-medium">
                                View product <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>

                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Arrows with Frosted Glass Styling */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          prevSlide();
        }}
        aria-label="Previous slide"
        className="hidden sm:flex absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-12 sm:h-12 rounded-full items-center justify-center bg-white/80 dark:bg-white/[0.08] hover:bg-white dark:hover:bg-white/[0.18] backdrop-blur-xl text-slate-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200/90 dark:border-white/20 hover:border-blue-400/50 transition-all duration-300 shadow-md dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] hover:scale-110 active:scale-95 cursor-pointer"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          nextSlide();
        }}
        aria-label="Next slide"
        className="hidden sm:flex absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-12 sm:h-12 rounded-full items-center justify-center bg-white/80 dark:bg-white/[0.08] hover:bg-white dark:hover:bg-white/[0.18] backdrop-blur-xl text-slate-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200/90 dark:border-white/20 hover:border-blue-400/50 transition-all duration-300 shadow-md dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] hover:scale-110 active:scale-95 cursor-pointer"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Frosted Glass Pagination Pill */}
      <div className="absolute bottom-4 sm:bottom-6 inset-x-0 z-20 flex items-center justify-center pointer-events-none">
        <div className="bg-white/85 dark:bg-[#0B1020]/70 backdrop-blur-xl border border-slate-200/90 dark:border-white/20 rounded-full px-3.5 py-1.5 flex items-center gap-2.5 shadow-md dark:shadow-[0_8px_32px_rgba(0,0,0,0.6)] pointer-events-auto">
          {slides.map((s, idx) => (
            <button
              key={s.id}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                goToSlide(idx);
              }}
              aria-label={`Go to slide ${idx + 1}: ${s.categoryTag}`}
              className={`h-2 rounded-full transition-all duration-500 cursor-pointer ${
                idx === current
                  ? "w-8 bg-blue-600 dark:bg-blue-500 shadow-[0_0_12px_rgba(37,99,235,0.7)]"
                  : "w-2 bg-slate-300 hover:bg-slate-400 dark:bg-white/25 dark:hover:bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
