import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { id } = await req.json();
    if (!id || typeof id !== "string" || !UUID_RE.test(id)) {
      return new Response(JSON.stringify({ error: "Invalid id" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: order } = await admin.from("orders").select("id, customer_name, customer_phone, customer_address, city, total, shipping_cost, status, created_at").eq("id", id).maybeSingle();
    if (!order) return new Response(JSON.stringify({ order: null }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const { data: items } = await admin.from("order_items").select("id, product_name, size, quantity, price").eq("order_id", id);
    return new Response(JSON.stringify({ order, items: items || [] }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch {
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});