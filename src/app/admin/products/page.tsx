import React from "react";
import { AdminProductsClient } from "@/components/admin/AdminProductsClient";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      discountPrice: true,
      stock: true,
      sku: true,
      isFeatured: true,
      isActive: true,
      ratingAvg: true,
      category: { select: { name: true, slug: true } },
      images: {
        orderBy: { isPrimary: "desc" },
        take: 1,
        select: { url: true, isPrimary: true },
      },
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

