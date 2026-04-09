import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { perfumes } from "@/data/perfumes";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Gift, ArrowRight, ArrowLeft, Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface Question {
  ar: string;
  en: string;
  tag: string; // personality tag this maps to
  options: { ar: string; en: string; value: string }[];
}

const questions: Question[] = [
  {
    ar: "كيف تصف شخصيتك؟",
    en: "How would you describe your personality?",
    tag: "personality",
    options: [
      { ar: "جريء ومغامر", en: "Bold & Adventurous", value: "bold" },
      { ar: "أنيق وكلاسيكي", en: "Elegant & Classic", value: "elegant" },
      { ar: "رومانسي وحساس", en: "Romantic & Sensitive", value: "romantic" },
      { ar: "غامض ومثير", en: "Mysterious & Intriguing", value: "mysterious" },
    ],
  },
  {
    ar: "ما هو موسمك المفضل؟",
    en: "What is your favorite season?",
    tag: "season",
    options: [
      { ar: "الصيف - أحب الطاقة والحيوية", en: "Summer - I love energy & vibrancy", value: "fresh" },
      { ar: "الشتاء - أحب الدفء والغموض", en: "Winter - I love warmth & mystery", value: "mysterious" },
      { ar: "الربيع - أحب التجدد والرومانسية", en: "Spring - I love renewal & romance", value: "romantic" },
      { ar: "الخريف - أحب الأناقة والهدوء", en: "Autumn - I love elegance & calm", value: "elegant" },
    ],
  },
  {
    ar: "ما الانطباع الذي تريد تركه؟",
    en: "What impression do you want to leave?",
    tag: "impression",
    options: [
      { ar: "القوة والثقة", en: "Power & Confidence", value: "bold" },
      { ar: "الفخامة والرقي", en: "Luxury & Sophistication", value: "luxurious" },
      { ar: "الانتعاش والنشاط", en: "Freshness & Energy", value: "fresh" },
      { ar: "الجاذبية والإغراء", en: "Attraction & Seduction", value: "romantic" },
    ],
  },
  {
    ar: "أي من هذه الروائح تفضل؟",
    en: "Which of these scents do you prefer?",
    tag: "scent",
    options: [
      { ar: "العود والبخور", en: "Oud & Incense", value: "classic" },
      { ar: "الأزهار والمسك", en: "Flowers & Musk", value: "romantic" },
      { ar: "الحمضيات والنعناع", en: "Citrus & Mint", value: "fresh" },
      { ar: "الفانيلا والتوابل", en: "Vanilla & Spices", value: "luxurious" },
    ],
  },
  {
    ar: "متى تستخدم العطر عادة؟",
    en: "When do you usually wear perfume?",
    tag: "occasion",
    options: [
      { ar: "يومياً للعمل", en: "Daily for work", value: "classic" },
      { ar: "المناسبات الخاصة", en: "Special occasions", value: "luxurious" },
      { ar: "السهرات والحفلات", en: "Evenings & parties", value: "bold" },
      { ar: "الرياضة والنشاطات", en: "Sports & activities", value: "sporty" },
    ],
  },
];

