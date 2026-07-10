import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { code, user_id, phone } = await req.json();
    if (!code || typeof code !== "string" || code.length > 64) {
      return new Response(JSON.stringify({ error: "Invalid code" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const uid: string | null = typeof user_id === "string" && user_id.length > 0 ? user_id : null;
    const ph: string | null = typeof phone === "string" && phone.trim().length >= 6 ? phone.trim() : null;
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const normalized = code.trim().toUpperCase();
    const { data } = await admin
      .from("coupons")
      .select("id, code, discount_percent, max_uses, used_count, expires_at, active, assigned_to_user_id, assigned_to_phone, per_user_limit")
      .eq("code", normalized)
      .eq("active", true)
      .maybeSingle();
    if (data) {
      const expired = data.expires_at && new Date(data.expires_at) < new Date();
      const globalExhausted = data.max_uses && data.used_count >= data.max_uses;
      if (!expired && !globalExhausted) {
        // Assignment check
        if (data.assigned_to_user_id && data.assigned_to_user_id !== uid) {
          return new Response(JSON.stringify({ valid: false, reason: "not_assigned" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        if (data.assigned_to_phone && data.assigned_to_phone !== ph) {
          return new Response(JSON.stringify({ valid: false, reason: "not_assigned" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        // Per-user limit check
        const limit = data.per_user_limit ?? 1;
        if (limit > 0 && (uid || ph)) {
          let q = admin.from("coupon_redemptions").select("id", { count: "exact", head: true }).eq("coupon_id", data.id);
          q = uid ? q.eq("user_id", uid) : q.eq("phone", ph);
          const { count } = await q;
          if ((count ?? 0) >= limit) {
            return new Response(JSON.stringify({ valid: false, reason: "already_used" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
          }
        }
        return new Response(JSON.stringify({ valid: true, id: data.id, code: data.code, discount_percent: data.discount_percent, source: "coupon" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Fallback: quiz discount codes (fixed 15% off, single use)
    const { data: quiz } = await admin
      .from("quiz_discounts")
      .select("id, discount_code, used, phone")
      .eq("discount_code", normalized)
      .maybeSingle();
    if (quiz && !quiz.used) {
      // Quiz codes are bound to the phone they were issued for
      if (ph && quiz.phone && quiz.phone !== ph) {
        return new Response(JSON.stringify({ valid: false, reason: "not_assigned" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      return new Response(JSON.stringify({ valid: true, id: quiz.id, code: quiz.discount_code, discount_percent: 15, source: "quiz" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ valid: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});