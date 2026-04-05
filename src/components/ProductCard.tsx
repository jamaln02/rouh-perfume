import { Link } from "react-router-dom";
import { ShoppingBag, Eye } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { Product } from "@/data/products";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { lang, t } = useLanguage();
  const { addItem } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      id: product.id,
      name: product.name,
      nameAr: product.nameAr,
      price: product.price,
      image: product.image,
      size: product.sizes[0],
    });
    toast.success(lang === "ar" ? "تمت الإضافة إلى السلة" : "Added to cart");
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat(lang === "ar" ? "ar-SY" : "en-SY").format(price);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <Link to={`/product/${product.id}`} className="group block">
        <div className="relative overflow-hidden rounded-2xl bg-card border border-border/50 hover:border-gold/30 transition-all duration-500 hover:shadow-xl">
          <div className="relative overflow-hidden">
            <img
              src={product.image}
              alt={lang === "ar" ? product.nameAr : product.name}
              className="w-full aspect-[3/4] object-cover transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
              width={400}
              height={533}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Badges */}
            <div className="absolute top-3 start-3 flex flex-col gap-2">
              {product.isNew && (
                <span className="bg-gold text-accent-foreground text-xs font-bold px-3 py-1.5 rounded-full shadow-gold">
                  {t("newArrivals")}
                </span>
              )}
              {product.bestSeller && (
                <span className="bg-secondary text-secondary-foreground text-xs font-bold px-3 py-1.5 rounded-full">
                  {t("bestSellers")}
                </span>
              )}
            </div>

            {/* Hover actions */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
              <button
                onClick={handleAddToCart}
                className="bg-gold text-accent-foreground p-3 rounded-full hover:bg-gold-dark shadow-gold transition-colors"
                title={t("addToCart")}
              >
                <ShoppingBag size={18} />
              </button>
              <div className="bg-card/90 backdrop-blur text-foreground p-3 rounded-full shadow-lg">
                <Eye size={18} />
              </div>
            </div>
          </div>

          <div className="p-4">
            <h3 className="font-semibold text-foreground group-hover:text-gold transition-colors">
              {lang === "ar" ? product.nameAr : product.name}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {t(product.fragrance)} · {t(product.category)}
            </p>
            <p className="text-gold font-bold mt-2 text-lg">
              {formatPrice(product.price)} <span className="text-xs font-normal text-muted-foreground">SYP</span>
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
