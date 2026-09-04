import React from "react";
import { AdminProductsClient } from "@/components/admin/AdminProductsClient";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: {
      category: { select: { name: true, slug: true } },
      images: { orderBy: { isPrimary: "desc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  const serializableProducts = products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: Number(p.price),
    discountPrice: p.discountPrice ? Number(p.discountPrice) : null,
    stock: p.stock,
    sku: p.sku,
    isFeatured: p.isFeatured,
    isActive: p.isActive,
    ratingAvg: Number(p.ratingAvg),
    category: p.category,
    images: p.images.map((img) => ({ url: img.url, isPrimary: img.isPrimary })),
  }));

  return <AdminProductsClient initialProducts={serializableProducts} />;
}

