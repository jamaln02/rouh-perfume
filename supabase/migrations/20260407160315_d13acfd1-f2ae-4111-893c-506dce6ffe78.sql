DROP POLICY "Anyone can insert order items for their orders" ON public.order_items;

CREATE POLICY "Anon can insert order items for guest orders"
ON public.order_items
FOR INSERT
TO anon
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id
    AND orders.user_id IS NULL
  )
);