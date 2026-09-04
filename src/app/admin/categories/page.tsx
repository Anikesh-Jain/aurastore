import React from "react";
import { AdminCategoriesClient } from "@/components/admin/AdminCategoriesClient";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { products: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return <AdminCategoriesClient initialCategories={categories} />;
}

