import { useLanguage } from "@/contexts/LanguageContext";
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";

interface Props {
  stock: number;
  lowThreshold?: number;
  size?: "sm" | "md";
}

const StockIndicator = ({ stock, lowThreshold = 5, size = "md" }: Props) => {
  const { lang, t } = useLanguage();
  const cls = size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1";

  if (stock <= 0) {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full bg-destructive/10 text-destructive font-medium ${cls}`}>
        <XCircle size={size === "sm" ? 12 : 14} /> {t("outOfStock")}
      </span>
    );
  }
  if (stock <= lowThreshold) {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 text-amber-600 font-medium ${cls}`}>
        <AlertCircle size={size === "sm" ? 12 : 14} />
        {lang === "ar" ? `${t("onlyXLeft")} ${stock}` : `Only ${stock} left`}
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full bg-green-500/10 text-green-600 font-medium ${cls}`}>
      <CheckCircle2 size={size === "sm" ? 12 : 14} /> {t("inStock")}
    </span>
  );
};

export default StockIndicator;