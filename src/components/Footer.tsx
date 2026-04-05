import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Phone, Mail, MapPin } from "lucide-react";

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-secondary border-t border-gold/10">
      <div className="container mx-auto px-4 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold text-gradient-gold mb-4">{t("brand")}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {t("aboutText")}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-gold font-semibold mb-4">{t("shop")}</h4>
            <div className="flex flex-col gap-2">
              <Link to="/shop" className="text-muted-foreground hover:text-gold text-sm transition-colors">{t("shop")}</Link>
              <Link to="/about" className="text-muted-foreground hover:text-gold text-sm transition-colors">{t("about")}</Link>
              <Link to="/contact" className="text-muted-foreground hover:text-gold text-sm transition-colors">{t("contact")}</Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-gold font-semibold mb-4">{t("contact")}</h4>
            <div className="flex flex-col gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-gold" />
                <span dir="ltr">+963 9XX XXX XXXX</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-gold" />
                <span>info@rouh.sy</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-gold" />
                <span>{t("address")}: Damascus, Syria</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gold/10 text-center text-sm text-muted-foreground">
          © 2026 {t("brand")}. {t("rights")}.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
