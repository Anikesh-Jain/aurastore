import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Please sign in to write a review." }, { status: 401 });
    }

    const body = await req.json();
    const { productId, rating, title, comment, images } = body;

    if (!productId || !rating || !comment) {
      return NextResponse.json({ error: "Product ID, rating (1-5), and comment are required." }, { status: 400 });
    }

    const ratingNum = Math.min(5, Math.max(1, Number(rating)));

    // Upsert review (one review per user per product)
    const review = await prisma.review.upsert({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId,
        },
      },
      update: {
        rating: ratingNum,
        title: title || null,
        comment,
        images: {
          deleteMany: {},
          create: (images || []).map((img: { url: string; publicId: string }) => ({
            url: img.url,
            publicId: img.publicId,
          })),
        },
      },
      create: {
        userId: session.user.id,
        productId,
        rating: ratingNum,
        title: title || null,
        comment,
        images: {
          create: (images || []).map((img: { url: string; publicId: string }) => ({
            url: img.url,
            publicId: img.publicId,
          })),
        },
      },
      include: {
        images: true,
        user: { select: { name: true, image: true } },
      },
    });

    // Recalculate average rating for product
    const allReviews = await prisma.review.findMany({
      where: { productId },
      select: { rating: true },
    });

    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = totalRating / allReviews.length;

    await prisma.product.update({
      where: { id: productId },
      data: {
        ratingAvg: Number(avgRating.toFixed(2)),
        ratingCount: allReviews.length,
      },
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (error: any) {
    console.error("Review creation error:", error);
    return NextResponse.json({ error: error.message || "Failed to submit review." }, { status: 500 });
  }
}

