-- Create the "products" bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to read files
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'products' );

-- Allow anyone to upload files (for admin panel)
-- In a production app, you might want to restrict this to authenticated users
CREATE POLICY "Allow Public Uploads"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'products' );

-- Allow updates and deletes
CREATE POLICY "Allow Public Updates"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'products' );

CREATE POLICY "Allow Public Deletes"
ON storage.objects FOR DELETE
USING ( bucket_id = 'products' );
