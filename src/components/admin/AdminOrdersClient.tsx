"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ShoppingBag,
  Eye,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  CreditCard,
  Mail,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface OrderItem {
  id: string;
  productName: string;
  productImage?: string | null;
  price: number;
  quantity: number;
  subtotal: number;
}

interface Order {
  id: string;
  orderNumber: string;
  totalAmount: number;
  discountAmount: number;
  shippingAmount: number;
  finalAmount: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
  user: { name?: string | null; email: string };
  shippingAddress: {
    fullName: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
  };
  items: OrderItem[];
}

interface AdminOrdersClientProps {
  initialOrders: Order[];
}

export function AdminOrdersClient({ initialOrders }: AdminOrdersClientProps) {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("ALL");
  const [inspectedOrder, setInspectedOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filteredOrders = orders.filter((o) => {
    if (selectedStatusFilter === "ALL") return true;
    return o.status === selectedStatusFilter;
  });

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    // Save previous status for rollback if needed
    const previousOrder = orders.find((o) => o.id === orderId);
    const previousStatus = previousOrder?.status;

    // Optimistic UI update: instantly update UI
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    if (inspectedOrder && inspectedOrder.id === orderId) {
      setInspectedOrder({ ...inspectedOrder, status: newStatus });
    }

    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Rollback to previous status
        if (previousStatus) {
          setOrders((prev) =>
            prev.map((o) => (o.id === orderId ? { ...o, status: previousStatus } : o))
          );
          if (inspectedOrder && inspectedOrder.id === orderId) {
            setInspectedOrder({ ...inspectedOrder, status: previousStatus });
          }
        }
        toast.error(data.error || "Failed to update order status.");
      } else {
        toast.success(`Order status updated to ${newStatus}`);
        router.refresh();
      }
    } catch (err) {
      // Rollback to previous status
      if (previousStatus) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: previousStatus } : o))
        );
        if (inspectedOrder && inspectedOrder.id === orderId) {
          setInspectedOrder({ ...inspectedOrder, status: previousStatus });
        }
      }
      toast.error("Error updating order status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const statusOptions = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Order Fulfillment</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage customer orders, advance fulfillment status, and trigger automated Resend tracking emails.
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 bg-muted p-1 rounded-lg text-xs font-semibold overflow-x-auto">
          {["ALL", "PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-md transition whitespace-nowrap ${
                selectedStatusFilter === tab
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <Card className="shadow-sm">
        <CardContent className="p-0">
          <div className="rounded-xl overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/50 border-b uppercase text-[11px] text-muted-foreground font-semibold">
                <tr>
                  <th className="p-3.5">Order ID</th>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Total Amount</th>
                  <th className="p-3.5">Payment</th>
                  <th className="p-3.5">Fulfillment Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      No orders found matching the filter.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-muted/20 transition">
                      <td className="p-3.5 font-mono font-bold text-foreground">
                        #{ord.orderNumber}
                      </td>

                      <td className="p-3.5">
                        <div className="font-bold text-foreground">{ord.shippingAddress.fullName}</div>
                        <div className="text-[11px] text-muted-foreground">{ord.user.email}</div>
                      </td>

                      <td className="p-3.5 text-muted-foreground">
                        {new Date(ord.createdAt).toLocaleDateString()}
                      </td>

                      <td className="p-3.5 font-bold text-foreground">
                        {formatPrice(ord.finalAmount)}
                      </td>

                      <td className="p-3.5">
                        <Badge
                          variant={ord.paymentStatus === "COMPLETED" ? "success" : "warning"}
                          className="text-[10px] font-bold"
                        >
                          {ord.paymentStatus} ({ord.paymentMethod})
                        </Badge>
                      </td>

                      <td className="p-3.5">
                        <Select
                          value={ord.status}
                          onValueChange={(val) => handleStatusChange(ord.id, val)}
                          disabled={updatingId === ord.id}
                        >
                          <SelectTrigger className="h-8 w-36 text-xs font-semibold">
                            {updatingId === ord.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                            ) : null}
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.map((st) => (
                              <SelectItem key={st} value={st} className="text-xs">
                                {st}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>

                      <td className="p-3.5 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setInspectedOrder(ord)}
                          className="h-8 gap-1 text-xs"
                        >
                          <Eye className="w-3.5 h-3.5" /> Inspect
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Order Inspection Modal */}
      {inspectedOrder && (
        <Dialog open={!!inspectedOrder} onOpenChange={() => setInspectedOrder(null)}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader className="border-b pb-3">
              <DialogTitle className="flex items-center gap-2 text-lg">
                <ShoppingBag className="w-5 h-5 text-primary" /> Order Inspection: #{inspectedOrder.orderNumber}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 pt-2 text-xs">
              {/* Customer & Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl border bg-muted/20 space-y-1">
                  <h4 className="font-bold flex items-center gap-1.5 text-foreground uppercase tracking-wider">
                    <Mail className="w-3.5 h-3.5 text-primary" /> Customer Contact
                  </h4>
                  <p className="font-semibold text-foreground pt-1">{inspectedOrder.shippingAddress.fullName}</p>
                  <p className="text-muted-foreground">{inspectedOrder.user.email}</p>
                  <p className="font-mono text-muted-foreground">📞 {inspectedOrder.shippingAddress.phone}</p>
                </div>

                <div className="p-3.5 rounded-xl border bg-muted/20 space-y-1">
                  <h4 className="font-bold flex items-center gap-1.5 text-foreground uppercase tracking-wider">
                    <MapPin className="w-3.5 h-3.5 text-primary" /> Shipping Address
                  </h4>
                  <p className="text-muted-foreground pt-1">{inspectedOrder.shippingAddress.street}</p>
                  <p className="text-muted-foreground">
                    {inspectedOrder.shippingAddress.city}, {inspectedOrder.shippingAddress.state} - {inspectedOrder.shippingAddress.postalCode}
                  </p>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-3">
                <h4 className="font-bold text-sm">Ordered Items ({inspectedOrder.items.length})</h4>
                <div className="divide-y border rounded-xl overflow-hidden bg-card">
                  {inspectedOrder.items.map((item) => (
                    <div key={item.id} className="p-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {item.productImage && (
                          <div className="relative w-10 h-10 rounded overflow-hidden bg-muted border shrink-0">
                            <Image src={item.productImage} alt={item.productName} fill className="object-cover" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-foreground line-clamp-1">{item.productName}</p>
                          <p className="text-muted-foreground">{formatPrice(item.price)} &times; {item.quantity} qty</p>
                        </div>
                      </div>
                      <span className="font-bold">{formatPrice(item.subtotal)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing breakdown */}
              <div className="p-4 rounded-xl border bg-muted/30 space-y-1.5 max-w-xs ml-auto">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span>{formatPrice(inspectedOrder.totalAmount)}</span>
                </div>
                {inspectedOrder.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount:</span>
                    <span>-{formatPrice(inspectedOrder.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping:</span>
                  <span>{inspectedOrder.shippingAmount === 0 ? "FREE" : formatPrice(inspectedOrder.shippingAmount)}</span>
                </div>
                <div className="flex justify-between font-bold text-sm pt-2 border-t text-primary">
                  <span>Grand Total:</span>
                  <span>{formatPrice(inspectedOrder.finalAmount)}</span>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

