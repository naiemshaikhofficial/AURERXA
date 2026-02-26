-- Migration: Add timestamps to cart table for abandoned cart tracking

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='cart' AND column_name='created_at'
    ) THEN
        ALTER TABLE public.cart ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='cart' AND column_name='updated_at'
    ) THEN
        ALTER TABLE public.cart ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;
    END IF;
END $$;

-- Update trigger for updated_at if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_cart_updated_at') THEN
        CREATE TRIGGER set_cart_updated_at
        BEFORE UPDATE ON public.cart
        FOR EACH ROW
        EXECUTE PROCEDURE update_updated_at_column();
    END IF;
END $$;
