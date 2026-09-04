"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  ExternalLink,
  Star,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  discountPrice?: number | null;
  stock: number;
  sku?: string | null;
  isFeatured: boolean;
  isActive: boolean;
  ratingAvg: number;
  category: { name: string; slug: string };
  images: { url: string; isPrimary: boolean }[];
}

interface AdminProductsClientProps {
  initialProducts: Product[];
}

export function AdminProductsClient({ initialProducts }: AdminProductsClientProps) {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [search, setSearch] = useState("");

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${name}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        toast.success(`Deleted "${name}" from catalog.`);
        router.refresh();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to delete product.");
      }
    } catch (err) {
      toast.error("Error deleting product.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Product Catalog</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage inventory items, pricing, images, and category assignments.
          </p>
        </div>

        <Button asChild className="gap-1.5 shadow-sm">
          <Link href="/admin/products/new">
            <Plus className="w-4 h-4" /> Add New Product
          </Link>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
              <Input
                placeholder="Search products by title, SKU or department..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>
            <span className="text-xs text-muted-foreground">
              Showing {filtered.length} of {products.length} products
            </span>
          </div>
        </CardHeader>

        <CardContent>
          <div className="rounded-xl border overflow-x-auto bg-card">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/50 border-b uppercase text-[11px] text-muted-foreground font-semibold">
                <tr>
                  <th className="p-3.5">Product</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Price</th>
                  <th className="p-3.5">Stock</th>
                  <th className="p-3.5">Rating</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      No products found matching your search.
                    </td>
                  </tr>
                ) : (
                  filtered.map((prod) => (
                    <tr key={prod.id} className="hover:bg-muted/20 transition">
                      <td className="p-3.5 flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted shrink-0 border">
                          <Image
                            src={prod.images[0]?.url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80"}
                            alt={prod.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-bold text-foreground text-sm line-clamp-1">{prod.name}</p>
                          <p className="text-[11px] font-mono text-muted-foreground">SKU: {prod.sku || "N/A"}</p>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <Badge variant="outline" className="text-[10px]">
                          {prod.category?.name || "Uncategorized"}
                        </Badge>
                      </td>

                      <td className="p-3.5">
                        <span className="font-bold text-foreground">
                          {formatPrice(prod.discountPrice ?? prod.price)}
                        </span>
                        {prod.discountPrice && (
                          <span className="text-[10px] text-muted-foreground block line-through">
                            {formatPrice(prod.price)}
                          </span>
                        )}
                      </td>

                      <td className="p-3.5">
                        <span
                          className={`font-bold ${
                            prod.stock <= 5
                              ? "text-destructive"
                              : "text-emerald-600 dark:text-emerald-400"
                          }`}
                        >
                          {prod.stock} units
                        </span>
                      </td>

                      <td className="p-3.5">
                        <div className="flex items-center gap-1 font-semibold">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{prod.ratingAvg.toFixed(1)}</span>
                        </div>
                      </td>

                      <td className="p-3.5">
                        {prod.isActive ? (
                          <Badge variant="success" className="text-[10px] font-bold">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px]">
                            Inactive
                          </Badge>
                        )}
                      </td>

                      <td className="p-3.5 text-right space-x-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" asChild>
                          <Link href={`/products/${prod.slug}`} target="_blank" title="View in Storefront">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" asChild>
                          <Link href={`/admin/products/${prod.id}/edit`} title="Edit Product">
                            <Edit className="w-3.5 h-3.5" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteProduct(prod.id, prod.name)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

