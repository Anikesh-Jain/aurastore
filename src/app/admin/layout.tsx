import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  Ticket,
  Users,
  Store,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";
import { ModeToggle } from "@/components/layout/ModeToggle";
import { AdminHeader } from "@/components/admin/AdminHeader";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/auth/signin?callbackUrl=/admin");
  }

  const navItems = [
    { label: "Dashboard Overview", href: "/admin", icon: LayoutDashboard },
    { label: "Products & Catalog", href: "/admin/products", icon: Package },
    { label: "Categories", href: "/admin/categories", icon: FolderTree },
    { label: "Orders & Fulfillment", href: "/admin/orders", icon: ShoppingBag },
    { label: "Coupons & Discounts", href: "/admin/coupons", icon: Ticket },
    { label: "Customer Directory", href: "/admin/customers", icon: Users },
  ];

  return (
    <div className="min-h-screen flex bg-muted/20">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card hidden md:flex flex-col justify-between shrink-0 shadow-sm">
        <div>
          {/* Brand header */}
          <div className="p-6 border-b flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-2 font-bold text-lg tracking-tight">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="leading-tight">AuraStore</span>
                <span className="text-[10px] text-primary font-bold uppercase tracking-widest">Admin Portal</span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold text-muted-foreground hover:bg-primary/10 hover:text-primary transition"
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2 rounded-lg text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground transition"
          >
            <span className="flex items-center gap-2">
              <Store className="w-3.5 h-3.5 text-primary" /> Live Storefront
            </span>
            <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground" />
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar with Responsive Mobile Drawer */}
        <AdminHeader userEmail={session.user.email || "admin@ecommerce.com"} />

        {/* Dynamic Page Content */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

