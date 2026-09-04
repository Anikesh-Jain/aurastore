import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendOrderStatusUpdateEmail } from "@/lib/resend";
import { OrderStatus } from "@prisma/client";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { status } = await req.json();

    if (!status || !Object.values(OrderStatus).includes(status)) {
      return NextResponse.json({ error: "Invalid order status value" }, { status: 400 });
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status: status as OrderStatus },
      include: {
        user: true,
      },
    });

    // Send transactional status update notification email via Resend
    if (order.user?.email) {
      try {
        await sendOrderStatusUpdateEmail(
          order.user.email,
          order.user.name || "Valued Customer",
          order.orderNumber,
          order.status
        );
      } catch (err) {
        console.warn("Could not dispatch status email:", err);
      }
    }

    return NextResponse.json({ order });
  } catch (error: any) {
    console.error("Order status update error:", error);
    return NextResponse.json({ error: error.message || "Failed to update order status" }, { status: 500 });
  }
}

