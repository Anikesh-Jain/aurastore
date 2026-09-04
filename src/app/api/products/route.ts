import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "newest";
    const minPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined;
    const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined;
    const featured = searchParams.get("featured") === "true";
    const inStock = searchParams.get("inStock") === "true";

    const where: any = {
      isActive: true,
    };

    if (category) {
      where.category = {
        slug: category,
      };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    if (featured) {
      where.isFeatured = true;
    }

    if (inStock) {
      where.stock = { gt: 0 };
    }

    let orderBy: any = { createdAt: "desc" };
    if (sort === "price-low") orderBy = { price: "asc" };
    if (sort === "price-high") orderBy = { price: "desc" };
    if (sort === "rating") orderBy = { ratingAvg: "desc" };

    const products = await prisma.product.findMany({
      where,
      include: {
        category: {
          select: { name: true, slug: true },
        },
        images: {
          orderBy: { isPrimary: "desc" },
        },
      },
      orderBy,
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Products GET error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

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
      images,
    } = body;

    if (!name || !slug || !price || !categoryId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newProduct = await prisma.product.create({
      data: {
        name,
        slug: slug.toLowerCase().trim().replace(/\s+/g, "-"),
        description: description || "",
        price: Number(price),
        discountPrice: discountPrice ? Number(discountPrice) : null,
        stock: Number(stock) || 0,
        sku: sku || `SKU-${Date.now()}`,
        categoryId,
        isFeatured: Boolean(isFeatured),
        images: {
          create: (images || []).map((img: { url: string; publicId?: string; isPrimary?: boolean }, idx: number) => ({
            url: img.url,
            publicId: img.publicId || `prod_img_${Date.now()}_${idx}`,
            isPrimary: img.isPrimary ?? idx === 0,
          })),
        },
      },
      include: {
        images: true,
        category: true,
      },
    });

    return NextResponse.json({ product: newProduct }, { status: 201 });
  } catch (error: any) {
    console.error("Product POST error:", error);
    return NextResponse.json({ error: error.message || "Failed to create product" }, { status: 500 });
  }
}
