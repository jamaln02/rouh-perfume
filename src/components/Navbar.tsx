import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ShoppingBag, Menu, X, Globe, Search } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const { t, lang, setLang } = useLanguage();
  const { totalItems } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { to: "/", label: t("home") },
    { to: "/shop", label: t("shop") },
    { to: "/about", label: t("about") },
    { to: "/contact", label: t("contact") },
  ];

  const isHome = location.pathname === "/";
  const navBg = scrolled || !isHome
    ? "bg-secondary/95 backdrop-blur-xl border-b border-gold/10 shadow-lg"
    : "bg-transparent";

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${navBg}`}>
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-18 lg:h-22">
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden text-secondary-foreground hover:text-gold transition-colors"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Logo */}
          <Link to="/" className="text-2xl lg:text-3xl font-bold text-gradient-gold font-display tracking-wide">
            {t("brand")}
          </Link>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-10">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`relative text-sm font-medium transition-colors hover:text-gold ${
                  location.pathname === link.to ? "text-gold" : "text-secondary-foreground"
                }`}
              >
                {link.label}
                {location.pathname === link.to && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gold rounded-full"
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="text-secondary-foreground hover:text-gold transition-colors"
            >
              <Search size={20} />
            </button>
            <button
              onClick={() => setLang(lang === "ar" ? "en" : "ar")}
              className="text-secondary-foreground hover:text-gold transition-colors flex items-center gap-1.5 text-sm"
            >
              <Globe size={18} />
              <span className="hidden sm:inline font-medium">{lang === "ar" ? "EN" : "عربي"}</span>
            </button>
            <Link to="/cart" className="relative text-secondary-foreground hover:text-gold transition-colors">
              <ShoppingBag size={20} />
              {totalItems > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 bg-gold text-accent-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold"
                >
                  {totalItems}
                </motion.span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Search bar */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-secondary/95 backdrop-blur-xl border-t border-gold/10"
          >
            <div className="container mx-auto px-4 py-4">
              <input
                type="text"
                placeholder={t("search")}
                className="w-full bg-muted text-foreground px-5 py-3 rounded-xl outline-none focus:ring-2 focus:ring-gold placeholder:text-muted-foreground transition-shadow"
                autoFocus
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden overflow-hidden bg-secondary/95 backdrop-blur-xl border-t border-gold/10"
          >
            <div className="container mx-auto px-4 py-6 flex flex-col gap-4">
              {links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`text-lg font-medium transition-colors py-1 ${
                    location.pathname === link.to ? "text-gold" : "text-secondary-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
