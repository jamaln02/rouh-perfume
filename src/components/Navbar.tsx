import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ShoppingBag, Menu, X, Globe, Search, User, Shield, ChevronDown } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const { t, lang, setLang } = useLanguage();
  const { totalItems } = useCart();
  const { user, isAdmin, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  const links = [
    { to: "/", label: t("home") },
    { to: "/shop", label: t("shop") },
    { to: "/about", label: t("about") },
    { to: "/contact", label: t("contact") },
  ];

  const isHome = location.pathname === "/";
  const navBg = scrolled || !isHome
    ? "bg-secondary/98 backdrop-blur-2xl border-b border-primary/5 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.15)]"
    : "bg-transparent";

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${navBg}`}>
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden text-secondary-foreground hover:text-primary transition-colors p-1"
            aria-label="Menu"
          >
            <AnimatePresence mode="wait">
              {mobileOpen ? (
                <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <X size={22} />
                </motion.div>
              ) : (
                <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <Menu size={22} />
                </motion.div>
              )}
            </AnimatePresence>
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl lg:text-3xl font-bold text-gradient-gold font-display tracking-wider">
              {t("brand")}
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                  location.pathname === link.to
                    ? "text-primary"
                    : "text-secondary-foreground hover:text-primary hover:bg-primary/5"
                }`}
              >
                {link.label}
                {location.pathname === link.to && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 lg:gap-2">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 rounded-lg text-secondary-foreground hover:text-primary hover:bg-primary/5 transition-all duration-200"
              aria-label="Search"
            >
              <Search size={18} />
            </button>

            <button
              onClick={() => setLang(lang === "ar" ? "en" : "ar")}
              className="p-2 rounded-lg text-secondary-foreground hover:text-primary hover:bg-primary/5 transition-all duration-200 flex items-center gap-1"
              aria-label="Language"
            >
              <Globe size={18} />
              <span className="hidden sm:inline text-xs font-semibold">{lang === "ar" ? "EN" : "عربي"}</span>
            </button>

            {isAdmin && (
              <Link
                to="/admin"
                className="p-2 rounded-lg text-secondary-foreground hover:text-primary hover:bg-primary/5 transition-all duration-200"
                aria-label="Admin"
              >
                <Shield size={18} />
              </Link>
            )}

            {user ? (
              <button
                onClick={signOut}
                className="p-2 rounded-lg text-secondary-foreground hover:text-primary hover:bg-primary/5 transition-all duration-200"
                aria-label="Sign Out"
              >
                <User size={18} />
              </button>
            ) : (
              <Link
                to="/auth"
                className="p-2 rounded-lg text-secondary-foreground hover:text-primary hover:bg-primary/5 transition-all duration-200"
                aria-label="Sign In"
              >
                <User size={18} />
              </Link>
            )}

            <Link to="/cart" className="relative p-2 rounded-lg text-secondary-foreground hover:text-primary hover:bg-primary/5 transition-all duration-200">
              <ShoppingBag size={18} />
              {totalItems > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[10px] w-4.5 h-4.5 min-w-[18px] min-h-[18px] rounded-full flex items-center justify-center font-bold leading-none"
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
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden bg-secondary/98 backdrop-blur-2xl border-t border-primary/5"
          >
            <div className="container mx-auto px-4 py-4">
              <div className="relative max-w-xl mx-auto">
                <Search size={18} className="absolute start-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={t("search")}
                  className="w-full bg-muted text-foreground ps-11 pe-5 py-3 rounded-xl outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground transition-shadow"
                  autoFocus
                />
              </div>
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
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="lg:hidden overflow-hidden bg-secondary/98 backdrop-blur-2xl border-t border-primary/5"
          >
            <div className="container mx-auto px-4 py-5 flex flex-col gap-1">
              {links.map((link, i) => (
                <motion.div
                  key={link.to}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className={`block text-base font-medium py-3 px-4 rounded-xl transition-all duration-200 ${
                      location.pathname === link.to
                        ? "text-primary bg-primary/5"
                        : "text-secondary-foreground hover:text-primary hover:bg-primary/5"
                    }`}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
