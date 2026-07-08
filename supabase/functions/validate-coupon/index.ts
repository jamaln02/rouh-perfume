import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { code } = await req.json();
    if (!code || typeof code !== "string" || code.length > 64) {
      return new Response(JSON.stringify({ error: "Invalid code" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const normalized = code.trim().toUpperCase();
    const { data } = await admin
      .from("coupons")
      .select("id, code, discount_percent, max_uses, used_count, expires_at, active")
      .eq("code", normalized)
      .eq("active", true)
      .maybeSingle();
    if (data && !(data.expires_at && new Date(data.expires_at) < new Date()) && !(data.max_uses && data.used_count >= data.max_uses)) {
      return new Response(JSON.stringify({ valid: true, id: data.id, code: data.code, discount_percent: data.discount_percent, source: "coupon" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fallback: quiz discount codes (fixed 15% off, single use)
    const { data: quiz } = await admin
      .from("quiz_discounts")
      .select("id, discount_code, used")
      .eq("discount_code", normalized)
      .maybeSingle();
    if (quiz && !quiz.used) {
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