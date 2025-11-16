-- Add birthday field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN birthday date;