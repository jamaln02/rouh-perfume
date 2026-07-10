
-- Extend coupons for per-user assignment & limits
ALTER TABLE public.coupons
  ADD COLUMN IF NOT EXISTS assigned_to_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS assigned_to_phone TEXT,
  ADD COLUMN IF NOT EXISTS per_user_limit INTEGER NOT NULL DEFAULT 1;

CREATE INDEX IF NOT EXISTS idx_coupons_assigned_user ON public.coupons(assigned_to_user_id);
CREATE INDEX IF NOT EXISTS idx_coupons_assigned_phone ON public.coupons(assigned_to_phone);

-- Redemptions log (works for both coupons and quiz_discounts via source)
CREATE TABLE IF NOT EXISTS public.coupon_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL CHECK (source IN ('coupon','quiz')),
  coupon_id UUID,
  code TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  phone TEXT,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  discount_percent INTEGER NOT NULL,
  discount_amount INTEGER NOT NULL DEFAULT 0,
  redeemed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.coupon_redemptions TO authenticated;
GRANT ALL ON public.coupon_redemptions TO service_role;

ALTER TABLE public.coupon_redemptions ENABLE ROW LEVEL SECURITY;

-- Only admins can read redemptions (contains PII / usage patterns)
CREATE POLICY "Admins read redemptions"
  ON public.coupon_redemptions FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_redemptions_coupon ON public.coupon_redemptions(coupon_id);
CREATE INDEX IF NOT EXISTS idx_redemptions_user ON public.coupon_redemptions(user_id);
CREATE INDEX IF NOT EXISTS idx_redemptions_phone ON public.coupon_redemptions(phone);
CREATE INDEX IF NOT EXISTS idx_redemptions_code_phone ON public.coupon_redemptions(code, phone);
CREATE INDEX IF NOT EXISTS idx_redemptions_code_user ON public.coupon_redemptions(code, user_id);
