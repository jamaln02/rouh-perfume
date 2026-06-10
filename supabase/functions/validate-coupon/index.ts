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
    const { data } = await admin
      .from("coupons")
      .select("id, code, discount_percent, max_uses, used_count, expires_at, active")
      .eq("code", code.trim().toUpperCase())
      .eq("active", true)
      .maybeSingle();
    if (!data || (data.expires_at && new Date(data.expires_at) < new Date()) || (data.max_uses && data.used_count >= data.max_uses)) {
      return new Response(JSON.stringify({ valid: false }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    return new Response(JSON.stringify({ valid: true, id: data.id, code: data.code, discount_percent: data.discount_percent }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});