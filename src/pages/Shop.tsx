import { useState, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { products } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import { Search, SlidersHorizontal } from "lucide-react";

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

  return (
    <div className="min-h-screen pt-20 lg:pt-24">
      <div className="container mx-auto px-4 lg:px-8 py-8">
        {/* Header */}
        <h1 className="text-3xl md:text-4xl font-bold text-gradient-gold mb-8">{t("shop")}</h1>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search size={18} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("search")}
              className="w-full bg-card text-foreground ps-10 pe-4 py-2.5 rounded-lg border border-border outline-none focus:ring-1 focus:ring-gold placeholder:text-muted-foreground"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="sm:hidden flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-lg text-foreground"
          >
            <SlidersHorizontal size={18} /> {t("filter")}
          </button>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="bg-card text-foreground px-4 py-2.5 rounded-lg border border-border outline-none"
          >
            <option value="newest">{t("newest")}</option>
            <option value="priceLow">{t("priceLowHigh")}</option>
            <option value="priceHigh">{t("priceHighLow")}</option>
          </select>
        </div>

        <div className="flex gap-8">
          {/* Sidebar filters - desktop */}
          <aside className={`${showFilters ? "block" : "hidden"} sm:block w-full sm:w-48 shrink-0`}>
            <div className="mb-6">
              <h3 className="font-semibold text-foreground mb-3">{t("category")}</h3>
              <div className="flex flex-col gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`text-start text-sm px-3 py-1.5 rounded transition-colors ${
                      category === cat
                        ? "bg-gold text-accent-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {cat === "all" ? t("allCategories") : t(cat)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-3">{t("fragrance") || "Fragrance"}</h3>
              <div className="flex flex-col gap-2">
                {fragrances.map((frag) => (
                  <button
                    key={frag}
                    onClick={() => setFragrance(frag)}
                    className={`text-start text-sm px-3 py-1.5 rounded transition-colors ${
                      fragrance === frag
                        ? "bg-gold text-accent-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {frag === "all" ? t("allCategories") : t(frag)}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Products grid */}
          <div className="flex-1">
            {filtered.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {filtered.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-muted-foreground">
                {lang === "ar" ? "لا توجد منتجات" : "No products found"}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;
