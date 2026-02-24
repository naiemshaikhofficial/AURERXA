-- Migration: Admin Intelligence (Restock & Analytics helpers)

-- 1. Helper Function to Increment Stock
CREATE OR REPLACE FUNCTION public.increment_product_stock(p_id UUID, p_qty INT)
RETURNS VOID AS $$
BEGIN
    UPDATE public.products
    SET stock = stock + p_qty,
        updated_at = NOW()
    WHERE id = p_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Grant access to authenticated users (actions run as authenticated)
GRANT EXECUTE ON FUNCTION public.increment_product_stock(UUID, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_product_stock(UUID, INT) TO service_role;
