-- Allow anon to insert orders
CREATE POLICY "Anyone can create orders"
ON public.orders
FOR INSERT
TO anon
WITH CHECK (user_id IS NULL);

-- Allow anon to insert order items
CREATE POLICY "Anyone can insert order items for their orders"
ON public.order_items
FOR INSERT
TO anon
WITH CHECK (true);