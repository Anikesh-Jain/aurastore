import React from "react";
import { ProductForm } from "@/components/admin/ProductForm";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return <ProductForm categories={categories} isEditing={false} />;
}

