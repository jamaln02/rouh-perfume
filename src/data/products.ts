import perfume1 from "@/assets/perfume-1.jpg";
import perfume2 from "@/assets/perfume-2.jpg";
import perfume3 from "@/assets/perfume-3.jpg";
import perfume4 from "@/assets/perfume-4.jpg";
import perfume5 from "@/assets/perfume-5.jpg";
import perfume6 from "@/assets/perfume-6.jpg";

export interface Product {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  price: number;
  image: string;
  category: "men" | "women" | "unisex";
  fragrance: "oud" | "floral" | "woody" | "fresh" | "oriental";
  sizes: string[];
  featured: boolean;
  isNew: boolean;
  bestSeller: boolean;
}

export const products: Product[] = [
  {
    id: "1",
    name: "Royal Amber",
    nameAr: "العنبر الملكي",
    description: "A luxurious blend of amber, sandalwood, and vanilla with deep oriental notes that evoke royalty and elegance.",
    descriptionAr: "مزيج فاخر من العنبر وخشب الصندل والفانيليا مع نوتات شرقية عميقة تثير الملوكية والأناقة.",
    price: 45000,
    image: perfume1,
    category: "unisex",
    fragrance: "oriental",
    sizes: ["50ml", "100ml"],
    featured: true,
    isNew: false,
    bestSeller: true,
  },
  {
    id: "2",
    name: "Rose Éternelle",
    nameAr: "الوردة الأبدية",
    description: "A romantic floral fragrance with Damascus rose, peony, and a touch of musk for lasting elegance.",
    descriptionAr: "عطر زهري رومانسي مع الورد الدمشقي والفاوانيا ولمسة من المسك لأناقة دائمة.",
    price: 38000,
    image: perfume2,
    category: "women",
    fragrance: "floral",
    sizes: ["50ml", "100ml"],
    featured: true,
    isNew: true,
    bestSeller: false,
  },
  {
    id: "3",
    name: "Oud Majesty",
    nameAr: "عود الملوك",
    description: "Premium oud combined with saffron and leather notes, a masterpiece of oriental perfumery.",
    descriptionAr: "عود فاخر مع الزعفران ونوتات الجلد، تحفة من العطور الشرقية.",
    price: 65000,
    image: perfume3,
    category: "unisex",
    fragrance: "oud",
    sizes: ["50ml", "100ml"],
    featured: true,
    isNew: false,
    bestSeller: true,
  },
  {
    id: "4",
    name: "Aqua Bliss",
    nameAr: "نسمة المحيط",
    description: "A refreshing aquatic fragrance with marine accords, bergamot, and white cedar.",
    descriptionAr: "عطر مائي منعش مع نوتات بحرية والبرغموت وخشب الأرز الأبيض.",
    price: 32000,
    image: perfume4,
    category: "men",
    fragrance: "fresh",
    sizes: ["50ml", "100ml"],
    featured: false,
    isNew: true,
    bestSeller: false,
  },
  {
    id: "5",
    name: "Noir Intense",
    nameAr: "نوار المكثف",
    description: "A bold, masculine scent with black pepper, vetiver, and smoky incense.",
    descriptionAr: "عطر جريء وذكوري مع الفلفل الأسود والفيتفر والبخور الدخاني.",
    price: 42000,
    image: perfume5,
    category: "men",
    fragrance: "woody",
    sizes: ["50ml", "100ml"],
    featured: false,
    isNew: false,
    bestSeller: true,
  },
  {
    id: "6",
    name: "Heritage Collection",
    nameAr: "مجموعة التراث",
    description: "A curated trio of oriental fragrances celebrating Syrian perfumery heritage.",
    descriptionAr: "مجموعة مختارة من ثلاثة عطور شرقية تحتفي بتراث العطور السورية.",
    price: 95000,
    image: perfume6,
    category: "unisex",
    fragrance: "oriental",
    sizes: ["3x30ml"],
    featured: true,
    isNew: true,
    bestSeller: false,
  },
];

export const getProduct = (id: string) => products.find((p) => p.id === id);
