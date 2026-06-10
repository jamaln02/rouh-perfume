import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { Search, Package, CheckCircle2, Truck, Clock, XCircle } from "lucide-react";
import SEO from "@/components/SEO";

interface Order {
  id: string;
  customer_name: string;
  city: string;
  status: string;
  total: number;
  created_at: string;
}

const statusMeta: Record<string, { icon: any; color: string; ar: string; en: string }> = {
  pending: { icon: Clock, color: "text-yellow-500", ar: "قيد المراجعة", en: "Pending" },
  confirmed: { icon: CheckCircle2, color: "text-blue-500", ar: "تم التأكيد", en: "Confirmed" },
  shipped: { icon: Truck, color: "text-purple-500", ar: "تم الشحن", en: "Shipped" },
  delivered: { icon: CheckCircle2, color: "text-green-500", ar: "تم التسليم", en: "Delivered" },
  cancelled: { icon: XCircle, color: "text-red-500", ar: "ملغي", en: "Cancelled" },
};

const TrackOrder = () => {
  const { t, lang } = useLanguage();
  const [phone, setPhone] = useState("");
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [loading, setLoading] = useState(false);

  const search = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;
    setLoading(true);
    const { data } = await supabase.functions.invoke("track-orders", { body: { phone: phone.trim() } });
    setOrders((data?.orders as Order[]) || []);
    setLoading(false);
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <SEO
        title={lang === "ar" ? "تتبع الطلب | روح" : "Track Order | Rouh"}
        description={lang === "ar" ? "تتبع طلبك من عطور روح برقم هاتفك." : "Track your Rouh perfumes order with your phone number."}
        path="/track"
      />
      <div className="container mx-auto px-4 max-w-2xl">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-4xl md:text-5xl font-bold text-gradient-gold text-center mb-2"
        >
          {t("trackOrderTitle")}
        </motion.h1>
        <p className="text-muted-foreground text-center mb-10">
          {lang === "ar" ? "أدخل رقم هاتفك لعرض حالة طلباتك" : "Enter your phone number to view order status"}
        </p>

        <form onSubmit={search} className="flex gap-2 mb-8">
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t("enterPhone")}
            className="flex-1 bg-card border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/40"
            dir="ltr"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-gold text-accent-foreground px-6 rounded-xl font-semibold shadow-gold flex items-center gap-2 disabled:opacity-50"
          >
            <Search size={18} /> {t("trackBtn")}
          </button>
        </form>

        {orders !== null && orders.length === 0 && (
          <div className="bg-card border border-border rounded-2xl p-10 text-center">
            <Package size={40} className="mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">{t("noOrdersFound")}</p>
          </div>
        )}

        <div className="space-y-4">
          {orders?.map((o) => {
            const meta = statusMeta[o.status] || statusMeta.pending;
            const Icon = meta.icon;
            return (
              <motion.div
                key={o.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-border rounded-2xl p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs text-muted-foreground">{t("orderNumber")}</p>
                    <p className="font-mono text-sm font-bold text-foreground">#{o.id.slice(0, 8).toUpperCase()}</p>
                  </div>
                  <div className={`flex items-center gap-2 font-medium ${meta.color}`}>
                    <Icon size={18} />
                    <span>{meta[lang]}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm border-t border-border pt-3">
                  <div>
                    <p className="text-muted-foreground text-xs">{t("orderDate")}</p>
                    <p className="text-foreground">{new Date(o.created_at).toLocaleDateString(lang === "ar" ? "ar-SY" : "en-US")}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">{t("total")}</p>
                    <p className="text-gold font-bold">{Number(o.total).toLocaleString()} SYP</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TrackOrder;