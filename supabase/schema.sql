-- Create submissions table
create table if not exists submissions (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  message text not null,
  image_urls text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for submissions
alter table submissions enable row level security;

create policy "Public submissions are allowed"
on submissions for insert
to public
with check (true);

create policy "Admins can view submissions"
on submissions for select
to authenticated
using (true);

create policy "Admins can delete submissions"
on submissions for delete
to authenticated
using (true);


-- Create page_views table
create table if not exists page_views (
  id uuid default gen_random_uuid() primary key,
  source text not null,
  visited_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for page_views
alter table page_views enable row level security;

create policy "Public page views are allowed"
on page_views for insert
to public
with check (true);

create policy "Admins can view page views"
on page_views for select
to authenticated
using (true);

-- Create storage bucket for contact uploads (private)
-- Note: You might need to enable the storage extension if not enabled.
-- extension 'storage' is usually enabled by default on Supabase projects.

insert into storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
values ('contact-uploads', 'contact-uploads', false, false, 5242880, '{image/*}')
on conflict (id) do nothing;

-- Storage policies
-- Allow authenticated users (admins) full access
create policy "Admins can do everything on contact-uploads"
on storage.objects
for all
to authenticated
using ( bucket_id = 'contact-uploads' )
with check ( bucket_id = 'contact-uploads' );

-- Allow public uploads? No, server-side admin upload only.
