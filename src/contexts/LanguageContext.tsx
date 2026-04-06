import React, { createContext, useContext, useState, useCallback } from "react";

type Lang = "ar" | "en";

interface Translations {
  [key: string]: { ar: string; en: string };
}

const translations: Translations = {
  brand: { ar: "روح", en: "Rouh" },
  home: { ar: "الرئيسية", en: "Home" },
  shop: { ar: "المتجر", en: "Shop" },
  about: { ar: "من نحن", en: "About Us" },
  contact: { ar: "تواصل معنا", en: "Contact" },
  cart: { ar: "السلة", en: "Cart" },
  search: { ar: "بحث...", en: "Search..." },
  addToCart: { ar: "أضف إلى السلة", en: "Add to Cart" },
  buyWhatsApp: { ar: "اشتر عبر واتساب", en: "Buy via WhatsApp" },
  featured: { ar: "المميزة", en: "Featured" },
  newArrivals: { ar: "وصل حديثاً", en: "New Arrivals" },
  bestSellers: { ar: "الأكثر مبيعاً", en: "Best Sellers" },
  heroTitle: { ar: "اكتشف عطرك المثالي", en: "Discover Your Perfect Scent" },
  heroSubtitle: { ar: "عطور فاخرة تعكس أناقتك وتميزك", en: "Luxury fragrances that reflect your elegance" },
  shopNow: { ar: "تسوق الآن", en: "Shop Now" },
  price: { ar: "السعر", en: "Price" },
  category: { ar: "التصنيف", en: "Category" },
  allCategories: { ar: "جميع التصنيفات", en: "All Categories" },
  men: { ar: "رجالي", en: "Men" },
  women: { ar: "نسائي", en: "Women" },
  unisex: { ar: "للجنسين", en: "Unisex" },
  oud: { ar: "عود", en: "Oud" },
  floral: { ar: "زهري", en: "Floral" },
  woody: { ar: "خشبي", en: "Woody" },
  fresh: { ar: "منعش", en: "Fresh" },
  oriental: { ar: "شرقي", en: "Oriental" },
  filter: { ar: "تصفية", en: "Filter" },
  sortBy: { ar: "ترتيب حسب", en: "Sort By" },
  priceLowHigh: { ar: "السعر: الأقل أولاً", en: "Price: Low to High" },
  priceHighLow: { ar: "السعر: الأعلى أولاً", en: "Price: High to Low" },
  newest: { ar: "الأحدث", en: "Newest" },
  removeFromCart: { ar: "إزالة", en: "Remove" },
  checkout: { ar: "إتمام الشراء", en: "Checkout" },
  total: { ar: "المجموع", en: "Total" },
  quantity: { ar: "الكمية", en: "Quantity" },
  emptyCart: { ar: "سلة التسوق فارغة", en: "Your cart is empty" },
  continueShopping: { ar: "متابعة التسوق", en: "Continue Shopping" },
  aboutTitle: { ar: "عن روح", en: "About Rouh" },
  aboutText: { ar: "روح هي علامة تجارية سورية فاخرة للعطور، نقدم أرقى العطور الشرقية والغربية التي تعكس الأصالة والحداثة.", en: "Rouh is a premium Syrian perfume brand, offering the finest oriental and western fragrances that reflect authenticity and modernity." },
  contactTitle: { ar: "تواصل معنا", en: "Get in Touch" },
  name: { ar: "الاسم", en: "Name" },
  email: { ar: "البريد الإلكتروني", en: "Email" },
  message: { ar: "الرسالة", en: "Message" },
  send: { ar: "إرسال", en: "Send" },
  phone: { ar: "الهاتف", en: "Phone" },
  address: { ar: "العنوان", en: "Address" },
  followUs: { ar: "تابعنا", en: "Follow Us" },
  rights: { ar: "جميع الحقوق محفوظة", en: "All Rights Reserved" },
  description: { ar: "الوصف", en: "Description" },
  details: { ar: "التفاصيل", en: "Details" },
  relatedProducts: { ar: "منتجات ذات صلة", en: "Related Products" },
  size: { ar: "الحجم", en: "Size" },
  customerDetails: { ar: "بيانات العميل", en: "Customer Details" },
  deliveryAddress: { ar: "عنوان التوصيل", en: "Delivery Address" },
  city: { ar: "المدينة", en: "City" },
  paymentMethod: { ar: "طريقة الدفع", en: "Payment Method" },
  cashOnDelivery: { ar: "الدفع عند الاستلام", en: "Cash on Delivery" },
  placeOrder: { ar: "تأكيد الطلب", en: "Place Order" },
  subtotal: { ar: "المجموع الفرعي", en: "Subtotal" },
  shipping: { ar: "الشحن", en: "Shipping" },
  orderSummary: { ar: "ملخص الطلب", en: "Order Summary" },
  ourStory: { ar: "قصتنا", en: "Our Story" },
  ourVision: { ar: "رؤيتنا", en: "Our Vision" },
  ourMission: { ar: "مهمتنا", en: "Our Mission" },
  freeShipping: { ar: "شحن مجاني", en: "Free Shipping" },
  freeShippingDesc: { ar: "على الطلبات فوق ٥٠,٠٠٠ ل.س", en: "On orders over 50,000 SYP" },
  premiumQuality: { ar: "جودة فائقة", en: "Premium Quality" },
  premiumQualityDesc: { ar: "عطور أصلية ١٠٠٪", en: "100% Authentic Perfumes" },
  support: { ar: "دعم ٢٤/٧", en: "24/7 Support" },
  supportDesc: { ar: "نحن هنا لمساعدتك", en: "We're here to help" },
  collections: { ar: "المجموعات", en: "Collections" },
  exploreCollection: { ar: "استكشف المجموعة", en: "Explore Collection" },
  login: { ar: "تسجيل الدخول", en: "Sign In" },
  signup: { ar: "إنشاء حساب", en: "Sign Up" },
  logout: { ar: "تسجيل الخروج", en: "Sign Out" },
  adminPanel: { ar: "لوحة التحكم", en: "Admin Panel" },
};

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
  dir: "rtl" | "ltr";
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Lang>("ar");

  const t = useCallback(
    (key: string) => translations[key]?.[lang] || key,
    [lang]
  );

  const dir = lang === "ar" ? "rtl" : "ltr";

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, dir }}>
      <div dir={dir}>{children}</div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
};
