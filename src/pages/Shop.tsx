import { useState, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { products } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Shop = () => {
  const { t, lang } = useLanguage();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [fragrance, setFragrance] = useState("all");
  const [sort, setSort] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let result = products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.nameAr.includes(search);
      const matchesCategory = category === "all" || p.category === category;
      const matchesFragrance = fragrance === "all" || p.fragrance === fragrance;
      return matchesSearch && matchesCategory && matchesFragrance;
    });

    switch (sort) {
      case "priceLow":
        result.sort((a, b) => a.price - b.price);
        break;
      case "priceHigh":
        result.sort((a, b) => b.price - a.price);
        break;
    }

    return result;
  }, [search, category, fragrance, sort]);

  const categories = ["all", "men", "women", "unisex"];
  const fragrances = ["all", "oud", "floral", "woody", "fresh", "oriental"];

  const activeFilters = (category !== "all" ? 1 : 0) + (fragrance !== "all" ? 1 : 0);

  return (
    <div className="min-h-screen pt-20 lg:pt-24">
      <div className="container mx-auto px-4 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="font-display text-4xl md:text-5xl font-bold text-gradient-gold mb-3">{t("shop")}</h1>
          <p className="text-muted-foreground">
            {lang === "ar" ? `${filtered.length} منتج` : `${filtered.length} products`}
          </p>
        </motion.div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search size={18} className="absolute start-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("search")}
              className="w-full bg-card text-foreground ps-11 pe-4 py-3 rounded-xl border border-border outline-none focus:ring-2 focus:ring-gold placeholder:text-muted-foreground transition-shadow"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="sm:hidden flex items-center gap-2 px-4 py-3 bg-card border border-border rounded-xl text-foreground relative"
          >
            <SlidersHorizontal size={18} /> {t("filter")}
            {activeFilters > 0 && (
              <span className="absolute -top-1.5 -end-1.5 w-5 h-5 bg-gold text-accent-foreground text-xs rounded-full flex items-center justify-center font-bold">
                {activeFilters}
              </span>
            )}
          </button>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="bg-card text-foreground px-4 py-3 rounded-xl border border-border outline-none focus:ring-2 focus:ring-gold"
          >
            <option value="newest">{t("newest")}</option>
            <option value="priceLow">{t("priceLowHigh")}</option>
            <option value="priceHigh">{t("priceHighLow")}</option>
          </select>
        </div>

        <div className="flex gap-8">
          {/* Sidebar filters */}
          <aside className={`${showFilters ? "block" : "hidden"} sm:block w-full sm:w-52 shrink-0`}>
            <div className="sticky top-28 space-y-8">
              <div>
                <h3 className="font-semibold text-foreground mb-4 text-sm tracking-wider uppercase">{t("category")}</h3>
                <div className="flex flex-col gap-1">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`text-start text-sm px-4 py-2.5 rounded-xl transition-all duration-200 ${
                        category === cat
                          ? "bg-gold text-accent-foreground font-medium shadow-gold"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      {cat === "all" ? t("allCategories") : t(cat)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-4 text-sm tracking-wider uppercase">{t("fragrance") || "Fragrance"}</h3>
                <div className="flex flex-col gap-1">
                  {fragrances.map((frag) => (
                    <button
                      key={frag}
                      onClick={() => setFragrance(frag)}
                      className={`text-start text-sm px-4 py-2.5 rounded-xl transition-all duration-200 ${
                        fragrance === frag
                          ? "bg-gold text-accent-foreground font-medium shadow-gold"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      {frag === "all" ? t("allCategories") : t(frag)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear filters */}
              {activeFilters > 0 && (
                <button
                  onClick={() => { setCategory("all"); setFragrance("all"); }}
                  className="flex items-center gap-2 text-sm text-destructive hover:underline"
                >
                  <X size={14} />
                  {lang === "ar" ? "مسح الفلاتر" : "Clear filters"}
                </button>
              )}
            </div>
          </aside>

          {/* Products grid */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              {filtered.length > 0 ? (
                <motion.div
                  key={`${category}-${fragrance}-${sort}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-2 md:grid-cols-3 gap-6"
                >
                  {filtered.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-20 text-muted-foreground"
                >
                  <p className="text-lg">{lang === "ar" ? "لا توجد منتجات" : "No products found"}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;
