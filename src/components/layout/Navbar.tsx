"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useCartStore } from "@/stores/cartStore";
import { useWishlistStore } from "@/stores/wishlistStore";
import { ModeToggle } from "@/components/layout/ModeToggle";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ShoppingBag,
  Heart,
  Search,
  User,
  LayoutDashboard,
  Package,
  LogOut,
  LogIn,
  Menu,
  X,
  Sparkles,
} from "lucide-react";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function DesktopNavLinks() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category");

  const navLinks = [
    { name: "All Products", href: "/products", isActive: pathname === "/products" && !currentCategory },
    { name: "Electronics", href: "/products?category=electronics", isActive: pathname === "/products" && currentCategory === "electronics" },
    { name: "Audio", href: "/products?category=audio-wearables", isActive: pathname === "/products" && currentCategory === "audio-wearables" },
    { name: "Fashion", href: "/products?category=fashion", isActive: pathname === "/products" && currentCategory === "fashion" },
    { name: "Home & Living", href: "/products?category=home-living", isActive: pathname === "/products" && currentCategory === "home-living" },
  ];

  return (
    <nav className="hidden lg:flex items-center gap-1.5 text-sm font-medium">
      {navLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
            link.isActive
              ? "bg-blue-600 text-white shadow-sm ring-2 ring-blue-500/25"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
          }`}
        >
          {link.name}
        </Link>
      ))}
    </nav>
  );
}

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const cartCount = useCartStore((state) => state.getCartCount());
  const wishlistItems = useWishlistStore((state) => state.items);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { name: "All Products", href: "/products" },
    { name: "Electronics", href: "/products?category=electronics" },
    { name: "Audio", href: "/products?category=audio-wearables" },
    { name: "Fashion", href: "/products?category=fashion" },
    { name: "Home & Living", href: "/products?category=home-living" },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm transition-colors duration-200">
        {/* Top Promotional Bar in AuraStore Adaptive Palette */}
        <div className="bg-blue-50/90 text-blue-950 border-b border-blue-200/70 dark:bg-[#0B1020] dark:text-zinc-300 dark:border-blue-900/30 text-xs py-1.5 px-4 text-center font-medium tracking-wide flex items-center justify-center gap-2 transition-colors duration-200">
          <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
          <span>Use code <strong className="text-blue-700 dark:text-sky-400 font-bold">WELCOME20</strong> for 20% off on orders over ₹2,000! &bull; Free Shipping over ₹1,999</span>
        </div>

        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link href="/" className="group flex items-center gap-2 font-bold text-xl tracking-tight shrink-0">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm group-hover:scale-105 group-hover:shadow-md group-hover:shadow-blue-500/30 transition-all duration-300">
              <ShoppingBag className="w-5 h-5 transition-transform duration-300 group-hover:rotate-6" />
            </div>
            <span className="hidden sm:inline-block bg-gradient-to-r from-blue-600 via-blue-500 to-sky-500 bg-clip-text text-transparent font-extrabold tracking-tight">
              AuraStore
            </span>
          </Link>

          {/* Desktop Nav Links with Active State */}
          <Suspense fallback={<div className="hidden lg:flex items-center gap-2 h-8 w-80" />}>
            <DesktopNavLinks />
          </Suspense>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-sm relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-muted-foreground pointer-events-none" />
            <Input
              type="search"
              placeholder="Search products, brands, gear..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 w-full rounded-full bg-muted/40 hover:bg-muted/60 focus:bg-background border-border/50 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
            />
          </form>

          {/* Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <ModeToggle />

            {/* Wishlist Link */}
            <Link href="/wishlist">
              <Button
                variant="ghost"
                size="icon"
                className="relative rounded-full hover:bg-muted/80 hover:text-primary transition-all duration-200 hover:scale-105 active:scale-95"
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5" />
                {mounted && wishlistItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                    {wishlistItems.length}
                  </span>
                )}
              </Button>
            </Link>

            {/* Cart Trigger */}
            <Button
              variant="ghost"
              size="icon"
              className="relative rounded-full hover:bg-muted/80 hover:text-primary transition-all duration-200 hover:scale-105 active:scale-95"
              onClick={() => setCartDrawerOpen(true)}
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {mounted && cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                  {cartCount}
                </span>
              )}
            </Button>

            {/* User Profile / Auth */}
            {session?.user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 rounded-full px-3">
                    <User className="w-4 h-4 text-primary" />
                    <span className="hidden md:inline-block max-w-[100px] truncate text-xs font-semibold">
                      {session.user.name || "Account"}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="font-medium text-sm">{session.user.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{session.user.email}</div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  {session.user.role === "ADMIN" && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="cursor-pointer text-primary font-semibold flex items-center gap-2">
                          <LayoutDashboard className="w-4 h-4" /> Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}

                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer flex items-center gap-2">
                      <User className="w-4 h-4" /> My Profile & Addresses
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link href="/orders" className="cursor-pointer flex items-center gap-2">
                      <Package className="w-4 h-4" /> My Orders
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="cursor-pointer text-destructive focus:text-destructive flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/auth/signin">
                <Button size="sm" className="gap-1.5">
                  <LogIn className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign In</span>
                </Button>
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Nav Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t bg-background p-4 space-y-4">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 w-full bg-muted/50"
              />
            </form>

            <nav className="flex flex-col space-y-1.5">
              {navLinks.map((link) => {
                const isActive =
                  pathname === "/products" &&
                  (link.href === "/products"
                    ? typeof window !== "undefined" && !window.location.search.includes("category=")
                    : typeof window !== "undefined" && window.location.href.includes(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                      isActive
                        ? "bg-blue-600 text-white font-semibold shadow-sm"
                        : "hover:bg-muted text-foreground"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}

              <div className="pt-2 border-t mt-2 space-y-1">
                {session?.user ? (
                  <>
                    {session.user.role === "ADMIN" && (
                      <Link
                        href="/admin"
                        onClick={() => setMobileMenuOpen(false)}
                        className="px-3 py-2 rounded-md text-sm font-semibold text-primary hover:bg-muted transition flex items-center gap-2"
                      >
                        <LayoutDashboard className="w-4 h-4" /> Admin Dashboard
                      </Link>
                    )}
                    <Link
                      href="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3 py-2 rounded-md text-sm font-medium hover:bg-muted transition flex items-center gap-2"
                    >
                      <User className="w-4 h-4" /> My Profile
                    </Link>
                    <Link
                      href="/orders"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3 py-2 rounded-md text-sm font-medium hover:bg-muted transition flex items-center gap-2"
                    >
                      <Package className="w-4 h-4" /> My Orders
                    </Link>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        signOut({ callbackUrl: "/" });
                      }}
                      className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-destructive hover:bg-muted transition flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </>
                ) : (
                  <Link
                    href="/auth/signin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-md text-sm font-semibold text-primary hover:bg-muted transition flex items-center gap-2"
                  >
                    <LogIn className="w-4 h-4" /> Sign In to Account
                  </Link>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Slide-over Cart Drawer */}
      <CartDrawer open={cartDrawerOpen} onOpenChange={setCartDrawerOpen} />
    </>
  );
}

