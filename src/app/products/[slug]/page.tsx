import React from "react";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProductDetailsClient } from "@/components/product/ProductDetailsClient";
import { prisma } from "@/lib/prisma";

export const revalidate = 60; // Enable ISR edge caching (60 seconds)

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

const getProduct = React.cache(async (slug: string) => {
  return prisma.product.findUnique({
    where: { slug, isActive: true },
    include: {
      category: { select: { name: true, slug: true } },
      images: { orderBy: { isPrimary: "desc" } },
      reviews: {
        include: {
          user: { select: { name: true, image: true } },
          images: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
});

export async function generateStaticParams() {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: { slug: true },
      take: 20,
    });
    return products.map((p) => ({ slug: p.slug }));
  } catch (error) {
    console.error("Failed to generate static params for products:", error);
    return [];
  }
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) return { title: "Product Not Found | AuraStore" };

  return {
    title: `${product.name} | AuraStore`,
    description: product.description.slice(0, 160),
  };
}

export default async function ProductDetailsPage({ params }: ProductPageProps) {
  const { slug } = await params;

  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  // Fetch related products in the same category
  const related = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
      isActive: true,
    },
    include: {
      images: { where: { isPrimary: true }, take: 1 },
    },
    take: 4,
  });

  const serializableProduct = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: Number(product.price),
    discountPrice: product.discountPrice ? Number(product.discountPrice) : null,
    stock: product.stock,
    sku: product.sku,
    ratingAvg: Number(product.ratingAvg),
    ratingCount: product.ratingCount,
    category: product.category,
    images: product.images.map((img) => ({
      id: img.id,
      url: img.url,
      altText: img.altText,
      isPrimary: img.isPrimary,
    })),
    reviews: product.reviews.map((rev) => ({
      id: rev.id,
      rating: rev.rating,
      title: rev.title,
      comment: rev.comment,
      createdAt: rev.createdAt.toISOString(),
      user: rev.user,
      images: rev.images.map((rImg) => ({
        id: rImg.id,
        url: rImg.url,
      })),
    })),
  };

  const serializableRelated = related.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    price: Number(r.price),
    discountPrice: r.discountPrice ? Number(r.discountPrice) : null,
    stock: r.stock,
    ratingAvg: Number(r.ratingAvg),
    ratingCount: r.ratingCount,
    image: r.images[0]?.url,
  }));

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <ProductDetailsClient
          product={serializableProduct}
          relatedProducts={serializableRelated}
        />
      </main>
      <Footer />
    </div>
  );
}

