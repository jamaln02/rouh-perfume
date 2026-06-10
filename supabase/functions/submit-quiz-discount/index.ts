import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function makeCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "ROUH";
  for (let i = 0; i < 4; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { phone, recommended_product, recommended_product_ar } = await req.json();
    if (
      typeof phone !== "string" || phone.length < 9 || phone.length > 20 ||
      typeof recommended_product !== "string" || recommended_product.length > 200 ||
      typeof recommended_product_ar !== "string" || recommended_product_ar.length > 200
    ) {
      return new Response(JSON.stringify({ error: "Invalid input" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: existing } = await admin
      .from("quiz_discounts")
      .select("discount_code, recommended_product, recommended_product_ar")
      .eq("phone", phone)
      .maybeSingle();
    if (existing) {
      return new Response(JSON.stringify({ existing: true, ...existing }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const code = makeCode();
    const { error } = await admin.from("quiz_discounts").insert({
      phone, discount_code: code, recommended_product, recommended_product_ar,
    });
    if (error) throw error;
    return new Response(JSON.stringify({ existing: false, discount_code: code, recommended_product, recommended_product_ar }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});