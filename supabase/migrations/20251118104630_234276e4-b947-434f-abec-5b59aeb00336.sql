-- Create storage buckets for avatars and photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('gallery-photos', 'gallery-photos', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Storage policies for gallery photos
CREATE POLICY "Anyone can view gallery photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'gallery-photos');

CREATE POLICY "Authenticated users can upload gallery photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'gallery-photos' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can update their own gallery photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'gallery-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own gallery photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'gallery-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Update RLS policies for gallery_photos to allow members to delete their own photos
DROP POLICY IF EXISTS "Members can upload photos" ON gallery_photos;

CREATE POLICY "Members can upload photos"
ON gallery_photos FOR INSERT
WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Members can update their own photos"
ON gallery_photos FOR UPDATE
USING (auth.uid() = uploaded_by);

CREATE POLICY "Members can delete their own photos"
ON gallery_photos FOR DELETE
USING (auth.uid() = uploaded_by);

-- Update RLS for blog posts to allow members to create posts
DROP POLICY IF EXISTS "Authors can manage own posts" ON blog_posts;

CREATE POLICY "Members can create posts"
ON blog_posts FOR INSERT
WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update own posts"
ON blog_posts FOR UPDATE
USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete own posts"
ON blog_posts FOR DELETE
USING (auth.uid() = author_id);