import React from "react";
import { AdminCustomersClient } from "@/components/admin/AdminCustomersClient";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      orders: {
        select: { finalAmount: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const serializableCustomers = users.map((u) => {
    const totalSpent = u.orders.reduce((sum, o) => sum + Number(o.finalAmount), 0);
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt.toISOString(),
      orderCount: u.orders.length,
      totalSpent,
    };
  });

  return <AdminCustomersClient initialCustomers={serializableCustomers} />;
}

