import { Navigate, Outlet, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
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
import { LayoutDashboard, Package, FolderTree, ShoppingCart, Users, LogOut, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

const AdminLayout = () => {
  const { user, loading, isAdmin, signOut } = useAuth();
  const { lang } = useLanguage();
  const location = useLocation();

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" /></div>;
  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  const t = {
    dashboard: lang === "ar" ? "لوحة التحكم" : "Dashboard",
    products: lang === "ar" ? "المنتجات" : "Products",
    categories: lang === "ar" ? "التصنيفات" : "Categories",
    orders: lang === "ar" ? "الطلبات" : "Orders",
    users: lang === "ar" ? "المستخدمون" : "Users",
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
