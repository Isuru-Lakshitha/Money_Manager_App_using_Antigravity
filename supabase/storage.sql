-- Run this in your Supabase SQL Editor to enable Local Image Uploads!

-- 1. Create a public bucket for avatars
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- 2. Allow public viewing of avatars
create policy "Avatar images are publicly accessible."
on storage.objects for select
using ( bucket_id = 'avatars' );

-- 3. Allow authenticated users to upload their own avatars
create policy "Users can upload their own avatar."
on storage.objects for insert
with check (
  bucket_id = 'avatars' and
  auth.uid() = owner
);

-- 4. Allow users to update their own avatars
create policy "Users can update their own avatar."
on storage.objects for update
using (
  bucket_id = 'avatars' and
  auth.uid() = owner
);

-- 5. Allow users to delete their previous avatars
create policy "Users can delete their own avatar."
on storage.objects for delete
using (
  bucket_id = 'avatars' and
  auth.uid() = owner
);
