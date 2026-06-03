import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Eye } from "lucide-react";
import { toast } from "sonner";

interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  city: string;
  status: string;
  total: number;
  shipping_cost: number;
  payment_method: string;
  notes: string | null;
  created_at: string;
}

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  size: string | null;
  price: number;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-600",
  confirmed: "bg-blue-500/20 text-blue-600",
  shipped: "bg-purple-500/20 text-purple-600",
  delivered: "bg-green-500/20 text-green-600",
  cancelled: "bg-red-500/20 text-red-600",
};

const AdminOrders = () => {
  const { lang } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [itemsLoading, setItemsLoading] = useState(false);

  const fetchOrders = async () => {
    const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    setOrders((data as Order[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, []);

  const openDetails = async (order: Order) => {
    setSelected(order);
    setItemsLoading(true);
    const { data } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", order.id);
    setItems((data as OrderItem[]) || []);
    setItemsLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success(lang === "ar" ? "تم تحديث الحالة" : "Status updated"); fetchOrders(); }
  };

  const statuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
  const statusLabel = (s: string) => {
    const map: Record<string, { ar: string; en: string }> = {
      pending: { ar: "معلق", en: "Pending" },
      confirmed: { ar: "مؤكد", en: "Confirmed" },
      shipped: { ar: "تم الشحن", en: "Shipped" },
      delivered: { ar: "تم التسليم", en: "Delivered" },
      cancelled: { ar: "ملغي", en: "Cancelled" },
    };
    return map[s]?.[lang] || s;
  };

  if (loading) return <div className="flex justify-center p-8"><div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-display font-bold mb-6">{lang === "ar" ? "إدارة الطلبات" : "Manage Orders"}</h1>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{lang === "ar" ? "العميل" : "Customer"}</TableHead>
              <TableHead>{lang === "ar" ? "الهاتف" : "Phone"}</TableHead>
              <TableHead>{lang === "ar" ? "المدينة" : "City"}</TableHead>
              <TableHead>{lang === "ar" ? "المجموع" : "Total"}</TableHead>
              <TableHead>{lang === "ar" ? "الحالة" : "Status"}</TableHead>
              <TableHead>{lang === "ar" ? "التاريخ" : "Date"}</TableHead>
              <TableHead>{lang === "ar" ? "التفاصيل" : "Details"}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((o) => (
              <TableRow key={o.id}>
                <TableCell className="font-medium">{o.customer_name}</TableCell>
                <TableCell>{o.customer_phone}</TableCell>
                <TableCell>{o.city}</TableCell>
                <TableCell>{o.total.toLocaleString()} SYP</TableCell>
                <TableCell>
                  <Select value={o.status} onValueChange={(v) => updateStatus(o.id, v)}>
                    <SelectTrigger className="w-32">
                      <Badge className={statusColors[o.status] || ""}>{statusLabel(o.status)}</Badge>
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map((s) => <SelectItem key={s} value={s}>{statusLabel(s)}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">{new Date(o.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Button size="sm" variant="outline" onClick={() => openDetails(o)}>
                    <Eye className="h-4 w-4 mr-1" />
                    {lang === "ar" ? "عرض" : "View"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {orders.length === 0 && <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">{lang === "ar" ? "لا توجد طلبات" : "No orders"}</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{lang === "ar" ? "تفاصيل الطلب" : "Order Details"}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">{lang === "ar" ? "رقم الطلب:" : "Order ID:"}</span> <span className="font-mono">{selected.id.slice(0, 8)}</span></div>
                <div><span className="text-muted-foreground">{lang === "ar" ? "التاريخ:" : "Date:"}</span> {new Date(selected.created_at).toLocaleString()}</div>
                <div><span className="text-muted-foreground">{lang === "ar" ? "العميل:" : "Customer:"}</span> {selected.customer_name}</div>
                <div><span className="text-muted-foreground">{lang === "ar" ? "الهاتف:" : "Phone:"}</span> {selected.customer_phone}</div>
                <div><span className="text-muted-foreground">{lang === "ar" ? "المدينة:" : "City:"}</span> {selected.city}</div>
                <div><span className="text-muted-foreground">{lang === "ar" ? "الدفع:" : "Payment:"}</span> {selected.payment_method}</div>
                <div className="col-span-2"><span className="text-muted-foreground">{lang === "ar" ? "العنوان:" : "Address:"}</span> {selected.customer_address}</div>
                {selected.notes && <div className="col-span-2"><span className="text-muted-foreground">{lang === "ar" ? "ملاحظات:" : "Notes:"}</span> {selected.notes}</div>}
              </div>

              <div>
                <h3 className="font-semibold mb-2">{lang === "ar" ? "المنتجات" : "Items"}</h3>
                {itemsLoading ? (
                  <div className="text-sm text-muted-foreground">{lang === "ar" ? "جاري التحميل..." : "Loading..."}</div>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{lang === "ar" ? "المنتج" : "Product"}</TableHead>
                          <TableHead>{lang === "ar" ? "الحجم" : "Size"}</TableHead>
                          <TableHead>{lang === "ar" ? "الكمية" : "Qty"}</TableHead>
                          <TableHead>{lang === "ar" ? "السعر" : "Price"}</TableHead>
                          <TableHead>{lang === "ar" ? "الإجمالي" : "Subtotal"}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {items.map((it) => (
                          <TableRow key={it.id}>
                            <TableCell className="font-medium">{it.product_name}</TableCell>
                            <TableCell>{it.size || "-"}</TableCell>
                            <TableCell>{it.quantity}</TableCell>
                            <TableCell>{Number(it.price).toLocaleString()} SYP</TableCell>
                            <TableCell>{(Number(it.price) * it.quantity).toLocaleString()} SYP</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>

              <div className="border-t pt-4 space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">{lang === "ar" ? "الشحن:" : "Shipping:"}</span> <span>{Number(selected.shipping_cost).toLocaleString()} SYP</span></div>
                <div className="flex justify-between font-bold text-base"><span>{lang === "ar" ? "المجموع:" : "Total:"}</span> <span>{Number(selected.total).toLocaleString()} SYP</span></div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrders;
