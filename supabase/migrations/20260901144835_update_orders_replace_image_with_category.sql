alter table public.orders
add column category text not null default 'other';

alter table public.orders
add constraint orders_category_check
check (
  category in (
    'electronics',
    'clothing',
    'food',
    'home',
    'gaming',
    'beauty',
    'other'
  )
);

alter table public.orders
drop column if exists image_url;