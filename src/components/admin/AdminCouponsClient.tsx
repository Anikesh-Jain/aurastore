"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Ticket, Plus, Trash2, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface Coupon {
  id: string;
  code: string;
  discountPercent?: number | null;
  discountAmount?: number | null;
  minOrderValue: number;
  maxDiscount?: number | null;
  usageLimit?: number | null;
  usedCount: number;
  expiresAt?: string | null;
  isActive: boolean;
}

interface AdminCouponsClientProps {
  initialCoupons: Coupon[];
}

export function AdminCouponsClient({ initialCoupons }: AdminCouponsClientProps) {
  const router = useRouter();
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [code, setCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState("");
  const [discountAmount, setDiscountAmount] = useState("");
  const [minOrderValue, setMinOrderValue] = useState("0");
  const [maxDiscount, setMaxDiscount] = useState("");
  const [usageLimit, setUsageLimit] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) {
      toast.error("Coupon code is required.");
      return;
    }

    if (!discountPercent && !discountAmount) {
      toast.error("Please specify either percentage discount or fixed amount.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.toUpperCase().trim(),
          discountPercent: discountPercent ? Number(discountPercent) : null,
          discountAmount: discountAmount ? Number(discountAmount) : null,
          minOrderValue: Number(minOrderValue) || 0,
          maxDiscount: maxDiscount ? Number(maxDiscount) : null,
          usageLimit: usageLimit ? Number(usageLimit) : null,
          expiresAt: expiresAt || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to create coupon.");
      } else {
        toast.success(`Coupon "${data.coupon.code}" created!`);
        setCoupons((prev) => [data.coupon, ...prev]);
        setShowForm(false);
        setCode("");
        setDiscountPercent("");
        setDiscountAmount("");
        setMinOrderValue("0");
        setMaxDiscount("");
        setUsageLimit("");
        setExpiresAt("");
        router.refresh();
      }
    } catch (err) {
      toast.error("Error creating coupon.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCoupon = async (id: string, couponCode: string) => {
    if (!confirm(`Delete coupon "${couponCode}"?`)) return;

    try {
      const res = await fetch(`/api/admin/coupons?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setCoupons((prev) => prev.filter((c) => c.id !== id));
        toast.success(`Coupon ${couponCode} deleted.`);
        router.refresh();
      } else {
        toast.error("Failed to delete coupon.");
      }
    } catch (err) {
      toast.error("Error deleting coupon.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Promo & Discount Codes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create percentage discounts, fixed reductions, and flash sales codes.
          </p>
        </div>

        <Button onClick={() => setShowForm(!showForm)} className="gap-1.5 shadow-sm">
          {showForm ? "Close Form" : <><Plus className="w-4 h-4" /> Create New Coupon</>}
        </Button>
      </div>

      {showForm && (
        <Card className="shadow-md border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg">Create Promo Coupon</CardTitle>
            <CardDescription>Specify discount rates and minimum cart value requirements.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateCoupon} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="coupCode">Coupon Code *</Label>
                  <Input
                    id="coupCode"
                    placeholder="e.g. FESTIVE25"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                    className="font-mono uppercase"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="discPct">Discount Percentage (%)</Label>
                  <Input
                    id="discPct"
                    type="number"
                    placeholder="20 (for 20% off)"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="discAmt">Fixed Discount (₹)</Label>
                  <Input
                    id="discAmt"
                    type="number"
                    placeholder="500 (for ₹500 off)"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="minVal">Min Order Cart Value (₹)</Label>
                  <Input
                    id="minVal"
                    type="number"
                    placeholder="1000"
                    value={minOrderValue}
                    onChange={(e) => setMinOrderValue(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="maxDisc">Max Discount Cap (₹)</Label>
                  <Input
                    id="maxDisc"
                    type="number"
                    placeholder="2000"
                    value={maxDiscount}
                    onChange={(e) => setMaxDiscount(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="limit">Total Usage Limit</Label>
                  <Input
                    id="limit"
                    type="number"
                    placeholder="100"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5 max-w-xs">
                <Label htmlFor="expiry">Expiration Date</Label>
                <Input
                  id="expiry"
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                />
              </div>

              <Button type="submit" disabled={submitting} className="mt-2">
                {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Save Promo Code"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Coupons Table */}
      <Card className="shadow-sm">
        <CardContent className="p-0">
          <div className="rounded-xl overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/50 border-b uppercase text-[11px] text-muted-foreground font-semibold">
                <tr>
                  <th className="p-3.5">Promo Code</th>
                  <th className="p-3.5">Discount Rate</th>
                  <th className="p-3.5">Min Order Value</th>
                  <th className="p-3.5">Usage</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-muted/20 transition">
                    <td className="p-3.5 font-mono font-bold text-sm text-primary">
                      {c.code}
                    </td>

                    <td className="p-3.5 font-bold text-foreground">
                      {c.discountPercent ? `${c.discountPercent}% OFF` : formatPrice(Number(c.discountAmount))}
                      {c.maxDiscount && (
                        <span className="text-[10px] text-muted-foreground block font-normal">
                          Max: {formatPrice(Number(c.maxDiscount))}
                        </span>
                      )}
                    </td>

                    <td className="p-3.5 text-muted-foreground">
                      {formatPrice(Number(c.minOrderValue))}
                    </td>

                    <td className="p-3.5">
                      <span className="font-semibold">{c.usedCount}</span>
                      {c.usageLimit && <span className="text-muted-foreground"> / {c.usageLimit}</span>}
                    </td>

                    <td className="p-3.5">
                      <Badge variant={c.isActive ? "success" : "secondary"} className="text-[10px] font-bold">
                        {c.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>

                    <td className="p-3.5 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteCoupon(c.id, c.code)}
                        className="text-muted-foreground hover:text-destructive h-8 w-8"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
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

