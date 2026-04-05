import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { getProduct, products } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import { ShoppingBag, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const ProductDetails = () => {
  const { id } = useParams();
  const { t, lang } = useLanguage();
  const { addItem } = useCart();
  const product = getProduct(id || "");
  const [selectedSize, setSelectedSize] = useState(product?.sizes[0] || "");

  if (!product) {
    return (
      <div className="min-h-screen pt-24 text-center text-muted-foreground">
        {lang === "ar" ? "المنتج غير موجود" : "Product not found"}
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
      <div className="container mx-auto px-4 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-10"
        >
          {/* Image */}
          <div className="rounded-xl overflow-hidden bg-card">
            <img
              src={product.image}
              alt={lang === "ar" ? product.nameAr : product.name}
              className="w-full aspect-square object-cover"
              width={800}
              height={800}
            />
          </div>

          {/* Info */}
          <div className="flex flex-col justify-center">
            <p className="text-sm text-gold mb-2">
              {t(product.fragrance)} · {t(product.category)}
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              {lang === "ar" ? product.nameAr : product.name}
            </h1>
            <p className="text-2xl font-bold text-gold mb-6">
              {formatPrice(product.price)} SYP
            </p>
            <p className="text-muted-foreground leading-relaxed mb-8">
              {lang === "ar" ? product.descriptionAr : product.description}
            </p>

            {/* Size selector */}
            <div className="mb-6">
              <p className="text-sm font-semibold text-foreground mb-2">{t("size")}</p>
              <div className="flex gap-3">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      selectedSize === size
                        ? "border-gold bg-gold text-accent-foreground"
                        : "border-border text-foreground hover:border-gold"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAdd}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-gold text-accent-foreground px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity shadow-gold"
              >
                <ShoppingBag size={18} />
                {t("addToCart")}
              </button>
              <a
                href={`https://wa.me/963900000000?text=${whatsappMsg}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 border border-[#25D366] text-[#25D366] px-6 py-3 rounded-lg font-semibold hover:bg-[#25D366] hover:text-accent-foreground transition-colors"
              >
                <MessageCircle size={18} />
                {t("buyWhatsApp")}
              </a>
            </div>
          </div>
        </motion.div>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold text-gradient-gold mb-8">{t("relatedProducts")}</h2>
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
