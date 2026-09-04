import React, { Suspense } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProductCatalogClient } from "@/components/product/ProductCatalogClient";
import { prisma } from "@/lib/prisma";
import { Loader2 } from "lucide-react";

export const revalidate = 30; // ISR 30s

export default async function ProductsPage() {
  let products: any[] = [];
  let categories: any[] = [];

  try {
    products = await prisma.product.findMany({
      where: { isActive: true },
      include: {
        category: { select: { name: true, slug: true } },
        images: { orderBy: { isPrimary: "desc" } },
      },
      orderBy: { createdAt: "desc" },
    });

    categories = await prisma.category.findMany({
      include: {
        _count: { select: { products: true } },
      },
      orderBy: { name: "asc" },
    });
  } catch (err) {
    console.error("Failed to load products from database:", err);
  }

  const serializableProducts = products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: Number(p.price),
    discountPrice: p.discountPrice ? Number(p.discountPrice) : null,
    stock: p.stock,
    isFeatured: p.isFeatured,
    ratingAvg: Number(p.ratingAvg),
    ratingCount: p.ratingCount,
    category: p.category,
    images: p.images.map((img: any) => ({ url: img.url, isPrimary: img.isPrimary })),
  }));

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <Suspense
          fallback={
            <div className="min-h-[50vh] flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          }
        >
          <ProductCatalogClient
            initialProducts={serializableProducts}
            categories={categories}
          />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
