import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Coupon {
  id: string;
  code: string;
  discount_percent: number;
  max_uses: number | null;
  used_count: number;
  expires_at: string | null;
  active: boolean;
}

const empty = { code: "", discount_percent: 10, max_uses: "", expires_at: "", active: true };

const AdminCoupons = () => {
  const { lang } = useLanguage();
  const [rows, setRows] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>(empty);

  const load = async () => {
    const { data } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
    setRows((data as Coupon[]) || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.code) return toast.error(lang === "ar" ? "أدخل الكود" : "Enter code");
    const payload = {
      code: form.code.toUpperCase(),
      discount_percent: Number(form.discount_percent),
      max_uses: form.max_uses ? Number(form.max_uses) : null,
      expires_at: form.expires_at || null,
      active: form.active,
    };
    const { error } = await supabase.from("coupons").insert(payload);
    if (error) return toast.error(error.message);
    toast.success(lang === "ar" ? "تم الإنشاء" : "Created");
    setOpen(false); setForm(empty); load();
  };

  const toggle = async (c: Coupon) => {
    await supabase.from("coupons").update({ active: !c.active }).eq("id", c.id);
    load();
  };
  const del = async (id: string) => {
    if (!confirm(lang === "ar" ? "حذف الكوبون؟" : "Delete coupon?")) return;
    await supabase.from("coupons").delete().eq("id", id);
    load();
  };

  if (loading) return <div className="flex justify-center p-8"><div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" /></div>;

  const inp = "w-full bg-background border border-border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary/40";

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-display font-bold">{lang === "ar" ? "كوبونات الخصم" : "Coupons"}</h1>
        <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-1" /> {lang === "ar" ? "إنشاء" : "New"}</Button>
      </div>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{lang === "ar" ? "الكود" : "Code"}</TableHead>
              <TableHead>{lang === "ar" ? "الخصم" : "Discount"}</TableHead>
              <TableHead>{lang === "ar" ? "الاستخدام" : "Uses"}</TableHead>
              <TableHead>{lang === "ar" ? "ينتهي" : "Expires"}</TableHead>
              <TableHead>{lang === "ar" ? "الحالة" : "Status"}</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-mono font-bold">{c.code}</TableCell>
                <TableCell>{c.discount_percent}%</TableCell>
                <TableCell>{c.used_count}{c.max_uses ? ` / ${c.max_uses}` : ""}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{c.expires_at ? new Date(c.expires_at).toLocaleDateString() : "-"}</TableCell>
                <TableCell>
                  <Badge className={c.active ? "bg-green-500/20 text-green-600 cursor-pointer" : "bg-muted text-muted-foreground cursor-pointer"} onClick={() => toggle(c)}>
                    {c.active ? (lang === "ar" ? "فعال" : "Active") : (lang === "ar" ? "موقوف" : "Disabled")}
                  </Badge>
                </TableCell>
                <TableCell><Button size="sm" variant="destructive" onClick={() => del(c.id)}><Trash2 className="h-3 w-3" /></Button></TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">{lang === "ar" ? "لا توجد كوبونات" : "No coupons"}</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{lang === "ar" ? "كوبون جديد" : "New Coupon"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <input className={inp} placeholder={lang === "ar" ? "الكود (مثال: WELCOME10)" : "Code (e.g. WELCOME10)"} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
            <input className={inp} type="number" min={1} max={100} placeholder={lang === "ar" ? "نسبة الخصم %" : "Discount %"} value={form.discount_percent} onChange={(e) => setForm({ ...form, discount_percent: e.target.value })} />
            <input className={inp} type="number" placeholder={lang === "ar" ? "أقصى استخدام (اختياري)" : "Max uses (optional)"} value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: e.target.value })} />
            <input className={inp} type="date" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} />
            <Button onClick={save} className="w-full">{lang === "ar" ? "حفظ" : "Save"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
export default AdminCoupons;