import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Phone, Mail, MapPin } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const Contact = () => {
  const { t, lang } = useLanguage();
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error(lang === "ar" ? "يرجى ملء جميع الحقول" : "Please fill all fields");
      return;
    }
    toast.success(lang === "ar" ? "تم إرسال رسالتك بنجاح!" : "Message sent successfully!");
    setForm({ name: "", email: "", message: "" });
  };

  const inputClass = "w-full bg-card text-foreground px-4 py-2.5 rounded-lg border border-border outline-none focus:ring-1 focus:ring-gold placeholder:text-muted-foreground";

  return (
    <div className="min-h-screen pt-20 lg:pt-24">
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-3xl md:text-4xl font-bold text-gradient-gold mb-12 text-center"
        >
          {t("contactTitle")}
        </motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Contact info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <p className="text-muted-foreground leading-relaxed">
              {lang === "ar"
                ? "نحن هنا لمساعدتك. لا تتردد في التواصل معنا لأي استفسار أو طلب."
                : "We're here to help. Don't hesitate to reach out for any questions or requests."}
            </p>
            <div className="space-y-6">
              {[
                { icon: Phone, label: t("phone"), value: "+963 9XX XXX XXXX" },
                { icon: Mail, label: t("email"), value: "info@rouh.sy" },
                { icon: MapPin, label: t("address"), value: lang === "ar" ? "دمشق، سوريا" : "Damascus, Syria" },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center shrink-0">
                    <item.icon size={20} className="text-gold" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                    <p className="font-medium text-foreground" dir="ltr">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <input
              type="text"
              placeholder={t("name")}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputClass}
            />
            <input
              type="email"
              placeholder={t("email")}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={inputClass}
            />
            <textarea
              placeholder={t("message")}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className={`${inputClass} h-32 resize-none`}
            />
            <button
              type="submit"
              className="w-full bg-gradient-gold text-accent-foreground py-3 rounded-lg font-semibold shadow-gold hover:opacity-90 transition-opacity"
            >
              {t("send")}
            </button>
          </motion.form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
