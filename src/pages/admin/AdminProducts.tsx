import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface Product {
  id: string;
  name: string;
  name_ar: string;
  description: string;
  description_ar: string;
  price: number;
  image_url: string;
  category_id: string | null;
  fragrance: string;
  sizes: string[];
  featured: boolean;
  is_new: boolean;
  best_seller: boolean;
  stock: number;
}

interface Category {
  id: string;
  name: string;
  name_ar: string;
}

const emptyProduct: Omit<Product, "id"> = {
  name: "", name_ar: "", description: "", description_ar: "",
  price: 0, image_url: "", category_id: null, fragrance: "oriental",
  sizes: ["50ml", "100ml"], featured: false, is_new: false, best_seller: false, stock: 0,
};

const AdminProducts = () => {
  const { lang } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyProduct);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const [p, c] = await Promise.all([
      supabase.from("products").select("*").order("created_at", { ascending: false }),
      supabase.from("categories").select("id, name, name_ar"),
    ]);
    setProducts((p.data as Product[]) || []);
    setCategories((c.data as Category[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async () => {
    try {
      if (editing) {
        const { error } = await supabase.from("products").update(form).eq("id", editing.id);
        if (error) throw error;
        toast.success(lang === "ar" ? "تم تحديث المنتج" : "Product updated");
      } else {
        const { error } = await supabase.from("products").insert(form);
        if (error) throw error;
        toast.success(lang === "ar" ? "تم إضافة المنتج" : "Product added");
      }
      setOpen(false);
      setEditing(null);
      setForm(emptyProduct);
      fetchData();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(lang === "ar" ? "هل أنت متأكد من الحذف؟" : "Are you sure?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success(lang === "ar" ? "تم الحذف" : "Deleted"); fetchData(); }
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({ name: p.name, name_ar: p.name_ar, description: p.description || "", description_ar: p.description_ar || "", price: p.price, image_url: p.image_url || "", category_id: p.category_id, fragrance: p.fragrance || "oriental", sizes: p.sizes || [], featured: p.featured, is_new: p.is_new, best_seller: p.best_seller, stock: p.stock });
    setOpen(true);
  };

  const t = {
    title: lang === "ar" ? "إدارة المنتجات" : "Manage Products",
    add: lang === "ar" ? "إضافة منتج" : "Add Product",
    edit: lang === "ar" ? "تعديل المنتج" : "Edit Product",
    save: lang === "ar" ? "حفظ" : "Save",
    name: lang === "ar" ? "الاسم (EN)" : "Name (EN)",
    nameAr: lang === "ar" ? "الاسم (AR)" : "Name (AR)",
    desc: lang === "ar" ? "الوصف (EN)" : "Description (EN)",
    descAr: lang === "ar" ? "الوصف (AR)" : "Description (AR)",
    price: lang === "ar" ? "السعر" : "Price",
    image: lang === "ar" ? "رابط الصورة" : "Image URL",
    category: lang === "ar" ? "التصنيف" : "Category",
    fragrance: lang === "ar" ? "نوع العطر" : "Fragrance",
    stock: lang === "ar" ? "المخزون" : "Stock",
    featured: lang === "ar" ? "مميز" : "Featured",
    isNew: lang === "ar" ? "جديد" : "New",
    bestSeller: lang === "ar" ? "الأكثر مبيعاً" : "Best Seller",
  };

  if (loading) return <div className="flex justify-center p-8"><div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold">{t.title}</h1>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditing(null); setForm(emptyProduct); } }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-gold"><Plus className="h-4 w-4 me-2" />{t.add}</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? t.edit : t.add}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>{t.name}</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label>{t.nameAr}</Label><Input value={form.name_ar} onChange={(e) => setForm({ ...form, name_ar: e.target.value })} /></div>
              <div className="col-span-2"><Label>{t.desc}</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div className="col-span-2"><Label>{t.descAr}</Label><Input value={form.description_ar} onChange={(e) => setForm({ ...form, description_ar: e.target.value })} /></div>
              <div><Label>{t.price}</Label><Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} /></div>
              <div><Label>{t.stock}</Label><Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} /></div>
              <div className="col-span-2"><Label>{t.image}</Label><Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} /></div>
              <div>
                <Label>{t.category}</Label>
                <Select value={form.category_id || ""} onValueChange={(v) => setForm({ ...form, category_id: v || null })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => <SelectItem key={c.id} value={c.id}>{lang === "ar" ? c.name_ar : c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t.fragrance}</Label>
                <Select value={form.fragrance} onValueChange={(v) => setForm({ ...form, fragrance: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["oud", "floral", "woody", "fresh", "oriental"].map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-4">
                <Label>{t.featured}</Label><Switch checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} />
              </div>
              <div className="flex items-center gap-4">
                <Label>{t.isNew}</Label><Switch checked={form.is_new} onCheckedChange={(v) => setForm({ ...form, is_new: v })} />
              </div>
              <div className="flex items-center gap-4">
                <Label>{t.bestSeller}</Label><Switch checked={form.best_seller} onCheckedChange={(v) => setForm({ ...form, best_seller: v })} />
              </div>
            </div>
            <Button onClick={handleSave} className="w-full bg-gradient-gold mt-4">{t.save}</Button>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t.name}</TableHead>
              <TableHead>{t.price}</TableHead>
              <TableHead>{t.stock}</TableHead>
              <TableHead>{t.featured}</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{lang === "ar" ? p.name_ar : p.name}</TableCell>
                <TableCell>{p.price.toLocaleString()} SYP</TableCell>
                <TableCell>{p.stock}</TableCell>
                <TableCell>{p.featured ? "✓" : "—"}</TableCell>
                <TableCell className="text-end space-x-1">
                  <Button size="icon" variant="ghost" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(p.id)}><Trash2 className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {products.length === 0 && (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">{lang === "ar" ? "لا توجد منتجات" : "No products yet"}</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminProducts;
