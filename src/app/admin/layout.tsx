import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  Store,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";
import { ModeToggle } from "@/components/layout/ModeToggle";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminSidebarNav } from "@/components/admin/AdminSidebarNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/auth/signin?callbackUrl=/admin");
  }

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
          <AdminSidebarNav />
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