const Quiz = () => {
  const { lang } = useLanguage();
  const [step, setStep] = useState(0); // 0 = intro, 1-5 = questions, 6 = phone, 7 = result
  const [answers, setAnswers] = useState<string[]>([]);
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    perfume: typeof perfumes[0];
    code: string;
  } | null>(null);
  const [alreadyUsed, setAlreadyUsed] = useState(false);

  const getRecommendation = () => {
    // Count personality tags from answers
    const tagCounts: Record<string, number> = {};
    answers.forEach((a) => {
      tagCounts[a] = (tagCounts[a] || 0) + 1;
    });

    // Sort by frequency
    const sorted = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]);
    const topTags = sorted.slice(0, 2).map(([tag]) => tag);

    // Find best matching perfume
    let bestMatch = perfumes[0];
    let bestScore = 0;

    for (const p of perfumes) {
      let score = 0;
      for (const tag of topTags) {
        if (p.personality.includes(tag)) score += 2;
      }
      // Add some randomness to avoid always same result
      score += Math.random() * 0.5;
      if (score > bestScore) {
        bestScore = score;
        bestMatch = p;
      }
    }

    return bestMatch;
  };

  const generateCode = () => {
    const chars = "ROUH" + Math.random().toString(36).substring(2, 6).toUpperCase();
    return chars;
  };

  const handleAnswer = (value: string) => {
    const newAnswers = [...answers, value];
    setAnswers(newAnswers);
    setStep(step + 1);
  };

  const handleSubmitPhone = async () => {
    if (!phone || phone.length < 9) {
      toast.error(lang === "ar" ? "يرجى إدخال رقم هاتف صحيح" : "Please enter a valid phone number");
      return;
    }

    setLoading(true);
    try {
      // Check if phone already used
      const { data: existing } = await supabase
        .from("quiz_discounts")
        .select("*")
        .eq("phone", phone)
        .maybeSingle();

      if (existing) {
        setAlreadyUsed(true);
        setResult({
          perfume: perfumes.find((p) => p.name === existing.recommended_product) || perfumes[0],
          code: existing.discount_code,
        });
        setStep(7);
        setLoading(false);
        return;
      }

      const perfume = getRecommendation();
      const code = generateCode();

      const { error } = await supabase.from("quiz_discounts").insert({
        phone,
        discount_code: code,
        recommended_product: perfume.name,
        recommended_product_ar: perfume.nameAr,
      });

      if (error) throw error;

      setResult({ perfume, code });
      setStep(7);
    } catch (err) {
      console.error(err);
      toast.error(lang === "ar" ? "حدث خطأ، حاول مرة أخرى" : "An error occurred, please try again");
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    if (result) {
      navigator.clipboard.writeText(result.code);
      toast.success(lang === "ar" ? "تم نسخ الكود!" : "Code copied!");
    }
  };

  const currentQuestion = step >= 1 && step <= 5 ? questions[step - 1] : null;
  const progress = step <= 5 ? (step / 6) * 100 : 100;

  return (
    <div className="min-h-screen pt-20 pb-12 bg-gradient-to-b from-background via-background to-card/50">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Progress bar */}
        {step > 0 && step <= 6 && (
          <div className="mb-8">
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-gold rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              {step <= 5 ? `${step}/5` : ""}
            </p>
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* Intro */}
          {step === 0 && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-12"
            >
              <div className="w-20 h-20 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-6">
                <Sparkles className="text-gold" size={36} />
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-gradient-gold mb-4">
                {lang === "ar" ? "اكتشف عطرك المثالي" : "Find Your Perfect Scent"}
              </h1>
              <p className="text-muted-foreground text-lg mb-4 max-w-md mx-auto">
                {lang === "ar"
                  ? "أجب على 5 أسئلة بسيطة واحصل على توصية عطر مخصصة لشخصيتك"
                  : "Answer 5 simple questions and get a personalized perfume recommendation"}
              </p>
              <div className="bg-gold/10 border border-gold/20 rounded-xl p-4 mb-8 inline-block">
                <div className="flex items-center gap-2 text-gold">
                  <Gift size={20} />
                  <span className="font-bold">
                    {lang === "ar" ? "احصل على خصم 10% كمكافأة!" : "Get 10% off as a reward!"}
                  </span>
                </div>
              </div>
              <div>
                <button
                  onClick={() => setStep(1)}
                  className="group inline-flex items-center gap-3 bg-gradient-gold text-accent-foreground px-10 py-4 rounded-full font-bold text-lg hover:shadow-gold-lg transition-all duration-300"
                >
                  {lang === "ar" ? "ابدأ الاختبار" : "Start Quiz"}
                  <ArrowLeft size={20} className={`group-hover:-translate-x-1 transition-transform ${lang === "en" ? "hidden" : ""}`} />
                  <ArrowRight size={20} className={`group-hover:translate-x-1 transition-transform ${lang === "ar" ? "hidden" : ""}`} />
                </button>
              </div>
            </motion.div>
          )}

          {/* Questions */}
          {currentQuestion && (
            <motion.div
              key={`q-${step}`}
              initial={{ opacity: 0, x: lang === "ar" ? -50 : 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: lang === "ar" ? 50 : -50 }}
              transition={{ duration: 0.4 }}
              className="py-8"
            >
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
                {lang === "ar" ? currentQuestion.ar : currentQuestion.en}
              </h2>
              <div className="grid gap-4">
                {currentQuestion.options.map((opt, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => handleAnswer(opt.value)}
                    className="w-full bg-card border border-border rounded-xl p-5 text-start hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 group"
                  >
                    <span className="text-lg font-medium text-foreground group-hover:text-primary transition-colors">
                      {lang === "ar" ? opt.ar : opt.en}
                    </span>
                  </motion.button>
                ))}
              </div>
              {step > 1 && (
                <button
                  onClick={() => {
                    setStep(step - 1);
                    setAnswers(answers.slice(0, -1));
                  }}
                  className="mt-6 text-muted-foreground hover:text-foreground flex items-center gap-2 mx-auto transition-colors"
                >
                  {lang === "ar" ? (
                    <>السؤال السابق <ArrowRight size={16} /></>
                  ) : (
                    <><ArrowLeft size={16} /> Previous question</>
                  )}
                </button>
              )}
            </motion.div>
          )}

          {/* Phone input */}
          {step === 6 && (
            <motion.div
              key="phone"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="py-12 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-6">
                <Gift className="text-gold" size={28} />
              </div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">
                {lang === "ar" ? "أدخل رقم هاتفك للحصول على الخصم" : "Enter your phone for the discount"}
              </h2>
              <p className="text-muted-foreground mb-8">
                {lang === "ar"
                  ? "كل رقم يحصل على خصم واحد فقط"
                  : "Each phone number gets one discount only"}
              </p>
              <div className="max-w-sm mx-auto">
                <input
                  type="tel"
                  dir="ltr"
                  placeholder="+963 9XX XXX XXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-card border border-border rounded-xl px-5 py-4 text-center text-lg outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary placeholder:text-muted-foreground transition-all mb-4"
                />
                <button
                  onClick={handleSubmitPhone}
                  disabled={loading}
                  className="w-full bg-gradient-gold text-accent-foreground py-4 rounded-xl font-bold text-lg hover:shadow-gold-lg transition-all duration-300 disabled:opacity-50"
                >
                  {loading
                    ? (lang === "ar" ? "جارٍ التحقق..." : "Checking...")
                    : (lang === "ar" ? "اكشف عطرك!" : "Reveal your scent!")}
                </button>
              </div>
            </motion.div>
          )}

          {/* Result */}
          {step === 7 && result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-8 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-20 h-20 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-6"
              >
                <Sparkles className="text-gold" size={36} />
              </motion.div>

              <h2 className="font-display text-3xl md:text-4xl font-bold text-gradient-gold mb-2">
                {lang === "ar" ? "عطرك المثالي هو" : "Your perfect scent is"}
              </h2>

              <div className="bg-card border border-border rounded-2xl p-8 mt-6 mb-6">
                <h3 className="font-display text-2xl font-bold text-foreground mb-1">
                  {lang === "ar" ? result.perfume.nameAr : result.perfume.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {lang === "ar" ? result.perfume.name : result.perfume.nameAr}
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  {lang === "ar" ? result.perfume.descriptionAr : result.perfume.description}
                </p>
              </div>

              {alreadyUsed ? (
                <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-6">
                  <p className="text-primary font-medium">
                    {lang === "ar"
                      ? "لقد حصلت على كود خصم مسبقاً:"
                      : "You already received a discount code:"}
                  </p>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <span className="font-mono text-2xl font-bold text-foreground">{result.code}</span>
                    <button onClick={copyCode} className="text-primary hover:text-primary/80">
                      <Copy size={18} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-gold/10 border border-gold/20 rounded-xl p-6 mb-6">
                  <div className="flex items-center justify-center gap-2 text-gold mb-2">
                    <Gift size={20} />
                    <span className="font-bold">
                      {lang === "ar" ? "كود خصم 10% خاص بك:" : "Your 10% discount code:"}
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="font-mono text-3xl font-bold text-foreground">{result.code}</span>
                    <button onClick={copyCode} className="text-gold hover:text-gold/80">
                      <Copy size={20} />
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    {lang === "ar"
                      ? "استخدم هذا الكود عند إتمام طلبك عبر واتساب"
                      : "Use this code when placing your order via WhatsApp"}
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
                <Link
                  to="/shop"
                  className="inline-flex items-center justify-center gap-2 bg-gradient-gold text-accent-foreground px-8 py-3 rounded-full font-bold hover:shadow-gold-lg transition-all"
                >
                  {lang === "ar" ? "تسوق الآن" : "Shop Now"}
                </Link>
                <button
                  onClick={() => {
                    setStep(0);
                    setAnswers([]);
                    setPhone("");
                    setResult(null);
                    setAlreadyUsed(false);
                  }}
                  className="inline-flex items-center justify-center gap-2 border border-border text-foreground px-8 py-3 rounded-full font-medium hover:bg-card transition-all"
                >
                  {lang === "ar" ? "إعادة الاختبار" : "Retake Quiz"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Quiz;
