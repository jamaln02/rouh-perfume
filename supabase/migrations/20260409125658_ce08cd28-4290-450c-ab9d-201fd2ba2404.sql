-- Fix: Allow anon to SELECT orders they just created (user_id IS NULL) so order_items INSERT subquery works
CREATE POLICY "Anon can view guest orders"
ON public.orders
FOR SELECT
TO anon
USING (user_id IS NULL);

-- Quiz discounts table
CREATE TABLE public.quiz_discounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT NOT NULL UNIQUE,
  discount_code TEXT NOT NULL,
  recommended_product TEXT NOT NULL,
  recommended_product_ar TEXT NOT NULL,
  used BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.quiz_discounts ENABLE ROW LEVEL SECURITY;

-- Anyone can check if a phone already has a discount
CREATE POLICY "Anyone can read quiz discounts"
ON public.quiz_discounts
FOR SELECT
TO anon, authenticated
USING (true);

-- Anyone can insert (one per phone, enforced by UNIQUE constraint)
CREATE POLICY "Anyone can create quiz discount"
ON public.quiz_discounts
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Admins can manage
CREATE POLICY "Admins can manage quiz discounts"
ON public.quiz_discounts
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));