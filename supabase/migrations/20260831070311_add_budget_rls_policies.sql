alter table public.orders enable row level security;
alter table public.expenses enable row level security;
alter table public.saving_goals enable row level security;
alter table public.contributions enable row level security;
alter table public.paylaters enable row level security;
alter table public.incomes enable row level security;
alter table public.settings enable row level security;

drop policy if exists "Allow read orders" on public.orders;
drop policy if exists "Allow insert orders" on public.orders;
drop policy if exists "Allow update orders" on public.orders;
drop policy if exists "Allow delete orders" on public.orders;

create policy "Allow read orders"
on public.orders
for select
to anon, authenticated
using (true);

create policy "Allow insert orders"
on public.orders
for insert
to anon, authenticated
with check (true);

create policy "Allow update orders"
on public.orders
for update
to anon, authenticated
using (true)
with check (true);

create policy "Allow delete orders"
on public.orders
for delete
to anon, authenticated
using (true);

drop policy if exists "Allow read expenses" on public.expenses;
drop policy if exists "Allow insert expenses" on public.expenses;
drop policy if exists "Allow update expenses" on public.expenses;
drop policy if exists "Allow delete expenses" on public.expenses;

create policy "Allow read expenses"
on public.expenses
for select
to anon, authenticated
using (true);

create policy "Allow insert expenses"
on public.expenses
for insert
to anon, authenticated
with check (true);

create policy "Allow update expenses"
on public.expenses
for update
to anon, authenticated
using (true)
with check (true);

create policy "Allow delete expenses"
on public.expenses
for delete
to anon, authenticated
using (true);

drop policy if exists "Allow read saving_goals" on public.saving_goals;
drop policy if exists "Allow insert saving_goals" on public.saving_goals;
drop policy if exists "Allow update saving_goals" on public.saving_goals;
drop policy if exists "Allow delete saving_goals" on public.saving_goals;

create policy "Allow read saving_goals"
on public.saving_goals
for select
to anon, authenticated
using (true);

create policy "Allow insert saving_goals"
on public.saving_goals
for insert
to anon, authenticated
with check (true);

create policy "Allow update saving_goals"
on public.saving_goals
for update
to anon, authenticated
using (true)
with check (true);

create policy "Allow delete saving_goals"
on public.saving_goals
for delete
to anon, authenticated
using (true);

drop policy if exists "Allow read contributions" on public.contributions;
drop policy if exists "Allow insert contributions" on public.contributions;
drop policy if exists "Allow update contributions" on public.contributions;
drop policy if exists "Allow delete contributions" on public.contributions;

create policy "Allow read contributions"
on public.contributions
for select
to anon, authenticated
using (true);

create policy "Allow insert contributions"
on public.contributions
for insert
to anon, authenticated
with check (true);

create policy "Allow update contributions"
on public.contributions
for update
to anon, authenticated
using (true)
with check (true);

create policy "Allow delete contributions"
on public.contributions
for delete
to anon, authenticated
using (true);

drop policy if exists "Allow read paylaters" on public.paylaters;
drop policy if exists "Allow insert paylaters" on public.paylaters;
drop policy if exists "Allow update paylaters" on public.paylaters;
drop policy if exists "Allow delete paylaters" on public.paylaters;

create policy "Allow read paylaters"
on public.paylaters
for select
to anon, authenticated
using (true);

create policy "Allow insert paylaters"
on public.paylaters
for insert
to anon, authenticated
with check (true);

create policy "Allow update paylaters"
on public.paylaters
for update
to anon, authenticated
using (true)
with check (true);

create policy "Allow delete paylaters"
on public.paylaters
for delete
to anon, authenticated
using (true);

drop policy if exists "Allow read incomes" on public.incomes;
drop policy if exists "Allow insert incomes" on public.incomes;
drop policy if exists "Allow update incomes" on public.incomes;
drop policy if exists "Allow delete incomes" on public.incomes;

create policy "Allow read incomes"
on public.incomes
for select
to anon, authenticated
using (true);

create policy "Allow insert incomes"
on public.incomes
for insert
to anon, authenticated
with check (true);

create policy "Allow update incomes"
on public.incomes
for update
to anon, authenticated
using (true)
with check (true);

create policy "Allow delete incomes"
on public.incomes
for delete
to anon, authenticated
using (true);

drop policy if exists "Allow read settings" on public.settings;
drop policy if exists "Allow insert settings" on public.settings;
drop policy if exists "Allow update settings" on public.settings;
drop policy if exists "Allow delete settings" on public.settings;

create policy "Allow read settings"
on public.settings
for select
to anon, authenticated
using (true);

create policy "Allow insert settings"
on public.settings
for insert
to anon, authenticated
with check (true);

create policy "Allow update settings"
on public.settings
for update
to anon, authenticated
using (true)
with check (true);

create policy "Allow delete settings"
on public.settings
for delete
to anon, authenticated
using (true);