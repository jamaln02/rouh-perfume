import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { motion } from "framer-motion";

const Auth = () => {
  const { user, loading, signIn, signUp } = useAuth();
  const { lang } = useLanguage();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" /></div>;
  if (user) return <Navigate to="/" replace />;

  const t = {
    login: lang === "ar" ? "تسجيل الدخول" : "Sign In",
    signup: lang === "ar" ? "إنشاء حساب" : "Sign Up",
    email: lang === "ar" ? "البريد الإلكتروني" : "Email",
    password: lang === "ar" ? "كلمة المرور" : "Password",
    name: lang === "ar" ? "الاسم الكامل" : "Full Name",
    noAccount: lang === "ar" ? "ليس لديك حساب؟" : "Don't have an account?",
    hasAccount: lang === "ar" ? "لديك حساب بالفعل؟" : "Already have an account?",
    welcome: lang === "ar" ? "مرحباً بك في روح" : "Welcome to Rouh",
    subtitle: lang === "ar" ? "عطور فاخرة تعكس أناقتك" : "Luxury fragrances reflecting your elegance",
    checkEmail: lang === "ar" ? "تحقق من بريدك الإلكتروني لتأكيد حسابك" : "Check your email to confirm your account",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) throw error;
        toast.success(lang === "ar" ? "تم تسجيل الدخول بنجاح" : "Signed in successfully");
      } else {
        const { error } = await signUp(email, password, fullName);
        if (error) throw error;
        toast.success(t.checkEmail);
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl text-gradient-gold mb-2">{t.welcome}</h1>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </div>

        <div className="glass-dark rounded-2xl p-8 border border-gold/20">
          <div className="flex gap-2 mb-6">
            <Button
              variant={isLogin ? "default" : "ghost"}
              className={`flex-1 ${isLogin ? "bg-gradient-gold text-primary-foreground" : "text-muted-foreground"}`}
              onClick={() => setIsLogin(true)}
            >
              {t.login}
            </Button>
            <Button
              variant={!isLogin ? "default" : "ghost"}
              className={`flex-1 ${!isLogin ? "bg-gradient-gold text-primary-foreground" : "text-muted-foreground"}`}
              onClick={() => setIsLogin(false)}
            >
              {t.signup}
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground">{t.name}</Label>
                <div className="relative">
                  <User className="absolute start-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="ps-10 bg-background/10 border-gold/20 text-foreground"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">{t.email}</Label>
              <div className="relative">
                <Mail className="absolute start-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="ps-10 bg-background/10 border-gold/20 text-foreground"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">{t.password}</Label>
              <div className="relative">
                <Lock className="absolute start-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="ps-10 pe-10 bg-background/10 border-gold/20 text-foreground"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute end-3 top-3 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-gold hover:opacity-90 text-primary-foreground font-semibold h-12"
            >
              {submitting ? <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" /> : (isLogin ? t.login : t.signup)}
            </Button>
          </form>

          <p className="text-center text-muted-foreground text-sm mt-6">
            {isLogin ? t.noAccount : t.hasAccount}{" "}
            <button onClick={() => setIsLogin(!isLogin)} className="text-primary hover:underline font-medium">
              {isLogin ? t.signup : t.login}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
