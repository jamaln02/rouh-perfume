import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Package, FolderTree, ShoppingCart, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Dashboard = () => {
  const { lang } = useLanguage();
  const [stats, setStats] = useState({ products: 0, categories: 0, orders: 0, pendingOrders: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const [products, categories, orders, pending] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("categories").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending"),
      ]);
      setStats({
        products: products.count || 0,
        categories: categories.count || 0,
        orders: orders.count || 0,
        pendingOrders: pending.count || 0,
      });
    };
    fetchStats();
  }, []);

  const cards = [
    { title: lang === "ar" ? "المنتجات" : "Products", value: stats.products, icon: Package, color: "text-blue-500" },
    { title: lang === "ar" ? "التصنيفات" : "Categories", value: stats.categories, icon: FolderTree, color: "text-green-500" },
    { title: lang === "ar" ? "الطلبات" : "Orders", value: stats.orders, icon: ShoppingCart, color: "text-primary" },
    { title: lang === "ar" ? "طلبات معلقة" : "Pending Orders", value: stats.pendingOrders, icon: Users, color: "text-orange-500" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-display font-bold mb-6">
        {lang === "ar" ? "لوحة التحكم" : "Dashboard"}
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Card key={card.title} className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
