import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { fullName, phone, street, city, state, postalCode, country = "India", isDefault } = body;

    if (!fullName || !phone || !street || !city || !postalCode) {
      return NextResponse.json({ error: "Missing required address fields." }, { status: 400 });
    }

    if (isDefault) {
      // Unset previous defaults
      await prisma.address.updateMany({
        where: { userId: session.user.id },
        data: { isDefault: false },
      });
    }

    const newAddress = await prisma.address.create({
      data: {
        userId: session.user.id,
        fullName,
        phone,
        street,
        city,
        state,
        postalCode,
        country,
        isDefault: Boolean(isDefault),
      },
    });

    return NextResponse.json({ address: newAddress }, { status: 201 });
  } catch (error: any) {
    console.error("Address create error:", error);
    return NextResponse.json({ error: error.message || "Failed to save address." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Address ID required" }, { status: 400 });
    }

    await prisma.address.deleteMany({
      where: { id, userId: session.user.id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Address delete error:", error);
    return NextResponse.json({ error: "Failed to delete address" }, { status: 500 });
  }
}

