-- Allow any authenticated user to create albums
CREATE POLICY "Members can create albums" 
ON public.gallery_albums 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

-- Allow users to update their own albums
CREATE POLICY "Members can update own albums" 
ON public.gallery_albums 
FOR UPDATE 
USING (auth.uid() = created_by);

-- Allow users to delete their own albums
CREATE POLICY "Members can delete own albums" 
ON public.gallery_albums 
FOR DELETE 
USING (auth.uid() = created_by);