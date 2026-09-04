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

export function Navbar() {
  const router = useRouter();
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
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
        {/* Top Promotional Bar */}
        <div className="bg-primary text-primary-foreground text-xs py-1.5 px-4 text-center font-medium tracking-wide flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Use code <strong>WELCOME20</strong> for 20% off on orders over ₹2,000! &bull; Free Shipping over ₹1,999</span>
        </div>

        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight shrink-0">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <span className="hidden sm:inline-block bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              AuraStore
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-sm relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products, brands, gear..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 w-full bg-muted/50 focus:bg-background transition"
            />
          </form>

          {/* Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <ModeToggle />

            {/* Wishlist Link */}
            <Link href="/wishlist">
              <Button variant="ghost" size="icon" className="relative" aria-label="Wishlist">
                <Heart className="w-5 h-5" />
                {mounted && wishlistItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {wishlistItems.length}
                  </span>
                )}
              </Button>
            </Link>

            {/* Cart Trigger */}
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => setCartDrawerOpen(true)}
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {mounted && cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
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

            <nav className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-muted transition"
                >
                  {link.name}
                </Link>
              ))}

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

