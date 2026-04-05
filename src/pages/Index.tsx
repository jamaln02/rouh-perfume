import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { products } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import heroImage from "@/assets/hero-perfume.jpg";
import { motion } from "framer-motion";
import { Truck, Shield, Headphones, ArrowRight, Sparkles, Star } from "lucide-react";

const Index = () => {
  const { t, lang } = useLanguage();

  const featured = products.filter((p) => p.featured);
  const bestSellers = products.filter((p) => p.bestSeller);

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
    }),
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative h-screen flex items-center overflow-hidden">
        <motion.img
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          src={heroImage}
          alt="Rouh Perfumes"
          className="absolute inset-0 w-full h-full object-cover"
          width={1920}
          height={1080}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/85 via-foreground/60 to-foreground/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 to-transparent" />

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-2xl"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex items-center gap-2 mb-6"
            >
              <Sparkles size={16} className="text-gold" />
              <span className="text-gold text-sm font-medium tracking-widest uppercase">
                {lang === "ar" ? "عطور فاخرة" : "Luxury Perfumes"}
              </span>
            </motion.div>
            <h1 className="font-display text-5xl md:text-7xl font-bold text-cream leading-[1.1] mb-6 text-balance">
              {t("heroTitle")}
            </h1>
            <p className="text-lg md:text-xl text-cream/70 mb-10 max-w-lg leading-relaxed">
              {t("heroSubtitle")}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/shop"
                className="group inline-flex items-center gap-3 bg-gradient-gold text-accent-foreground px-8 py-4 rounded-full font-semibold hover:shadow-gold-lg transition-all duration-300 text-lg"
              >
                {t("shopNow")}
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 border border-cream/30 text-cream px-8 py-4 rounded-full font-medium hover:bg-cream/10 transition-all duration-300"
              >
                {t("ourStory")}
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-cream/40 text-xs tracking-widest uppercase">
            {lang === "ar" ? "اكتشف المزيد" : "Scroll"}
          </span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-5 h-8 rounded-full border-2 border-cream/30 flex justify-center pt-1"
          >
            <div className="w-1 h-2 rounded-full bg-gold" />
          </motion.div>
        </motion.div>
      </section>

      {/* Features bar */}
      <section className="relative -mt-16 z-20 pb-8">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="glass rounded-2xl border border-border/50 shadow-xl p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: Truck, title: t("freeShipping"), desc: t("freeShippingDesc") },
                { icon: Shield, title: t("premiumQuality"), desc: t("premiumQualityDesc") },
                { icon: Headphones, title: t("support"), desc: t("supportDesc") },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  className="flex items-center gap-4 justify-center md:justify-start"
                >
                  <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center shrink-0">
                    <item.icon className="text-gold" size={24} />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <span className="text-gold text-sm font-medium tracking-widest uppercase mb-3 block">
              {lang === "ar" ? "مجموعة مختارة" : "Curated Selection"}
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-gradient-gold">{t("featured")}</h2>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Promo Banner */}
      <section className="py-20 bg-gradient-burgundy relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-gold rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-gold rounded-full blur-[120px]" />
        </div>
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <Sparkles className="text-gold mx-auto mb-6" size={32} />
            <h2 className="font-display text-3xl md:text-5xl font-bold text-cream mb-6 text-balance">
              {lang === "ar"
                ? "اكتشف سحر العطور الشرقية الأصيلة"
                : "Discover the Magic of Authentic Oriental Fragrances"}
            </h2>
            <p className="text-cream/60 text-lg mb-10 max-w-xl mx-auto">
              {lang === "ar"
                ? "مكونات طبيعية فاخرة من أجود المصادر العالمية"
                : "Premium natural ingredients sourced from the finest global origins"}
            </p>
            <Link
              to="/shop"
              className="group inline-flex items-center gap-3 bg-gradient-gold text-accent-foreground px-8 py-4 rounded-full font-semibold hover:shadow-gold-lg transition-all duration-300"
            >
              {t("exploreCollection")}
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <span className="text-gold text-sm font-medium tracking-widest uppercase mb-3 block">
              {lang === "ar" ? "الأعلى تقييماً" : "Top Rated"}
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-gradient-gold">{t("bestSellers")}</h2>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 lg:gap-8">
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              to="/shop"
              className="group inline-flex items-center gap-3 border-2 border-gold text-gold px-8 py-4 rounded-full font-semibold hover:bg-gold hover:text-accent-foreground transition-all duration-300"
            >
              {t("shopNow")}
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="font-display text-4xl md:text-5xl font-bold text-gradient-gold">
              {lang === "ar" ? "آراء العملاء" : "What Our Clients Say"}
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                nameAr: "أحمد محمد",
                nameEn: "Ahmad M.",
                textAr: "عطر العنبر الملكي رائع جداً، ثباته ممتاز ورائحته فخمة. أنصح به بشدة!",
                textEn: "Royal Amber is absolutely stunning. Long lasting and luxurious scent. Highly recommended!",
              },
              {
                nameAr: "سارة علي",
                nameEn: "Sarah A.",
                textAr: "الوردة الأبدية أصبح عطري المفضل، رائحة أنثوية راقية تدوم طوال اليوم.",
                textEn: "Rose Éternelle has become my favorite. An elegant feminine scent that lasts all day.",
              },
              {
                nameAr: "عمر حسن",
                nameEn: "Omar H.",
                textAr: "جودة عالية وأسعار منافسة. خدمة التوصيل سريعة والتغليف أنيق جداً.",
                textEn: "High quality at competitive prices. Fast delivery and very elegant packaging.",
              },
            ].map((review, i) => (
              <motion.div
                key={i}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="bg-card border border-border rounded-2xl p-8 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={16} className="fill-gold text-gold" />
                  ))}
                </div>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  "{lang === "ar" ? review.textAr : review.textEn}"
                </p>
                <p className="font-semibold text-foreground">
                  {lang === "ar" ? review.nameAr : review.nameEn}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-burgundy rounded-3xl p-10 md:p-16 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-10 left-10 w-64 h-64 bg-gold rounded-full blur-[100px]" />
              <div className="absolute bottom-10 right-10 w-64 h-64 bg-gold rounded-full blur-[100px]" />
            </div>
            <div className="relative z-10">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-cream mb-4">
                {lang === "ar" ? "انضم إلى عائلة روح" : "Join the Rouh Family"}
              </h2>
              <p className="text-cream/60 mb-8 max-w-md mx-auto">
                {lang === "ar"
                  ? "اشترك ليصلك كل جديد من العروض والمنتجات الحصرية"
                  : "Subscribe to get exclusive offers and new product updates"}
              </p>
              <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
                <input
                  type="email"
                  placeholder={lang === "ar" ? "بريدك الإلكتروني" : "Your email"}
                  className="flex-1 bg-cream/10 border border-cream/20 text-cream px-5 py-3 rounded-full outline-none focus:ring-2 focus:ring-gold placeholder:text-cream/40"
                />
                <button
                  type="submit"
                  className="bg-gradient-gold text-accent-foreground px-8 py-3 rounded-full font-semibold hover:shadow-gold-lg transition-all duration-300"
                >
                  {lang === "ar" ? "اشتراك" : "Subscribe"}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Index;
