import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Package, FolderTree, ShoppingCart, Users, DollarSign, TrendingUp, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Link } from "react-router-dom";

interface OrderRow { id: string; total: number; status: string; created_at: string; }
interface ItemRow { product_name: string; quantity: number; price: number; }
interface LowStock { id: string; name: string; name_ar: string; stock: number; }

const Dashboard = () => {
  const { lang } = useLanguage();
  const [counts, setCounts] = useState({ products: 0, categories: 0, orders: 0, pendingOrders: 0 });
  const [revenue, setRevenue] = useState({ total: 0, avg: 0, count: 0 });
  const [chartData, setChartData] = useState<{ date: string; sales: number }[]>([]);
  const [topProducts, setTopProducts] = useState<{ name: string; qty: number; revenue: number }[]>([]);
  const [lowStock, setLowStock] = useState<LowStock[]>([]);

  useEffect(() => {
    (async () => {
      const since = new Date();
      since.setDate(since.getDate() - 30);
      const sinceIso = since.toISOString();

      const [products, categories, orders, pending, recentOrders, items, low] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("categories").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("orders").select("id,total,status,created_at").gte("created_at", sinceIso).neq("status", "cancelled"),
        supabase.from("order_items").select("product_name, quantity, price"),
        supabase.from("products").select("id,name,name_ar,stock").lte("stock", 5).order("stock", { ascending: true }).limit(8),
      ]);

      setCounts({
        products: products.count || 0,
        categories: categories.count || 0,
        orders: orders.count || 0,
        pendingOrders: pending.count || 0,
      });

      const rows = (recentOrders.data || []) as OrderRow[];
      const total = rows.reduce((s, o) => s + Number(o.total || 0), 0);
      setRevenue({ total, avg: rows.length ? total / rows.length : 0, count: rows.length });

      // Group by day
      const byDay = new Map<string, number>();
      for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        byDay.set(d.toISOString().slice(0, 10), 0);
      }
      rows.forEach((o) => {
        const k = o.created_at.slice(0, 10);
        if (byDay.has(k)) byDay.set(k, (byDay.get(k) || 0) + Number(o.total));
      });
      setChartData(Array.from(byDay.entries()).map(([date, sales]) => ({
        date: date.slice(5),
        sales: Math.round(sales),
      })));

      // Top products
      const agg = new Map<string, { qty: number; revenue: number }>();
      ((items.data || []) as ItemRow[]).forEach((it) => {
        const cur = agg.get(it.product_name) || { qty: 0, revenue: 0 };
        cur.qty += it.quantity;
        cur.revenue += Number(it.price) * it.quantity;
        agg.set(it.product_name, cur);
      });
      setTopProducts(
        Array.from(agg.entries())
          .map(([name, v]) => ({ name, ...v }))
          .sort((a, b) => b.qty - a.qty)
          .slice(0, 5)
      );

      setLowStock((low.data || []) as LowStock[]);
    })();
  }, []);

  const fmt = (n: number) => n.toLocaleString();

  const cards = [
    { title: lang === "ar" ? "إجمالي المبيعات (٣٠ يوم)" : "Revenue (30d)", value: `${fmt(Math.round(revenue.total))} SYP`, icon: DollarSign, color: "text-primary" },
    { title: lang === "ar" ? "متوسط الطلب" : "Avg Order", value: `${fmt(Math.round(revenue.avg))} SYP`, icon: TrendingUp, color: "text-green-500" },
    { title: lang === "ar" ? "الطلبات" : "Orders", value: counts.orders, icon: ShoppingCart, color: "text-blue-500" },
    { title: lang === "ar" ? "طلبات معلقة" : "Pending", value: counts.pendingOrders, icon: Users, color: "text-orange-500" },
    { title: lang === "ar" ? "المنتجات" : "Products", value: counts.products, icon: Package, color: "text-purple-500" },
    { title: lang === "ar" ? "التصنيفات" : "Categories", value: counts.categories, icon: FolderTree, color: "text-pink-500" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold">{lang === "ar" ? "لوحة التحكم" : "Dashboard"}</h1>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {cards.map((c) => (
          <Card key={c.title} className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-medium text-muted-foreground">{c.title}</CardTitle>
              <c.icon className={`h-4 w-4 ${c.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{c.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 border-border">
          <CardHeader>
            <CardTitle className="text-base">{lang === "ar" ? "المبيعات اليومية (آخر ٣٠ يوم)" : "Daily Sales (Last 30 days)"}</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.some(d => d.sales > 0) ? (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                  <Line type="monotone" dataKey="sales" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[260px] flex items-center justify-center text-muted-foreground text-sm">
                {lang === "ar" ? "لا مبيعات بعد" : "No sales yet"}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base">{lang === "ar" ? "أكثر المنتجات مبيعاً" : "Top Products"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topProducts.length === 0 && <div className="text-sm text-muted-foreground">—</div>}
            {topProducts.map((p, i) => (
              <div key={p.name} className="flex items-center justify-between gap-2 text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-primary font-bold w-5">{i + 1}.</span>
                  <span className="truncate">{p.name}</span>
                </div>
                <span className="text-muted-foreground text-xs whitespace-nowrap">{p.qty} {lang === "ar" ? "وحدة" : "units"}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {lowStock.length > 0 && (
        <Card className="border-orange-500/40 bg-orange-500/5">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-orange-600 dark:text-orange-400">
              <AlertTriangle className="h-5 w-5" />
              {lang === "ar" ? "تنبيه: مخزون منخفض" : "Low Stock Alert"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {lowStock.map((p) => (
                <Link
                  key={p.id}
                  to="/admin/products"
                  className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-sm hover:border-primary transition-colors"
                >
                  <span className="truncate">{lang === "ar" ? p.name_ar : p.name}</span>
                  <span className={`font-bold ${p.stock === 0 ? "text-destructive" : "text-orange-500"}`}>{p.stock}</span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
