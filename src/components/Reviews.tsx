import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface Review {
  id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  profile?: { full_name: string | null } | null;
}

const Stars = ({ value, onChange, size = 18 }: { value: number; onChange?: (v: number) => void; size?: number }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((n) => (
      <button
        key={n}
        type="button"
        onClick={onChange ? () => onChange(n) : undefined}
        className={onChange ? "cursor-pointer" : "cursor-default"}
        disabled={!onChange}
      >
        <Star
          size={size}
          className={n <= value ? "fill-gold text-gold" : "text-muted-foreground"}
        />
      </button>
    ))}
  </div>
);

const Reviews = ({ productId }: { productId: string }) => {
  const { user } = useAuth();
  const { lang, t } = useLanguage();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("reviews")
      .select("id, user_id, rating, comment, created_at")
      .eq("product_id", productId)
      .eq("approved", true)
      .order("created_at", { ascending: false });

    const userIds = Array.from(new Set((data || []).map((r) => r.user_id)));
    let profiles: Record<string, { full_name: string | null }> = {};
    if (userIds.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", userIds);
      profiles = Object.fromEntries((profs || []).map((p: any) => [p.id, p]));
    }
    setReviews((data || []).map((r) => ({ ...r, profile: profiles[r.user_id] || null })));
    setLoading(false);
  };

  useEffect(() => { load(); }, [productId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    const { error } = await supabase.from("reviews").upsert(
      { product_id: productId, user_id: user.id, rating, comment: comment || null },
      { onConflict: "product_id,user_id" }
    );
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(t("reviewThanks"));
      setComment("");
      setRating(5);
      load();
    }
  };

  const avg = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  return (
    <section className="mt-16">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-gradient-gold">{t("reviews")}</h2>
        {reviews.length > 0 && (
          <div className="flex items-center gap-2">
            <Stars value={Math.round(avg)} />
            <span className="text-sm text-muted-foreground">
              {avg.toFixed(1)} ({reviews.length})
            </span>
          </div>
        )}
      </div>

      {/* Form */}
      <div className="bg-card border border-border rounded-2xl p-5 mb-6">
        <h3 className="font-semibold text-foreground mb-3">{t("writeReview")}</h3>
        {user ? (
          <form onSubmit={submit} className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground mb-2">{t("yourRating")}</p>
              <Stars value={rating} onChange={setRating} size={26} />
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t("yourComment")}
              className="w-full bg-background text-foreground border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/40 h-24 resize-none"
            />
            <button
              disabled={submitting}
              className="bg-gradient-gold text-accent-foreground px-6 py-2.5 rounded-xl font-semibold shadow-gold disabled:opacity-50"
            >
              {submitting ? "..." : t("submitReview")}
            </button>
          </form>
        ) : (
          <Link to="/auth" className="text-gold hover:underline text-sm">{t("loginToReview")}</Link>
        )}
      </div>

      {/* List */}
      {loading ? (
        <div className="text-muted-foreground text-sm">...</div>
      ) : reviews.length === 0 ? (
        <p className="text-muted-foreground text-sm text-center py-8">{t("noReviewsYet")}</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gold/10 text-gold flex items-center justify-center font-bold">
                    {(r.profile?.full_name || "?").slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">
                      {r.profile?.full_name || (lang === "ar" ? "مستخدم" : "User")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(r.created_at).toLocaleDateString(lang === "ar" ? "ar-SY" : "en-US")}
                    </p>
                  </div>
                </div>
                <Stars value={r.rating} size={14} />
              </div>
              {r.comment && <p className="text-sm text-foreground/90 leading-relaxed">{r.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default Reviews;