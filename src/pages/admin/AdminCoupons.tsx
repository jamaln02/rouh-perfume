import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Trash2, Users, User as UserIcon, History } from "lucide-react";
import { toast } from "sonner";

interface Coupon {
  id: string;
  code: string;
  discount_percent: number;
  max_uses: number | null;
  used_count: number;
  expires_at: string | null;
  active: boolean;
  assigned_to_user_id: string | null;
  assigned_to_phone: string | null;
  per_user_limit: number;
}

interface Redemption {
  id: string;
  source: string;
  code: string;
  user_id: string | null;
  phone: string | null;
  order_id: string | null;
  discount_amount: number;
  discount_percent: number;
  redeemed_at: string;
}

interface ProfileLite { id: string; full_name: string | null; phone: string | null }

const empty = {
  code: "",
  discount_percent: 10,
  max_uses: "",
  expires_at: "",
  active: true,
  assignment: "global" as "global" | "user" | "phone",
  assigned_to_user_id: "",
  assigned_to_phone: "",
  per_user_limit: 1,
};

const AdminCoupons = () => {
  const { lang } = useLanguage();
  const [rows, setRows] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>(empty);
  const [profiles, setProfiles] = useState<ProfileLite[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [viewCoupon, setViewCoupon] = useState<Coupon | null>(null);

  const load = async () => {
    const { data } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
    setRows((data as Coupon[]) || []);
    setLoading(false);
  };
  const loadProfiles = async () => {
    const { data } = await supabase.from("profiles").select("id, full_name, phone").order("created_at", { ascending: false }).limit(500);
    setProfiles((data as ProfileLite[]) || []);
  };
  useEffect(() => { load(); loadProfiles(); }, []);

  const save = async () => {
    if (!form.code) return toast.error(lang === "ar" ? "أدخل الكود" : "Enter code");
    if (form.assignment === "user" && !form.assigned_to_user_id) return toast.error(lang === "ar" ? "اختر المستخدم" : "Select a user");
    if (form.assignment === "phone" && (!form.assigned_to_phone || form.assigned_to_phone.length < 6)) return toast.error(lang === "ar" ? "أدخل رقم هاتف صحيح" : "Enter a valid phone");
    const payload = {
      code: form.code.toUpperCase(),
      discount_percent: Number(form.discount_percent),
      max_uses: form.max_uses ? Number(form.max_uses) : null,
      expires_at: form.expires_at || null,
      active: form.active,
      assigned_to_user_id: form.assignment === "user" ? form.assigned_to_user_id : null,
      assigned_to_phone: form.assignment === "phone" ? form.assigned_to_phone.trim() : null,
      per_user_limit: Math.max(1, Number(form.per_user_limit) || 1),
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
  const openRedemptions = async (c: Coupon) => {
    setViewCoupon(c);
    const { data } = await supabase
      .from("coupon_redemptions")
      .select("*")
      .eq("coupon_id", c.id)
      .order("redeemed_at", { ascending: false });
    setRedemptions((data as Redemption[]) || []);
  };
  const profileFor = (uid: string | null) => profiles.find((p) => p.id === uid);

  if (loading) return <div className="flex justify-center p-8"><div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" /></div>;

  const inp = "w-full bg-background border border-border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary/40";

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-display font-bold">{lang === "ar" ? "كوبونات الخصم" : "Coupons"}</h1>
        <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-1" /> {lang === "ar" ? "إنشاء" : "New"}</Button>
      </div>
      <div className="border rounded-lg overflow-x-auto">
        <Table className="min-w-[820px]">
          <TableHeader>
            <TableRow>
              <TableHead>{lang === "ar" ? "الكود" : "Code"}</TableHead>
              <TableHead>{lang === "ar" ? "الخصم" : "Discount"}</TableHead>
              <TableHead>{lang === "ar" ? "النوع" : "Type"}</TableHead>
              <TableHead>{lang === "ar" ? "لكل مستخدم" : "Per user"}</TableHead>
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
                <TableCell>
                  {c.assigned_to_user_id ? (
                    <Badge variant="outline" className="gap-1"><UserIcon className="h-3 w-3" />{profileFor(c.assigned_to_user_id)?.full_name || (lang === "ar" ? "مستخدم" : "User")}</Badge>
                  ) : c.assigned_to_phone ? (
                    <Badge variant="outline" className="gap-1"><UserIcon className="h-3 w-3" />{c.assigned_to_phone}</Badge>
                  ) : (
                    <Badge variant="secondary" className="gap-1"><Users className="h-3 w-3" />{lang === "ar" ? "عام" : "Global"}</Badge>
                  )}
                </TableCell>
                <TableCell className="text-center">{c.per_user_limit}</TableCell>
                <TableCell>{c.used_count}{c.max_uses ? ` / ${c.max_uses}` : ""}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{c.expires_at ? new Date(c.expires_at).toLocaleDateString() : "-"}</TableCell>
                <TableCell>
                  <Badge className={c.active ? "bg-green-500/20 text-green-600 cursor-pointer" : "bg-muted text-muted-foreground cursor-pointer"} onClick={() => toggle(c)}>
                    {c.active ? (lang === "ar" ? "فعال" : "Active") : (lang === "ar" ? "موقوف" : "Disabled")}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2 justify-end">
                    <Button size="sm" variant="outline" onClick={() => openRedemptions(c)} title={lang === "ar" ? "سجل الاستخدام" : "Redemptions"}><History className="h-3 w-3" /></Button>
                    <Button size="sm" variant="destructive" onClick={() => del(c.id)}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">{lang === "ar" ? "لا توجد كوبونات" : "No coupons"}</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{lang === "ar" ? "كوبون جديد" : "New Coupon"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <input className={inp} placeholder={lang === "ar" ? "الكود (مثال: WELCOME10)" : "Code (e.g. WELCOME10)"} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
            <input className={inp} type="number" min={1} max={100} placeholder={lang === "ar" ? "نسبة الخصم %" : "Discount %"} value={form.discount_percent} onChange={(e) => setForm({ ...form, discount_percent: e.target.value })} />

            <div className="space-y-2 border border-border rounded-lg p-3">
              <label className="text-sm font-medium">{lang === "ar" ? "نوع الكوبون" : "Coupon type"}</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { v: "global", ar: "عام", en: "Global" },
                  { v: "user", ar: "مستخدم مسجّل", en: "Registered user" },
                  { v: "phone", ar: "رقم هاتف", en: "Phone number" },
                ].map((o) => (
                  <button key={o.v} type="button"
                    onClick={() => setForm({ ...form, assignment: o.v })}
                    className={`px-2 py-2 text-xs rounded-lg border transition ${form.assignment === o.v ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/40"}`}>
                    {lang === "ar" ? o.ar : o.en}
                  </button>
                ))}
              </div>
              {form.assignment === "user" && (
                <select className={inp} value={form.assigned_to_user_id} onChange={(e) => setForm({ ...form, assigned_to_user_id: e.target.value })}>
                  <option value="">{lang === "ar" ? "اختر مستخدم…" : "Select user…"}</option>
                  {profiles.map((p) => (
                    <option key={p.id} value={p.id}>{p.full_name || p.id.slice(0, 8)}{p.phone ? ` — ${p.phone}` : ""}</option>
                  ))}
                </select>
              )}
              {form.assignment === "phone" && (
                <input className={inp} placeholder={lang === "ar" ? "رقم الهاتف (مثال: 09xxxxxxxx)" : "Phone (e.g. 09xxxxxxxx)"} value={form.assigned_to_phone} onChange={(e) => setForm({ ...form, assigned_to_phone: e.target.value })} />
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted-foreground">{lang === "ar" ? "أقصى استخدام كلي" : "Max total uses"}</label>
                <input className={inp} type="number" placeholder={lang === "ar" ? "اختياري" : "optional"} value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">{lang === "ar" ? "استخدام لكل مستخدم" : "Uses per user"}</label>
                <input className={inp} type="number" min={1} value={form.per_user_limit} onChange={(e) => setForm({ ...form, per_user_limit: e.target.value })} />
              </div>
            </div>

            <input className={inp} type="date" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} />
            <Button onClick={save} className="w-full">{lang === "ar" ? "حفظ" : "Save"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewCoupon} onOpenChange={(o) => !o && setViewCoupon(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-mono">{viewCoupon?.code} — {lang === "ar" ? "سجل الاستخدام" : "Redemption log"}</DialogTitle>
          </DialogHeader>
          {redemptions.length === 0 ? (
            <p className="text-center text-muted-foreground py-6">{lang === "ar" ? "لم يُستخدم بعد" : "Not used yet"}</p>
          ) : (
            <div className="border rounded-lg overflow-x-auto">
              <Table className="min-w-[520px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>{lang === "ar" ? "المستخدم" : "User"}</TableHead>
                    <TableHead>{lang === "ar" ? "الهاتف" : "Phone"}</TableHead>
                    <TableHead>{lang === "ar" ? "الطلب" : "Order"}</TableHead>
                    <TableHead>{lang === "ar" ? "الخصم" : "Discount"}</TableHead>
                    <TableHead>{lang === "ar" ? "التاريخ" : "Date"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {redemptions.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>{profileFor(r.user_id)?.full_name || (r.user_id ? r.user_id.slice(0, 8) : "—")}</TableCell>
                      <TableCell className="font-mono text-xs">{r.phone || "—"}</TableCell>
                      <TableCell className="font-mono text-xs">{r.order_id ? r.order_id.slice(0, 8) : "—"}</TableCell>
                      <TableCell>{r.discount_amount.toLocaleString()} ({r.discount_percent}%)</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{new Date(r.redeemed_at).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
export default AdminCoupons;