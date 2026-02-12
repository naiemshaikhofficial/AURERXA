-- Drop the function if it exists to ensure clean slate
DROP FUNCTION IF EXISTS get_dashboard_stats(text, text);

-- Create the optimized stats function
CREATE OR REPLACE FUNCTION get_dashboard_stats(
  date_from text,
  date_to text
) 
RETURNS json 
LANGUAGE plpgsql 
SECURITY DEFINER 
AS $$
DECLARE
  v_confirmed_revenue numeric;
  v_pending_revenue numeric;
  v_cancelled_revenue numeric;
  v_filtered_revenue numeric;
  v_prev_revenue numeric;
  
  v_total_orders bigint;
  v_filtered_orders bigint;
  v_pending_orders bigint;
  v_packed_orders bigint;
  v_shipped_orders bigint;
  v_delivered_orders bigint;
  v_cancelled_orders bigint;
  
  v_total_products bigint;
  v_total_users bigint;
  v_low_stock json;
  
  v_date_from timestamptz := date_from::timestamptz;
  v_date_to timestamptz := date_to::timestamptz;
  v_period_interval interval := v_date_to - v_date_from;
  v_prev_from timestamptz := v_date_from - v_period_interval;
  v_prev_to timestamptz := v_date_from;
  
  -- Confirmed statuses
  v_statuses text[] := ARRAY['delivered', 'shipped', 'packed'];
BEGIN
  -- 1. All-time aggregates (Confirmed Revenue, Total Orders, etc.)
  SELECT 
    COALESCE(SUM(CASE WHEN status = ANY(v_statuses) THEN total ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN status = 'pending' THEN total ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN status = 'cancelled' THEN total ELSE 0 END), 0),
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'pending'),
    COUNT(*) FILTER (WHERE status = 'packed'),
    COUNT(*) FILTER (WHERE status = 'shipped'),
    COUNT(*) FILTER (WHERE status = 'delivered'),
    COUNT(*) FILTER (WHERE status = 'cancelled')
  INTO 
    v_confirmed_revenue,
    v_pending_revenue,
    v_cancelled_revenue,
    v_total_orders,
    v_pending_orders,
    v_packed_orders,
    v_shipped_orders,
    v_delivered_orders,
    v_cancelled_orders
  FROM orders;

  -- 2. Filtered Period aggregates (Revenue, Orders count)
  SELECT
    COALESCE(SUM(CASE WHEN status = ANY(v_statuses) THEN total ELSE 0 END), 0),
    COUNT(*)
  INTO
    v_filtered_revenue,
    v_filtered_orders
  FROM orders
  WHERE created_at >= v_date_from AND created_at <= v_date_to;

  -- 3. Previous Period Revenue (for growth calc)
  SELECT
    COALESCE(SUM(total), 0)
  INTO
    v_prev_revenue
  FROM orders
  WHERE status = ANY(v_statuses)
    AND created_at >= v_prev_from AND created_at <= v_prev_to;

  -- 4. Products Stats
  SELECT count(*) INTO v_total_products FROM products;
  
  SELECT json_agg(json_build_object(
    'id', id,
    'name', name,
    'stock', stock,
    'image_url', image_url
  )) INTO v_low_stock
  FROM products 
  WHERE stock <= 5;

  -- 5. Users count
  SELECT count(*) INTO v_total_users FROM profiles;

  RETURN json_build_object(
    'confirmedRevenue', v_confirmed_revenue,
    'pendingRevenue', v_pending_revenue,
    'cancelledRevenue', v_cancelled_revenue,
    'filteredRevenue', v_filtered_revenue,
    'prevRevenue', v_prev_revenue,
    'totalOrders', v_total_orders,
    'filteredOrders', v_filtered_orders,
    'pendingOrders', v_pending_orders,
    'packedOrders', v_packed_orders,
    'shippedOrders', v_shipped_orders,
    'deliveredOrders', v_delivered_orders,
    'cancelledOrders', v_cancelled_orders,
    'totalProducts', v_total_products,
    'totalUsers', v_total_users,
    'lowStockProducts', COALESCE(v_low_stock, '[]'::json)
  );
END;
$$;
