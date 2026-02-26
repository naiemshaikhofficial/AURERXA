-- Create site_settings table for dynamic configuration
CREATE TABLE IF NOT EXISTS public.site_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Policies: Everyone can read, Admins can manage
DROP POLICY IF EXISTS "Allow public read site_settings" ON public.site_settings;
CREATE POLICY "Allow public read site_settings" ON public.site_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage site_settings" ON public.site_settings;
CREATE POLICY "Admins can manage site_settings" ON public.site_settings FOR ALL USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
);

-- Insert default configurations
INSERT INTO public.site_settings (key, value)
VALUES 
    ('shipping_config', '{
        "free_shipping_threshold": 50000,
        "default_shipping_fee": 90,
        "is_enabled": true
    }'::jsonb),
    ('maintenance_config', '{
        "is_enabled": false,
        "message": "AURERXA is upgrading to serve you better. We will be back shortly with a more premium experience."
    }'::jsonb),
    ('contact_config', '{
        "phone": "+91 9391032677",
        "email": "support@aurerxa.com",
        "whatsapp": "+91 9391032677",
        "address": "Captain Lakshmi Chowk, Rangargalli, Sangamner, Maharashtra 422605"
    }'::jsonb),
    ('marketing_config', '{
        "banner_enabled": false,
        "banner_text": "Special Edition Heritage Collection - Now Live",
        "banner_link": "/collections"
    }'::jsonb)
ON CONFLICT (key) DO NOTHING;
