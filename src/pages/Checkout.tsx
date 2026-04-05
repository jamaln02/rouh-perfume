import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const cities = [
  { ar: "دمشق", en: "Damascus", shipping: 0 },
  { ar: "حلب", en: "Aleppo", shipping: 8000 },
  { ar: "حمص", en: "Homs", shipping: 5000 },
  { ar: "اللاذقية", en: "Latakia", shipping: 7000 },
  { ar: "طرطوس", en: "Tartus", shipping: 7000 },
  { ar: "حماة", en: "Hama", shipping: 6000 },
  { ar: "السويداء", en: "As-Suwayda", shipping: 5000 },
  { ar: "درعا", en: "Daraa", shipping: 5000 },
];

const Checkout = () => {
  const { t, lang } = useLanguage();
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [city, setCity] = useState(cities[0]);
  const [form, setForm] = useState({ name: "", phone: "", address: "" });

  const formatPrice = (price: number) =>
    new Intl.NumberFormat(lang === "ar" ? "ar-SY" : "en-SY").format(price);

  const shippingCost = totalPrice >= 50000 ? 0 : city.shipping;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.address) {
      toast.error(lang === "ar" ? "يرجى ملء جميع الحقول" : "Please fill all fields");
      return;
    }

    // Build WhatsApp message
    const orderItems = items
      .map((i) => `${lang === "ar" ? i.nameAr : i.name} (${i.size}) x${i.quantity}`)
      .join("\n");
    const msg = encodeURIComponent(
      `${lang === "ar" ? "طلب جديد" : "New Order"}\n\n${orderItems}\n\n${t("total")}: ${formatPrice(totalPrice + shippingCost)} SYP\n${t("name")}: ${form.name}\n${t("phone")}: ${form.phone}\n${t("city")}: ${lang === "ar" ? city.ar : city.en}\n${t("address")}: ${form.address}`
    );
    window.open(`https://wa.me/963900000000?text=${msg}`, "_blank");
    clearCart();
    toast.success(lang === "ar" ? "تم إرسال الطلب بنجاح!" : "Order placed successfully!");
    navigate("/");
  };

  if (items.length === 0) {
    navigate("/cart");
    return null;
  }

  const inputClass = "w-full bg-card text-foreground px-4 py-2.5 rounded-lg border border-border outline-none focus:ring-1 focus:ring-gold placeholder:text-muted-foreground";

  return (
    <div className="min-h-screen pt-20 lg:pt-24">
      <div className="container mx-auto px-4 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gradient-gold mb-8">{t("checkout")}</h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Customer details */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-foreground">{t("customerDetails")}</h2>
            <input
              type="text"
              placeholder={t("name")}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputClass}
            />
            <input
              type="tel"
              placeholder={t("phone")}
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className={inputClass}
              dir="ltr"
            />
            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">{t("city")}</label>
              <select
                value={lang === "ar" ? city.ar : city.en}
                onChange={(e) => {
                  const found = cities.find((c) => (lang === "ar" ? c.ar : c.en) === e.target.value);
                  if (found) setCity(found);
                }}
                className={inputClass}
              >
                {cities.map((c) => (
                  <option key={c.en} value={lang === "ar" ? c.ar : c.en}>
                    {lang === "ar" ? c.ar : c.en}
                  </option>
                ))}
              </select>
            </div>
            <textarea
              placeholder={t("deliveryAddress")}
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className={`${inputClass} h-24 resize-none`}
            />

            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">{t("paymentMethod")}</h3>
              <div className="bg-card border border-border rounded-lg p-4 flex items-center gap-3">
                <div className="w-4 h-4 rounded-full border-2 border-gold flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-gold" />
                </div>
                <span className="text-foreground text-sm">{t("cashOnDelivery")}</span>
              </div>
            </div>
          </div>

          {/* Order summary */}
          <div className="bg-card border border-border rounded-xl p-6 h-fit">
            <h2 className="text-xl font-semibold text-foreground mb-4">{t("orderSummary")}</h2>
            <div className="space-y-3 mb-6">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {lang === "ar" ? item.nameAr : item.name} ({item.size}) x{item.quantity}
                  </span>
                  <span className="text-foreground">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-border pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t("subtotal")}</span>
                <span className="text-foreground">{formatPrice(totalPrice)} SYP</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t("shipping")}</span>
                <span className="text-foreground">
                  {shippingCost === 0 ? (lang === "ar" ? "مجاني" : "Free") : `${formatPrice(shippingCost)} SYP`}
                </span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
                <span className="text-foreground">{t("total")}</span>
                <span className="text-gold">{formatPrice(totalPrice + shippingCost)} SYP</span>
              </div>
            </div>
            <button
              type="submit"
              className="mt-6 w-full bg-gradient-gold text-accent-foreground py-3 rounded-lg font-semibold shadow-gold hover:opacity-90 transition-opacity"
            >
              {t("placeOrder")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
