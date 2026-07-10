import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { code, order_id, user_id, phone, discount_amount } = await req.json();
    if (!code || typeof code !== "string" || !order_id || typeof order_id !== "string") {
      return new Response(JSON.stringify({ error: "Invalid input" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const uid = typeof user_id === "string" && user_id ? user_id : null;
    const ph = typeof phone === "string" && phone.trim().length >= 6 ? phone.trim() : null;
    const amt = Number.isFinite(discount_amount) ? Math.max(0, Math.floor(discount_amount)) : 0;
    const normalized = code.trim().toUpperCase();

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // Try coupon first
    const { data: c } = await admin
      .from("coupons")
      .select("id, discount_percent, used_count, per_user_limit, max_uses, active, expires_at, assigned_to_user_id, assigned_to_phone")
      .eq("code", normalized)
      .maybeSingle();

    if (c && c.active) {
      // Re-validate assignment & per-user limit atomically-ish
      if (c.assigned_to_user_id && c.assigned_to_user_id !== uid) return json({ ok: false, reason: "not_assigned" });
      if (c.assigned_to_phone && c.assigned_to_phone !== ph) return json({ ok: false, reason: "not_assigned" });
      if (c.max_uses && c.used_count >= c.max_uses) return json({ ok: false, reason: "exhausted" });
      const limit = c.per_user_limit ?? 1;
      if (limit > 0 && (uid || ph)) {
        let q = admin.from("coupon_redemptions").select("id", { count: "exact", head: true }).eq("coupon_id", c.id);
        q = uid ? q.eq("user_id", uid) : q.eq("phone", ph);
        const { count } = await q;
        if ((count ?? 0) >= limit) return json({ ok: false, reason: "already_used" });
      }

      await admin.from("coupon_redemptions").insert({
        source: "coupon", coupon_id: c.id, code: normalized, user_id: uid, phone: ph,
        order_id, discount_percent: c.discount_percent, discount_amount: amt,
      });
      await admin.from("coupons").update({ used_count: (c.used_count || 0) + 1 }).eq("id", c.id);
      return json({ ok: true });
    }

    // Quiz code
    const { data: q } = await admin
      .from("quiz_discounts")
      .select("id, discount_code, used, phone")
      .eq("discount_code", normalized)
      .maybeSingle();
    if (q && !q.used) {
      if (ph && q.phone && q.phone !== ph) return json({ ok: false, reason: "not_assigned" });
      await admin.from("coupon_redemptions").insert({
        source: "quiz", coupon_id: null, code: normalized, user_id: uid, phone: ph ?? q.phone,
        order_id, discount_percent: 15, discount_amount: amt,
      });
      await admin.from("quiz_discounts").update({ used: true }).eq("id", q.id);
      return json({ ok: true });
    }

    return json({ ok: false, reason: "not_found" });
  } catch {
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}