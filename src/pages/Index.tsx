import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { products } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import heroImage from "@/assets/hero-perfume.jpg";
import { motion } from "framer-motion";
import { Truck, Shield, Headphones } from "lucide-react";

const Index = () => {
  const { t, lang } = useLanguage();

  const featured = products.filter((p) => p.featured);
  const bestSellers = products.filter((p) => p.bestSeller);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative h-[90vh] flex items-center">
        <img
          src={heroImage}
          alt="Rouh Perfumes"
          className="absolute inset-0 w-full h-full object-cover"
          width={1920}
          height={1080}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/50 to-transparent" />
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-xl"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-cream leading-tight mb-4">
              {t("heroTitle")}
            </h1>
            <p className="text-lg text-cream/80 mb-8">{t("heroSubtitle")}</p>
            <Link
              to="/shop"
              className="inline-block bg-gradient-gold text-accent-foreground px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity shadow-gold"
            >
              {t("shopNow")}
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features bar */}
      <section className="bg-secondary py-6 border-y border-gold/10">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Truck, title: t("freeShipping"), desc: t("freeShippingDesc") },
              { icon: Shield, title: t("premiumQuality"), desc: t("premiumQualityDesc") },
              { icon: Headphones, title: t("support"), desc: t("supportDesc") },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 justify-center text-center md:text-start md:justify-start">
                <item.icon className="text-gold shrink-0" size={28} />
                <div>
                  <p className="font-semibold text-secondary-foreground text-sm">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gradient-gold">{t("featured")}</h2>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="py-16 bg-secondary/50">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gradient-gold">{t("bestSellers")}</h2>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              to="/shop"
              className="inline-block border border-gold text-gold px-8 py-3 rounded-lg font-semibold hover:bg-gold hover:text-accent-foreground transition-colors"
            >
              {t("shopNow")}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
