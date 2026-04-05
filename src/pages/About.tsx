import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import heroImage from "@/assets/hero-perfume.jpg";

const About = () => {
  const { t, lang } = useLanguage();

  const sections = [
    {
      title: t("ourStory"),
      textAr: "تأسست روح في قلب دمشق، مستوحاة من التراث العريق للعطور الشرقية. نحن نجمع بين الأصالة والحداثة لنقدم عطوراً تعكس الروح الحقيقية لكل شخص.",
      textEn: "Rouh was founded in the heart of Damascus, inspired by the rich heritage of oriental perfumery. We blend tradition with modernity to create fragrances that reflect the true spirit of every individual.",
    },
    {
      title: t("ourVision"),
      textAr: "أن نكون العلامة التجارية الرائدة في صناعة العطور السورية والعربية، ونقدم للعالم عطوراً تحكي قصة الشرق بأسلوب عصري.",
      textEn: "To be the leading brand in Syrian and Arab perfumery, bringing the story of the Orient to the world through contemporary fragrances.",
    },
    {
      title: t("ourMission"),
      textAr: "نلتزم باستخدام أجود المكونات الطبيعية وأحدث تقنيات التصنيع لإنتاج عطور فاخرة بأسعار عادلة، مع الحفاظ على التراث العطري السوري.",
      textEn: "We are committed to using the finest natural ingredients and latest manufacturing techniques to produce luxury fragrances at fair prices, while preserving Syrian perfumery heritage.",
    },
  ];

  return (
    <div className="min-h-screen pt-20 lg:pt-24">
      {/* Hero */}
      <div className="relative h-64 md:h-80">
        <img src={heroImage} alt="About Rouh" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-foreground/60 flex items-center justify-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gradient-gold">{t("aboutTitle")}</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="max-w-3xl mx-auto space-y-12">
          {sections.map((section, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
            >
              <h2 className="text-2xl font-bold text-gold mb-4">{section.title}</h2>
              <p className="text-muted-foreground leading-relaxed text-lg">
                {lang === "ar" ? section.textAr : section.textEn}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default About;
