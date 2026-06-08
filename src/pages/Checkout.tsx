import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, Truck, CreditCard, MessageCircle, ChevronDown, Tag, X } from "lucide-react";
import SEO from "@/components/SEO";

const cities = [
  { ar: "دمشق", en: "Damascus", shipping: 0 },
  { ar: "حلب", en: "Aleppo", shipping: 8000 },
  { ar: "حمص", en: "Homs", shipping: 5000 },
  { ar: "اللاذقية", en: "Latakia", shipping: 7000 },
  { ar: "طرطوس", en: "Tartus", shipping: 7000 },
  { ar: "حماة", en: "Hama", shipping: 6000 },
  { ar: "السويداء", en: "As-Suwayda", shipping: 5000 },
  { ar: "درعا", en: "Daraa", shipping: 5000 },
  { ar: "دير الزور", en: "Deir ez-Zor", shipping: 10000 },
  { ar: "الرقة", en: "Raqqa", shipping: 10000 },
  { ar: "الحسكة", en: "Al-Hasakah", shipping: 12000 },
  { ar: "إدلب", en: "Idlib", shipping: 9000 },
  { ar: "القنيطرة", en: "Quneitra", shipping: 6000 },
];

const Checkout = () => {
  const { t, lang } = useLanguage();
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [city, setCity] = useState(cities[0]);
  const [form, setForm] = useState({ name: "", phone: "", address: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount_percent: number; id: string } | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat(lang === "ar" ? "ar-SY" : "en-SY").format(price);

  const shippingCost = totalPrice >= 50000 ? 0 : city.shipping;
  const discountAmount = appliedCoupon ? Math.round((totalPrice * appliedCoupon.discount_percent) / 100) : 0;
  const grandTotal = totalPrice + shippingCost - discountAmount;

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setValidatingCoupon(true);
    const code = couponCode.trim().toUpperCase();
    const { data } = await supabase
      .from("coupons")
      .select("id, code, discount_percent, max_uses, used_count, expires_at, active")
      .eq("code", code)
      .eq("active", true)
      .maybeSingle();
    setValidatingCoupon(false);
    if (
      !data ||
      (data.expires_at && new Date(data.expires_at) < new Date()) ||
      (data.max_uses && data.used_count >= data.max_uses)
    ) {
      toast.error(t("invalidCoupon"));
      return;
    }
    setAppliedCoupon({ id: data.id, code: data.code, discount_percent: data.discount_percent });
    toast.success(t("couponApplied"));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.address) {
      toast.error(lang === "ar" ? "يرجى ملء جميع الحقول المطلوبة" : "Please fill all required fields");
      return;
    }

    setSubmitting(true);
    try {
      // Save order to database
      const orderId = crypto.randomUUID();
      const { error: orderError } = await supabase.from("orders").insert({
        id: orderId,
        user_id: user?.id || null,
        customer_name: form.name,
        customer_phone: form.phone,
        customer_address: form.address,
        city: lang === "ar" ? city.ar : city.en,
        total: grandTotal,
        shipping_cost: shippingCost,
        payment_method: "cash_on_delivery",
        notes: form.notes || null,
        status: "pending",
        coupon_code: appliedCoupon?.code || null,
        discount_amount: discountAmount,
      });

      if (orderError) throw orderError;

      // Save order items (product_id set to null to avoid FK issues with deleted products)
      const orderItems = items.map((item) => ({
        order_id: orderId,
        product_id: null,
        product_name: lang === "ar" ? item.nameAr : item.name,
        size: item.size,
        quantity: item.quantity,
        price: item.price,
      }));

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
      if (itemsError) throw itemsError;

      // Increment coupon usage
      if (appliedCoupon) {
        const { data: c } = await supabase
          .from("coupons")
          .select("used_count")
          .eq("id", appliedCoupon.id)
          .single();
        await supabase
          .from("coupons")
          .update({ used_count: (c?.used_count || 0) + 1 })
          .eq("id", appliedCoupon.id);
      }

      clearCart();
      toast.success(lang === "ar" ? "تم إرسال طلبك بنجاح! 🎉" : "Order placed successfully! 🎉");
      navigate(`/order-success/${orderId}`);
    } catch (err) {
      console.error(err);
      toast.error(lang === "ar" ? "حدث خطأ، حاول مرة أخرى" : "An error occurred, please try again");
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    navigate("/cart");
    return null;
  }

  const inputClass =
    "w-full bg-background text-foreground px-4 py-3 rounded-xl border border-border outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary placeholder:text-muted-foreground transition-all duration-200";

  return (
    <div className="min-h-screen pt-20 lg:pt-24 pb-12">
      <SEO
        title={lang === "ar" ? "إتمام الطلب | روح" : "Checkout | Rouh"}
        description={lang === "ar" ? "أكمل بيانات التوصيل وادفع عند الاستلام لطلبك من عطور روح." : "Complete delivery details and pay cash on delivery for your Rouh perfumes order."}
        path="/checkout"
      />
      <div className="container mx-auto px-4 lg:px-8">
        <h1 className="sr-only">{lang === "ar" ? "إتمام الطلب" : "Checkout"}</h1>
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <button
                onClick={() => setStep(s)}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  step >= s
                    ? "bg-primary text-primary-foreground shadow-gold"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {s}
              </button>
              <span className={`text-sm font-medium hidden sm:inline ${step >= s ? "text-foreground" : "text-muted-foreground"}`}>
                {s === 1
                  ? lang === "ar" ? "بيانات التوصيل" : "Delivery Info"
                  : lang === "ar" ? "تأكيد الطلب" : "Confirm Order"}
              </span>
              {s < 2 && <div className={`w-12 h-0.5 mx-2 ${step > s ? "bg-primary" : "bg-border"}`} />}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Customer details - 3 cols */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3 space-y-6"
          >
            <div className="bg-card border border-border rounded-2xl p-6 lg:p-8 space-y-5">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Truck size={20} className="text-primary" />
                {t("customerDetails")}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="checkout-name" className="text-sm font-medium text-foreground mb-1.5 block">
                    {t("name")} <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="checkout-name"
                    type="text"
                    placeholder={lang === "ar" ? "الاسم الكامل" : "Full Name"}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="checkout-phone" className="text-sm font-medium text-foreground mb-1.5 block">
                    {t("phone")} <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="checkout-phone"
                    type="tel"
                    placeholder="+963 9XX XXX XXX"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className={inputClass}
                    dir="ltr"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="checkout-city" className="text-sm font-medium text-foreground mb-1.5 block">
                  {t("city")} <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <select
                    id="checkout-city"
                    value={lang === "ar" ? city.ar : city.en}
                    onChange={(e) => {
                      const found = cities.find((c) => (lang === "ar" ? c.ar : c.en) === e.target.value);
                      if (found) setCity(found);
                    }}
                    className={`${inputClass} appearance-none cursor-pointer`}
                  >
                    {cities.map((c) => (
                      <option key={c.en} value={lang === "ar" ? c.ar : c.en}>
                        {lang === "ar" ? c.ar : c.en}
                        {c.shipping === 0
                          ? ` (${lang === "ar" ? "شحن مجاني" : "Free shipping"})`
                          : ` (${formatPrice(c.shipping)} SYP)`}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute end-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              <div>
                <label htmlFor="checkout-address" className="text-sm font-medium text-foreground mb-1.5 block">
                  {t("deliveryAddress")} <span className="text-destructive">*</span>
                </label>
                <textarea
                  id="checkout-address"
                  placeholder={lang === "ar" ? "العنوان التفصيلي للتوصيل" : "Detailed delivery address"}
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className={`${inputClass} h-24 resize-none`}
                  required
                />
              </div>

              <div>
                <label htmlFor="checkout-notes" className="text-sm font-medium text-foreground mb-1.5 block">
                  {lang === "ar" ? "ملاحظات (اختياري)" : "Notes (optional)"}
                </label>
                <textarea
                  id="checkout-notes"
                  placeholder={lang === "ar" ? "أي ملاحظات إضافية..." : "Any additional notes..."}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className={`${inputClass} h-20 resize-none`}
                />
              </div>

              {/* Payment method */}
              <div>
                <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                  <CreditCard size={16} className="text-primary" />
                  {t("paymentMethod")}
                </h3>
                <div className="bg-background border-2 border-primary/30 rounded-xl p-4 flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                  </div>
                  <span className="text-foreground font-medium">{t("cashOnDelivery")}</span>
                </div>
              </div>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
                <ShieldCheck size={20} className="text-primary shrink-0" />
                <span className="text-xs text-muted-foreground">
                  {lang === "ar" ? "معاملات آمنة 100%" : "100% Secure Transaction"}
                </span>
              </div>
              <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
                <MessageCircle size={20} className="text-[#25D366] shrink-0" />
                <span className="text-xs text-muted-foreground">
                  {lang === "ar" ? "دعم فوري عبر واتساب" : "Instant WhatsApp Support"}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Order summary - 2 cols */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <div className="bg-card border border-border rounded-2xl p-6 sticky top-28">
              <h2 className="text-xl font-bold text-foreground mb-5">{t("orderSummary")}</h2>

              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id + item.size} className="flex gap-3 items-start">
                    <img
                      src={item.image}
                      alt={lang === "ar" ? item.nameAr : item.name}
                      className="w-14 h-14 rounded-lg object-cover border border-border"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm truncate">
                        {lang === "ar" ? item.nameAr : item.name}
                      </p>
                      <p className="text-xs text-muted-foreground">{item.size} × {item.quantity}</p>
                    </div>
                    <p className="text-sm font-bold text-foreground whitespace-nowrap">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t("subtotal")}</span>
                  <span className="text-foreground">{formatPrice(totalPrice)} SYP</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t("shipping")}</span>
                  <span className={shippingCost === 0 ? "text-green-500 font-medium" : "text-foreground"}>
                    {shippingCost === 0 ? (lang === "ar" ? "مجاني ✓" : "Free ✓") : `${formatPrice(shippingCost)} SYP`}
                  </span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-500 font-medium">
                      {t("discount")} ({appliedCoupon.code} -{appliedCoupon.discount_percent}%)
                    </span>
                    <span className="text-green-500 font-medium">-{formatPrice(discountAmount)} SYP</span>
                  </div>
                )}
                {totalPrice < 50000 && (
                  <p className="text-xs text-primary">
                    {lang === "ar"
                      ? `أضف ${formatPrice(50000 - totalPrice)} ل.س للشحن المجاني`
                      : `Add ${formatPrice(50000 - totalPrice)} SYP for free shipping`}
                  </p>
                )}

                {/* Coupon input */}
                <div className="pt-2">
                  {appliedCoupon ? (
                    <button
                      type="button"
                      onClick={() => { setAppliedCoupon(null); setCouponCode(""); }}
                      className="w-full text-xs text-muted-foreground hover:text-destructive flex items-center justify-center gap-1"
                    >
                      <X size={12} /> {t("removeCoupon")} {appliedCoupon.code}
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag size={14} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder={t("couponCode")}
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          className="w-full bg-background border border-border rounded-lg ps-9 pe-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40 uppercase"
                          dir="ltr"
                        />
                      </div>
                      <button
                        type="button"
                        disabled={validatingCoupon || !couponCode.trim()}
                        onClick={applyCoupon}
                        className="bg-secondary text-secondary-foreground px-4 rounded-lg text-sm font-semibold hover:bg-secondary/80 disabled:opacity-50"
                      >
                        {t("applyCoupon")}
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex justify-between font-bold text-lg pt-3 border-t border-border">
                  <span className="text-foreground">{t("total")}</span>
                  <span className="text-primary">{formatPrice(grandTotal)} SYP</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="mt-6 w-full bg-gradient-gold text-accent-foreground py-4 rounded-xl font-bold shadow-gold hover:shadow-gold-lg hover:opacity-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
              >
                {submitting
                  ? (lang === "ar" ? "جارٍ الإرسال..." : "Submitting...")
                  : t("placeOrder")}
              </button>

              <p className="text-xs text-center text-muted-foreground mt-3">
                {lang === "ar"
                  ? "سيتم التواصل معك لتأكيد الطلب خلال 24 ساعة"
                  : "We'll contact you to confirm your order within 24 hours"}
              </p>
            </div>
          </motion.div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
