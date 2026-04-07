import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface DBProduct {
  id: string;
  name: string;
  name_ar: string;
  description: string | null;
  description_ar: string | null;
  price: number;
  image_url: string | null;
  category_id: string | null;
  fragrance: string | null;
  sizes: string[] | null;
  featured: boolean | null;
  is_new: boolean | null;
  best_seller: boolean | null;
  stock: number | null;
}

// Adapter to match the old Product interface used by ProductCard
export interface ProductView {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  price: number;
  image: string;
  category: string;
  fragrance: string;
  sizes: string[];
  featured: boolean;
  isNew: boolean;
  bestSeller: boolean;
  stock: number;
  categoryName?: string;
  categoryNameAr?: string;
}

export const dbToView = (p: DBProduct, categoryName?: string, categoryNameAr?: string): ProductView => ({
  id: p.id,
  name: p.name,
  nameAr: p.name_ar,
  description: p.description || "",
  descriptionAr: p.description_ar || "",
  price: p.price,
  image: p.image_url || "/placeholder.svg",
  category: categoryName || "unisex",
  fragrance: p.fragrance || "oriental",
  sizes: p.sizes || ["50ml", "100ml"],
  featured: p.featured || false,
  isNew: p.is_new || false,
  bestSeller: p.best_seller || false,
  stock: p.stock || 0,
  categoryName,
  categoryNameAr,
});

export const useProducts = () => {
  const [products, setProducts] = useState<ProductView[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const [prodRes, catRes] = await Promise.all([
        supabase.from("products").select("*").order("created_at", { ascending: false }),
        supabase.from("categories").select("id, name, name_ar, slug"),
      ]);

      const categories = catRes.data || [];
      const catMap = new Map(categories.map(c => [c.id, c]));

      const items = (prodRes.data || []).map((p: any) => {
        const cat = p.category_id ? catMap.get(p.category_id) : null;
        return dbToView(p, cat?.slug || cat?.name || "unisex", cat?.name_ar);
      });

      setProducts(items);
      setLoading(false);
    };
    fetch();
  }, []);

  return { products, loading };
};

export const useProduct = (id: string) => {
  const [product, setProduct] = useState<ProductView | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (data) {
        let cat = null;
        if (data.category_id) {
          const { data: catData } = await supabase
            .from("categories")
            .select("name, name_ar, slug")
            .eq("id", data.category_id)
            .maybeSingle();
          cat = catData;
        }
        setProduct(dbToView(data as any, cat?.slug || cat?.name || "unisex", cat?.name_ar));
      }
      setLoading(false);
    };
    fetch();
  }, [id]);

  return { product, loading };
};
