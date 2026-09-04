import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: true,
        category: true,
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to load product" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const {
      name,
      slug,
      description,
      price,
      discountPrice,
      stock,
      sku,
      categoryId,
      isFeatured,
      isActive,
      images,
    } = body;

    const updated = await prisma.product.update({
      where: { id },
      data: {
        name,
        slug: slug.toLowerCase().trim().replace(/\s+/g, "-"),
        description,
        price: Number(price),
        discountPrice: discountPrice ? Number(discountPrice) : null,
        stock: Number(stock),
        sku,
        categoryId,
        isFeatured: Boolean(isFeatured),
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        ...(images
          ? {
              images: {
                deleteMany: {},
                create: images.map((img: { url: string; publicId?: string; isPrimary?: boolean }, idx: number) => ({
                  url: img.url,
                  publicId: img.publicId || `prod_${Date.now()}_${idx}`,
                  isPrimary: img.isPrimary ?? idx === 0,
                })),
              },
            }
          : {}),
      },
      include: {
        images: true,
        category: true,
      },
    });

    return NextResponse.json({ product: updated });
  } catch (error: any) {
    console.error("Product update error:", error);
    return NextResponse.json({ error: error.message || "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Delete product (cascades images and cart items)
    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Product delete error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete product" }, { status: 500 });
  }
}

