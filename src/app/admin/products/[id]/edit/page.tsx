import React from "react";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface EditProductProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductProps) {
  const { id } = await params;

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { images: true },
    }),
    prisma.category.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!product) {
    notFound();
  }

  const initialData = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: Number(product.price),
    discountPrice: product.discountPrice ? Number(product.discountPrice) : null,
    stock: product.stock,
    sku: product.sku,
    categoryId: product.categoryId,
    isFeatured: product.isFeatured,
    isActive: product.isActive,
    images: product.images.map((img) => ({
      url: img.url,
      publicId: img.publicId,
      isPrimary: img.isPrimary,
    })),
  };

  return <ProductForm initialData={initialData} categories={categories} isEditing={true} />;
}

