import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Eye, Download, Printer, Search } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

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
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

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

  const filtered = orders.filter((o) => {
    if (filter !== "all" && o.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        o.customer_name.toLowerCase().includes(q) ||
        o.customer_phone.toLowerCase().includes(q) ||
        o.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const exportCsv = () => {
    const headers = ["Order ID", "Customer", "Phone", "City", "Address", "Total", "Shipping", "Payment", "Status", "Date"];
    const rows = filtered.map((o) => [
      o.id,
      o.customer_name,
      o.customer_phone,
      o.city,
      o.customer_address,
      o.total,
      o.shipping_cost,
      o.payment_method,
      o.status,
      new Date(o.created_at).toISOString(),
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rouh-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(lang === "ar" ? "تم التصدير" : "Exported");
  };

  const printInvoice = () => {
    if (!selected) return;
    const w = window.open("", "_blank", "width=800,height=900");
    if (!w) return;
    const itemRows = items.map((it) => `
      <tr>
        <td>${it.product_name}</td>
        <td>${it.size || "-"}</td>
        <td style="text-align:center">${it.quantity}</td>
        <td style="text-align:right">${Number(it.price).toLocaleString()}</td>
        <td style="text-align:right">${(Number(it.price) * it.quantity).toLocaleString()}</td>
      </tr>`).join("");
    w.document.write(`<!doctype html><html dir="${lang === "ar" ? "rtl" : "ltr"}"><head><meta charset="utf-8"><title>Invoice ${selected.id.slice(0,8)}</title>
      <style>
        body { font-family: -apple-system, system-ui, sans-serif; padding: 32px; color: #222; }
        h1 { color: #b8860b; margin: 0; font-size: 28px; }
        .brand { display:flex; justify-content:space-between; align-items:start; border-bottom: 2px solid #b8860b; padding-bottom: 16px; margin-bottom: 24px; }
        .info { display:grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; margin-bottom: 24px; font-size: 14px; }
        .info strong { color: #666; font-weight: 500; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 14px; }
        th, td { padding: 10px; border-bottom: 1px solid #eee; }
        th { background: #faf6ed; text-align: ${lang === "ar" ? "right" : "left"}; }
        .totals { text-align: ${lang === "ar" ? "left" : "right"}; font-size: 14px; }
        .totals .grand { font-size: 18px; font-weight: bold; color: #b8860b; margin-top: 8px; }
        @media print { body { padding: 0; } }
      </style></head><body>
      <div class="brand">
        <div><h1>Rouh — روح</h1><div style="color:#888;font-size:13px">contact@rouh.shop</div></div>
        <div style="text-align:${lang === "ar" ? "left" : "right"}"><div style="font-weight:bold">${lang === "ar" ? "فاتورة" : "INVOICE"}</div>
          <div style="font-family:monospace;color:#888">#${selected.id.slice(0,8)}</div>
          <div style="color:#888;font-size:12px">${new Date(selected.created_at).toLocaleString()}</div></div>
      </div>
      <div class="info">
        <div><strong>${lang === "ar" ? "العميل" : "Customer"}:</strong> ${selected.customer_name}</div>
        <div><strong>${lang === "ar" ? "الهاتف" : "Phone"}:</strong> ${selected.customer_phone}</div>
        <div><strong>${lang === "ar" ? "المدينة" : "City"}:</strong> ${selected.city}</div>
        <div><strong>${lang === "ar" ? "الدفع" : "Payment"}:</strong> ${selected.payment_method}</div>
        <div style="grid-column:1/-1"><strong>${lang === "ar" ? "العنوان" : "Address"}:</strong> ${selected.customer_address}</div>
      </div>
      <table><thead><tr>
        <th>${lang === "ar" ? "المنتج" : "Product"}</th>
        <th>${lang === "ar" ? "الحجم" : "Size"}</th>
        <th style="text-align:center">${lang === "ar" ? "الكمية" : "Qty"}</th>
        <th style="text-align:right">${lang === "ar" ? "السعر" : "Price"}</th>
        <th style="text-align:right">${lang === "ar" ? "الإجمالي" : "Subtotal"}</th>
      </tr></thead><tbody>${itemRows}</tbody></table>
      <div class="totals">
        <div>${lang === "ar" ? "الشحن" : "Shipping"}: ${Number(selected.shipping_cost).toLocaleString()} SYP</div>
        <div class="grand">${lang === "ar" ? "المجموع" : "Total"}: ${Number(selected.total).toLocaleString()} SYP</div>
      </div>
      <script>window.onload=()=>{window.print();}</script>
      </body></html>`);
    w.document.close();
  };

  if (loading) return <div className="flex justify-center p-8"><div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-display font-bold">{lang === "ar" ? "إدارة الطلبات" : "Manage Orders"}</h1>
        <Button onClick={exportCsv} variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          {lang === "ar" ? "تصدير Excel" : "Export CSV"}
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder={lang === "ar" ? "بحث بالاسم أو الهاتف..." : "Search by name or phone..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ps-9"
          />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{lang === "ar" ? "الكل" : "All"}</SelectItem>
            {statuses.map((s) => <SelectItem key={s} value={s}>{statusLabel(s)}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="text-sm text-muted-foreground">{filtered.length} / {orders.length}</div>
      </div>

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
            {filtered.map((o) => (
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
            {filtered.length === 0 && <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">{lang === "ar" ? "لا توجد طلبات" : "No orders"}</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between gap-2 pe-6">
              <DialogTitle>{lang === "ar" ? "تفاصيل الطلب" : "Order Details"}</DialogTitle>
              <Button size="sm" variant="outline" onClick={printInvoice} className="gap-2" disabled={itemsLoading}>
                <Printer className="h-4 w-4" />
                {lang === "ar" ? "طباعة الفاتورة" : "Print Invoice"}
              </Button>
            </div>
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
