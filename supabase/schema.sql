-- Create the SEO Pages table
create table if not exists public.seo_pages (
  id uuid default gen_random_uuid() primary key,
  slug text not null unique,
  title text not null,
  description text,
  prompt text not null,
  image_url text not null,
  content jsonb default '{}'::jsonb, -- Stores "Fun Facts", "Tips", etc.
  pinterest_posted boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.seo_pages enable row level security;

-- Create Policy: Allow public read access (everyone can view pages)
create policy "Allow public read access"
  on public.seo_pages
  for select
  to public
  using (true);

-- Create Policy: Allow service role write access (only scripts/backend can write)
create policy "Allow service role write access"
  on public.seo_pages
  for all
  to service_role
  using (true)
  with check (true);

-- Create Storage Bucket for SEO Images
insert into storage.buckets (id, name, public)
values ('seo-images', 'seo-images', true)
on conflict (id) do nothing;

-- Storage Policy: Allow public to read images
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'seo-images' );

-- Storage Policy: Allow service role to upload images
create policy "Service Role Upload"
  on storage.objects for insert
  with check ( bucket_id = 'seo-images' );

-- Create Profiles table (extends auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  stripe_customer_id text,
  subscription_status text default 'none', -- 'active', 'past_due', 'canceled', 'none'
  credits int default 3,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Profiles
alter table public.profiles enable row level security;

-- Profiles Policy: Users can view their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using ( auth.uid() = id );

-- Profiles Policy: Service role can manage all profiles
create policy "Service role can manage profiles"
  on public.profiles for all
  to service_role
  using ( true )
  with check ( true );

-- Function to handle new user signup (auto-create profile)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, credits)
  values (new.id, 3);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user signup
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
