import { Link } from "react-router-dom";
import { Heart, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useProducts } from "@/hooks/useProducts";
import ProductCard from "@/components/ProductCard";
import ProductCardSkeleton from "@/components/ProductCardSkeleton";
import SEO from "@/components/SEO";

const Wishlist = () => {
  const { lang } = useLanguage();
  const { ids, clear } = useWishlist();
  const { products, loading } = useProducts();

  const items = ids.map((id) => products.find((p) => p.id === id)).filter(Boolean);

  return (
    <div className="min-h-screen pt-20 lg:pt-24">
      <SEO
        title={lang === "ar" ? "المفضلة | روح" : "Wishlist | Rouh"}
        description={lang === "ar" ? "عطورك المفضلة في مكان واحد" : "Your favorite perfumes in one place"}
        path="/wishlist"
      />
      <div className="container mx-auto px-4 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-gradient-gold mb-2">
              {lang === "ar" ? "المفضلة" : "Wishlist"}
            </h1>
            <p className="text-muted-foreground">
              {lang === "ar" ? `${items.length} منتج` : `${items.length} items`}
            </p>
          </div>
          {items.length > 0 && (
            <button onClick={clear} className="text-sm text-destructive hover:underline">
              {lang === "ar" ? "مسح الكل" : "Clear all"}
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <Heart size={64} className="text-muted-foreground/30 mx-auto mb-6" />
            <p className="text-xl text-muted-foreground mb-6">
              {lang === "ar" ? "قائمة المفضلة فارغة" : "Your wishlist is empty"}
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 bg-gradient-gold text-accent-foreground px-8 py-4 rounded-full font-semibold hover:shadow-gold-lg transition-all"
            >
              {lang === "ar" ? "تصفح المتجر" : "Browse Shop"}
              <ArrowRight size={18} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map((p) => p && <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;