"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShoppingBag, ShieldCheck, Truck, Clock, RefreshCcw, Heart, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setSubscribed(true);
    toast.success("Thank you for subscribing to AuraStore updates and flash deals!");
    setEmail("");
  };

  return (
    <footer className="border-t bg-muted/30">
      {/* Value Proposition Highlights */}
      <div className="border-b bg-muted/50">
        <div className="container mx-auto px-4 py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold">Free Express Shipping</h4>
              <p className="text-xs text-muted-foreground">On all orders above ₹1,999</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold">100% Secure Checkout</h4>
              <p className="text-xs text-muted-foreground">Encrypted Razorpay UPI & Cards</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <RefreshCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold">30-Day Easy Returns</h4>
              <p className="text-xs text-muted-foreground">Hassle-free replacement policy</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold">24/7 Dedicated Support</h4>
              <p className="text-xs text-muted-foreground">Live chat & email assistance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="container mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <Link href="/" className="inline-flex items-center gap-2 text-xl font-bold">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <span>AuraStore</span>
          </Link>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Engineered for discerning modern lifestyles. Premium electronics, smart wearables, and designer lifestyle essentials delivered straight to your door.
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-sm mb-4">Shop Categories</h3>
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            <li>
              <Link href="/products?category=electronics" className="hover:text-primary transition">
                Electronics & Gadgets
              </Link>
            </li>
            <li>
              <Link href="/products?category=audio-wearables" className="hover:text-primary transition">
                Audio & Smartwatches
              </Link>
            </li>
            <li>
              <Link href="/products?category=fashion" className="hover:text-primary transition">
                Fashion & Lifestyle
              </Link>
            </li>
            <li>
              <Link href="/products?category=home-living" className="hover:text-primary transition">
                Home & Smart Living
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-sm mb-4">Customer Account</h3>
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            <li>
              <Link href="/profile" className="hover:text-primary transition">
                My Profile & Addresses
              </Link>
            </li>
            <li>
              <Link href="/orders" className="hover:text-primary transition">
                Track Orders
              </Link>
            </li>
            <li>
              <Link href="/wishlist" className="hover:text-primary transition">
                Saved Wishlist
              </Link>
            </li>
            <li>
              <Link href="/cart" className="hover:text-primary transition">
                Shopping Cart
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-sm mb-4">Stay Connected</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Subscribe for flash sales, new product drops, and coupon codes.
          </p>
          {subscribed ? (
            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Subscribed! Check your inbox for updates.</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                required
              />
              <button
                type="submit"
                className="bg-primary text-primary-foreground font-medium px-4 py-1 rounded-md text-sm hover:bg-primary/90 transition shrink-0"
              >
                Join
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 border-t flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-4">
        <p>&copy; {new Date().getFullYear()} AuraStore Inc. All rights reserved.</p>
        <div className="flex items-center gap-1">
          <span>Crafted with</span>
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          <span>using Next.js 15, PostgreSQL & Razorpay</span>
        </div>
      </div>
    </footer>
  );
}
