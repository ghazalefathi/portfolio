CREATE POLICY "Admins read portfolio files" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'portfolio' AND public.has_role(auth.uid(), 'admin'));