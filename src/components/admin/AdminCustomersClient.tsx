"use client";

import React, { useState } from "react";
import { formatPrice } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, Search, Mail, Calendar, ShoppingBag } from "lucide-react";

interface Customer {
  id: string;
  name?: string | null;
  email: string;
  role: string;
  createdAt: string;
  orderCount: number;
  totalSpent: number;
}

interface AdminCustomersClientProps {
  initialCustomers: Customer[];
}

export function AdminCustomersClient({ initialCustomers }: AdminCustomersClientProps) {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [search, setSearch] = useState("");

  const filtered = customers.filter(
    (c) =>
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Customer Directory</h1>
        <p className="text-sm text-muted-foreground mt-1">
          View registered customer accounts, order counts, and lifetime customer spend.
        </p>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
              <Input
                placeholder="Search customers by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>
            <span className="text-xs text-muted-foreground">
              Total {customers.length} registered accounts
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="rounded-xl overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/50 border-b uppercase text-[11px] text-muted-foreground font-semibold">
                <tr>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5">Joined Date</th>
                  <th className="p-3.5">Orders Placed</th>
                  <th className="p-3.5">Lifetime Spend</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-muted/20 transition">
                    <td className="p-3.5 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                        {c.name?.[0] || "U"}
                      </div>
                      <div>
                        <div className="font-bold text-foreground text-sm">{c.name || "Customer"}</div>
                        <div className="text-muted-foreground text-[11px] flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {c.email}
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5">
                      <Badge variant={c.role === "ADMIN" ? "default" : "secondary"} className="text-[10px] font-bold">
                        {c.role}
                      </Badge>
                    </td>

                    <td className="p-3.5 text-muted-foreground">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>

                    <td className="p-3.5">
                      <span className="font-semibold">{c.orderCount} orders</span>
                    </td>

                    <td className="p-3.5 font-bold text-foreground">
                      {formatPrice(c.totalSpent)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

