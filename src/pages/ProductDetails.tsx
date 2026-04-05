import { useParams } from "react-router-dom";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { getProduct, products } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import { ShoppingBag, MessageCircle, ChevronLeft, ChevronRight, Truck, Shield } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const ProductDetails = () => {
  const { id } = useParams();
  const { t, lang } = useLanguage();
  const { addItem } = useCart();
  const product = getProduct(id || "");
  const [selectedSize, setSelectedSize] = useState(product?.sizes[0] || "");

  if (!product) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center gap-4">
        <p className="text-2xl font-bold text-foreground">
          {lang === "ar" ? "المنتج غير موجود" : "Product not found"}
        </p>
        <Link to="/shop" className="text-gold hover:underline">
          {lang === "ar" ? "العودة للمتجر" : "Back to shop"}
        </Link>
      </div>
    );
  }

  const related = products
    .filter((p) => p.id !== product.id && (p.category === product.category || p.fragrance === product.fragrance))
    .slice(0, 4);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat(lang === "ar" ? "ar-SY" : "en-SY").format(price);

  const handleAdd = () => {
    addItem({
      id: product.id,
      name: product.name,
      nameAr: product.nameAr,
      price: product.price,
      image: product.image,
      size: selectedSize,
    });
    toast.success(lang === "ar" ? "تمت الإضافة إلى السلة" : "Added to cart");
  };

  const whatsappMsg = encodeURIComponent(
    lang === "ar"
      ? `مرحباً، أريد شراء ${product.nameAr} - ${selectedSize}`
      : `Hi, I want to buy ${product.name} - ${selectedSize}`
  );

  return (
    <div className="min-h-screen pt-20 lg:pt-24">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 lg:px-8 py-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-gold transition-colors">{t("home")}</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-gold transition-colors">{t("shop")}</Link>
          <span>/</span>
          <span className="text-foreground">{lang === "ar" ? product.nameAr : product.name}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 pb-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12"
        >
          {/* Image */}
          <div className="rounded-3xl overflow-hidden bg-card border border-border/50">
            <img
              src={product.image}
              alt={lang === "ar" ? product.nameAr : product.name}
              className="w-full aspect-square object-cover hover:scale-105 transition-transform duration-700"
              width={800}
              height={800}
            />
          </div>

          {/* Info */}
          <div className="flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-gold/10 text-gold text-xs font-medium px-3 py-1 rounded-full">
                  {t(product.fragrance)}
                </span>
                <span className="bg-secondary/50 text-secondary-foreground text-xs font-medium px-3 py-1 rounded-full">
                  {t(product.category)}
                </span>
              </div>

              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
                {lang === "ar" ? product.nameAr : product.name}
              </h1>
              <p className="text-3xl font-bold text-gold mb-6">
                {formatPrice(product.price)} <span className="text-base font-normal text-muted-foreground">SYP</span>
              </p>
              <p className="text-muted-foreground leading-relaxed mb-8 text-lg">
                {lang === "ar" ? product.descriptionAr : product.description}
              </p>

              {/* Size selector */}
              <div className="mb-8">
                <p className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">{t("size")}</p>
                <div className="flex gap-3">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-6 py-3 rounded-xl border-2 text-sm font-medium transition-all duration-200 ${
                        selectedSize === size
                          ? "border-gold bg-gold text-accent-foreground shadow-gold"
                          : "border-border text-foreground hover:border-gold"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <button
                  onClick={handleAdd}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-gold text-accent-foreground px-8 py-4 rounded-xl font-semibold hover:shadow-gold-lg transition-all duration-300 text-lg"
                >
                  <ShoppingBag size={20} />
                  {t("addToCart")}
                </button>
                <a
                  href={`https://wa.me/963934436980?text=${whatsappMsg}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 border-2 border-[#25D366] text-[#25D366] px-8 py-4 rounded-xl font-semibold hover:bg-[#25D366] hover:text-white transition-all duration-300"
                >
                  <MessageCircle size={20} />
                  {t("buyWhatsApp")}
                </a>
              </div>

              {/* Trust badges */}
              <div className="flex gap-6 pt-6 border-t border-border">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Truck size={18} className="text-gold" />
                  {lang === "ar" ? "شحن سريع" : "Fast Shipping"}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield size={18} className="text-gold" />
                  {lang === "ar" ? "منتج أصلي 100%" : "100% Authentic"}
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-20">
            <h2 className="font-display text-3xl font-bold text-gradient-gold mb-10">{t("relatedProducts")}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;
