import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  city: string;
  status: string;
  total: number;
  shipping_cost: number;
  payment_method: string;
  created_at: string;
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

  const fetchOrders = async () => {
    const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    setOrders((data as Order[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, []);

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
              </TableRow>
            ))}
            {orders.length === 0 && <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">{lang === "ar" ? "لا توجد طلبات" : "No orders"}</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminOrders;
