import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { LayoutDashboard, Package, FolderTree, ShoppingCart, Users, LogOut, Home, Star, Tag, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

const AdminLayout = () => {
  const { user, loading, isAdmin, signOut } = useAuth();
  const { lang } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [unreadOrders, setUnreadOrders] = useState<number>(0);

  // Request browser notification permission once
  useEffect(() => {
    if (isAdmin && typeof Notification !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;
    const channel = supabase
      .channel("admin-new-orders")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload) => {
          const o = payload.new as { id: string; customer_name: string; total: number };
          setUnreadOrders((n) => n + 1);
          // Play subtle notification sound
          try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = 880;
            gain.gain.setValueAtTime(0.0001, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
            osc.start();
            osc.stop(ctx.currentTime + 0.4);
          } catch (_) { /* ignore */ }

          // Browser notification (works even when tab is in background)
          try {
            if (typeof Notification !== "undefined" && Notification.permission === "granted") {
              const n = new Notification(
                lang === "ar" ? "🛒 طلب جديد" : "🛒 New Order",
                {
                  body: `${o.customer_name} — ${o.total.toLocaleString()} SYP`,
                  icon: "/favicon.ico",
                  tag: `order-${o.id}`,
                }
              );
              n.onclick = () => {
                window.focus();
                navigate("/admin/orders");
                n.close();
              };
            }
          } catch (_) { /* ignore */ }

          toast.success(
            lang === "ar"
              ? `🛒 طلب جديد من ${o.customer_name}`
              : `🛒 New order from ${o.customer_name}`,
            {
              description: `${o.total.toLocaleString()} SYP`,
              duration: 8000,
              action: {
                label: lang === "ar" ? "عرض" : "View",
                onClick: () => { setUnreadOrders(0); navigate("/admin/orders"); },
              },
            }
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin, lang, navigate]);

  // Clear the badge when the admin opens the orders page
  useEffect(() => {
    if (location.pathname === "/admin/orders") setUnreadOrders(0);
  }, [location.pathname]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" /></div>;
  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  const t = {
    dashboard: lang === "ar" ? "لوحة التحكم" : "Dashboard",
    products: lang === "ar" ? "المنتجات" : "Products",
    categories: lang === "ar" ? "التصنيفات" : "Categories",
    orders: lang === "ar" ? "الطلبات" : "Orders",
    users: lang === "ar" ? "المستخدمون" : "Users",
    reviews: lang === "ar" ? "التقييمات" : "Reviews",
    coupons: lang === "ar" ? "الكوبونات" : "Coupons",
    admin: lang === "ar" ? "إدارة روح" : "Rouh Admin",
    backToSite: lang === "ar" ? "العودة للموقع" : "Back to Site",
    logout: lang === "ar" ? "تسجيل الخروج" : "Sign Out",
  };

  const menuItems = [
    { title: t.dashboard, url: "/admin", icon: LayoutDashboard },
    { title: t.products, url: "/admin/products", icon: Package },
    { title: t.categories, url: "/admin/categories", icon: FolderTree },
    { title: t.orders, url: "/admin/orders", icon: ShoppingCart },
    { title: t.users, url: "/admin/users", icon: Users },
    { title: t.reviews, url: "/admin/reviews", icon: Star },
    { title: t.coupons, url: "/admin/coupons", icon: Tag },
  ];

  const isActive = (url: string) => location.pathname === url;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <Sidebar collapsible="icon" className="border-e border-border">
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="text-primary font-display text-lg px-4 py-3">
                {t.admin}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton asChild>
                        <Link
                          to={item.url}
                          className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                            isActive(item.url)
                              ? "bg-primary/10 text-primary font-medium"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted"
                          }`}
                        >
                          <item.icon className="h-4 w-4 shrink-0" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <div className="mt-auto p-4 space-y-2">
              <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground" asChild>
                <Link to="/"><Home className="h-4 w-4" /> {t.backToSite}</Link>
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-2 text-destructive" onClick={signOut}>
                <LogOut className="h-4 w-4" /> {t.logout}
              </Button>
            </div>
          </SidebarContent>
        </Sidebar>

        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center border-b border-border px-4">
            <SidebarTrigger />
            <div className="ms-auto flex items-center gap-2">
              <Link
                to="/admin/orders"
                className="relative p-2 rounded-lg hover:bg-muted transition-colors"
                aria-label={lang === "ar" ? "الإشعارات" : "Notifications"}
                title={lang === "ar" ? "الطلبات الجديدة" : "New orders"}
              >
                <Bell className="h-5 w-5 text-muted-foreground" />
                {unreadOrders > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[10px] min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center font-bold leading-none">
                    {unreadOrders}
                  </span>
                )}
              </Link>
            </div>
          </header>
          <main className="flex-1 p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
