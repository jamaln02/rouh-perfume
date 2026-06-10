
-- Remove overly permissive policies
DROP POLICY IF EXISTS "Anon can view guest orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can view active coupons" ON public.coupons;
DROP POLICY IF EXISTS "Anyone can read quiz discounts" ON public.quiz_discounts;
DROP POLICY IF EXISTS "Anyone can create quiz discount" ON public.quiz_discounts;

-- Drop orders from realtime publication to prevent unauthorized subscriptions
ALTER PUBLICATION supabase_realtime DROP TABLE public.orders;

-- Revoke direct EXECUTE on SECURITY DEFINER helper (still usable from RLS policies)
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon, authenticated;
