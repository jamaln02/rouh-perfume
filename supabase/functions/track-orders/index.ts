import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { phone } = await req.json();
    if (!phone || typeof phone !== "string" || phone.length < 6 || phone.length > 32) {
      return new Response(JSON.stringify({ error: "Invalid phone" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data } = await admin
      .from("orders")
      .select("id, customer_name, city, status, total, created_at")
      .eq("customer_phone", phone.trim())
      .order("created_at", { ascending: false })
      .limit(25);
    return new Response(JSON.stringify({ orders: data || [] }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch {
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});