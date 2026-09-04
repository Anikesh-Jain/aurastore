"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ModeToggle } from "@/components/layout/ModeToggle";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  Ticket,
  Users,
  Store,
  Menu,
  X,
  ShieldCheck,
} from "lucide-react";

interface AdminHeaderProps {
  userEmail: string;
}

export function AdminHeader({ userEmail }: AdminHeaderProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const navItems = [
    { label: "Dashboard Overview", href: "/admin", icon: LayoutDashboard },
    { label: "Products & Catalog", href: "/admin/products", icon: Package },
    { label: "Categories", href: "/admin/categories", icon: FolderTree },
    { label: "Orders & Fulfillment", href: "/admin/orders", icon: ShoppingBag },
    { label: "Coupons & Discounts", href: "/admin/coupons", icon: Ticket },
    { label: "Customer Directory", href: "/admin/customers", icon: Users },
  ];

  return (
    <header className="border-b bg-background/95 backdrop-blur px-4 sm:px-6 sticky top-0 z-30">
      <div className="h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Mobile menu trigger */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            aria-label="Toggle Navigation Menu"
          >
            {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>

          <div className="flex items-center gap-2 md:hidden">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm">Admin</span>
          </div>

          <span className="text-xs font-semibold text-muted-foreground hidden sm:inline">
            Logged in as: <strong className="text-foreground">{userEmail}</strong>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <ModeToggle />
          <Link
            href="/"
            className="text-xs font-semibold bg-primary text-primary-foreground px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm hover:bg-primary/90 transition"
          >
            <Store className="w-3.5 h-3.5" /> View Store
          </Link>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileNavOpen && (
        <div className="md:hidden border-t py-3 space-y-1 bg-background/95">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileNavOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold text-muted-foreground hover:bg-primary/10 hover:text-primary transition"
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
