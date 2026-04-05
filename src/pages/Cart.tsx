import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";

const Cart = () => {
  const { t, lang } = useLanguage();
  const { items, removeItem, updateQuantity, totalPrice } = useCart();

  const formatPrice = (price: number) =>
    new Intl.NumberFormat(lang === "ar" ? "ar-SY" : "en-SY").format(price);

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center gap-6">
        <ShoppingBag size={64} className="text-muted-foreground" />
        <h2 className="text-2xl font-bold text-foreground">{t("emptyCart")}</h2>
        <Link
          to="/shop"
          className="bg-gradient-gold text-accent-foreground px-6 py-3 rounded-lg font-semibold shadow-gold"
        >
          {t("continueShopping")}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 lg:pt-24">
      <div className="container mx-auto px-4 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gradient-gold mb-8">{t("cart")}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {items.map((item) => (
              <motion.div
                key={item.id}
                layout
                className="flex gap-4 bg-card p-4 rounded-xl border border-border"
              >
                <img
                  src={item.image}
                  alt={lang === "ar" ? item.nameAr : item.name}
                  className="w-20 h-20 object-cover rounded-lg"
                  loading="lazy"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">
                    {lang === "ar" ? item.nameAr : item.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">{item.size}</p>
                  <p className="text-gold font-bold mt-1">{formatPrice(item.price)} SYP</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <button onClick={() => removeItem(item.id)} className="text-destructive hover:opacity-70">
                    <Trash2 size={16} />
                  </button>
                  <div className="flex items-center gap-2 border border-border rounded-lg">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1.5 text-foreground hover:text-gold"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="text-sm font-medium text-foreground w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1.5 text-foreground hover:text-gold"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Summary */}
          <div className="bg-card p-6 rounded-xl border border-border h-fit">
            <h3 className="text-lg font-bold text-foreground mb-4">{t("orderSummary")}</h3>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">{t("subtotal")}</span>
              <span className="text-foreground">{formatPrice(totalPrice)} SYP</span>
            </div>
            <div className="flex justify-between text-sm mb-4">
              <span className="text-muted-foreground">{t("shipping")}</span>
              <span className="text-foreground">{totalPrice >= 50000 ? (lang === "ar" ? "مجاني" : "Free") : `${formatPrice(5000)} SYP`}</span>
            </div>
            <div className="border-t border-border pt-4 flex justify-between font-bold">
              <span className="text-foreground">{t("total")}</span>
              <span className="text-gold">{formatPrice(totalPrice + (totalPrice >= 50000 ? 0 : 5000))} SYP</span>
            </div>
            <Link
              to="/checkout"
              className="mt-6 block text-center bg-gradient-gold text-accent-foreground py-3 rounded-lg font-semibold shadow-gold hover:opacity-90 transition-opacity"
            >
              {t("checkout")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
