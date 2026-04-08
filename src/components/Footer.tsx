import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";

const Footer = () => {
  const { t, lang } = useLanguage();

  return (
    <footer className="bg-gradient-burgundy border-t border-gold/10">
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <h3 className="font-display text-3xl font-bold text-gradient-gold mb-4">{t("brand")}</h3>
            <p className="text-cream/50 text-sm leading-relaxed mb-6">
              {t("aboutText")}
            </p>
            <a
              href="https://wa.me/963933898625"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[#25D366] hover:underline text-sm"
            >
              <MessageCircle size={16} />
              {lang === "ar" ? "تواصل عبر واتساب" : "Chat on WhatsApp"}
            </a>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-gold font-semibold mb-5 text-sm tracking-wider uppercase">
              {lang === "ar" ? "روابط سريعة" : "Quick Links"}
            </h4>
            <div className="flex flex-col gap-3">
              {[
                { to: "/shop", label: t("shop") },
                { to: "/about", label: t("about") },
                { to: "/contact", label: t("contact") },
                { to: "/cart", label: t("cart") },
              ].map((link) => (
                <Link key={link.to} to={link.to} className="text-cream/50 hover:text-gold text-sm transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-gold font-semibold mb-5 text-sm tracking-wider uppercase">
              {t("collections")}
            </h4>
            <div className="flex flex-col gap-3">
              {["men", "women", "unisex"].map((cat) => (
                <Link key={cat} to={`/shop?category=${cat}`} className="text-cream/50 hover:text-gold text-sm transition-colors">
                  {t(cat)}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-gold font-semibold mb-5 text-sm tracking-wider uppercase">
              {t("contact")}
            </h4>
            <div className="flex flex-col gap-4 text-sm text-cream/50">
              <a href="tel:+963933898625" className="flex items-center gap-3 hover:text-gold transition-colors">
                <Phone size={16} className="text-gold shrink-0" />
                <span dir="ltr">+963 933 898 625</span>
              </a>
              <a href="mailto:info@rouh.sy" className="flex items-center gap-3 hover:text-gold transition-colors">
                <Mail size={16} className="text-gold shrink-0" />
                <span>info@rouh.sy</span>
              </a>
              <a href="https://maps.google.com/?q=Damascus,Syria" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-gold transition-colors">
                <MapPin size={16} className="text-gold shrink-0" />
                <span>{lang === "ar" ? "دمشق، سوريا" : "Damascus, Syria"}</span>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-cream/10 text-center text-sm text-cream/30">
          © 2026 {t("brand")}. {t("rights")}.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
