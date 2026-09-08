"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  Ticket,
  Users,
} from "lucide-react";

export const adminNavItems = [
  { label: "Dashboard Overview", href: "/admin", icon: LayoutDashboard, exact: true },
  { label: "Products & Catalog", href: "/admin/products", icon: Package },
  { label: "Categories", href: "/admin/categories", icon: FolderTree },
  { label: "Orders & Fulfillment", href: "/admin/orders", icon: ShoppingBag },
  { label: "Coupons & Discounts", href: "/admin/coupons", icon: Ticket },
  { label: "Customer Directory", href: "/admin/customers", icon: Users },
];

interface AdminSidebarNavProps {
  onItemClick?: () => void;
}

export function AdminSidebarNav({ onItemClick }: AdminSidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav className="p-4 space-y-1.5" aria-label="Admin Navigation">
      {adminNavItems.map((item) => {
        const Icon = item.icon;
        const isActive = item.exact
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onItemClick}
            prefetch={true}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
              isActive
                ? "bg-primary text-primary-foreground shadow-sm font-bold"
                : "text-muted-foreground hover:bg-muted/80 hover:text-foreground active:scale-[0.98]"
            }`}
          >
            <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-primary-foreground" : "text-muted-foreground"}`} />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
