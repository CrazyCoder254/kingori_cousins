-- Update the handle_new_user function to include birthday
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, birthday)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'New Member'),
    new.email,
    COALESCE((new.raw_user_meta_data->>'birthday')::date, NULL)
  );
  
  -- Assign default member role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'member');
  
  RETURN new;
END;
$function$;