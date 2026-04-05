import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
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
        <div className="relative overflow-hidden rounded-lg bg-card">
          <img
            src={product.image}
            alt={lang === "ar" ? product.nameAr : product.name}
            className="w-full aspect-[3/4] object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            width={400}
            height={533}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Badges */}
          <div className="absolute top-3 start-3 flex flex-col gap-1">
            {product.isNew && (
              <span className="bg-gold text-accent-foreground text-xs font-bold px-2 py-1 rounded">
                {t("newArrivals")}
              </span>
            )}
            {product.bestSeller && (
              <span className="bg-secondary text-secondary-foreground text-xs font-bold px-2 py-1 rounded">
                {t("bestSellers")}
              </span>
            )}
          </div>

          {/* Add to cart overlay */}
          <button
            onClick={handleAddToCart}
            className="absolute bottom-3 end-3 bg-gold text-accent-foreground p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-gold-dark shadow-gold"
          >
            <ShoppingBag size={18} />
          </button>
        </div>

        <div className="mt-3 px-1">
          <h3 className="font-semibold text-foreground">
            {lang === "ar" ? product.nameAr : product.name}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {t(product.fragrance)} · {t(product.category)}
          </p>
          <p className="text-gold font-bold mt-1">
            {formatPrice(product.price)} SYP
          </p>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
