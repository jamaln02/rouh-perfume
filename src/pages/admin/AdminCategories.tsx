import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface Category { id: string; name: string; name_ar: string; slug: string; }

const AdminCategories = () => {
  const { lang } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: "", name_ar: "", slug: "" });
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    const { data } = await supabase.from("categories").select("*").order("created_at");
    setCategories((data as Category[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const handleSave = async () => {
    try {
      if (editing) {
        const { error } = await supabase.from("categories").update(form).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("categories").insert(form);
        if (error) throw error;
      }
      toast.success(lang === "ar" ? "تم الحفظ" : "Saved");
      setOpen(false); setEditing(null); setForm({ name: "", name_ar: "", slug: "" }); fetch();
    } catch (e: any) { toast.error(e.message); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(lang === "ar" ? "هل أنت متأكد؟" : "Are you sure?")) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success(lang === "ar" ? "تم الحذف" : "Deleted"); fetch(); }
  };

  if (loading) return <div className="flex justify-center p-8"><div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold">{lang === "ar" ? "إدارة التصنيفات" : "Manage Categories"}</h1>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditing(null); setForm({ name: "", name_ar: "", slug: "" }); } }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-gold"><Plus className="h-4 w-4 me-2" />{lang === "ar" ? "إضافة تصنيف" : "Add Category"}</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? (lang === "ar" ? "تعديل" : "Edit") : (lang === "ar" ? "إضافة تصنيف" : "Add Category")}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>{lang === "ar" ? "الاسم (EN)" : "Name (EN)"}</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label>{lang === "ar" ? "الاسم (AR)" : "Name (AR)"}</Label><Input value={form.name_ar} onChange={(e) => setForm({ ...form, name_ar: e.target.value })} /></div>
              <div><Label>Slug</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></div>
            </div>
            <Button onClick={handleSave} className="w-full bg-gradient-gold mt-4">{lang === "ar" ? "حفظ" : "Save"}</Button>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{lang === "ar" ? "الاسم" : "Name"}</TableHead>
              <TableHead>{lang === "ar" ? "الاسم بالعربي" : "Arabic Name"}</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((c) => (
              <TableRow key={c.id}>
                <TableCell>{c.name}</TableCell>
                <TableCell>{c.name_ar}</TableCell>
                <TableCell>{c.slug}</TableCell>
                <TableCell className="text-end space-x-1">
                  <Button size="icon" variant="ghost" onClick={() => { setEditing(c); setForm({ name: c.name, name_ar: c.name_ar, slug: c.slug }); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(c.id)}><Trash2 className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {categories.length === 0 && <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">{lang === "ar" ? "لا توجد تصنيفات" : "No categories"}</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminCategories;
