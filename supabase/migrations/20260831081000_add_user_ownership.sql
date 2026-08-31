alter table public.orders add column if not exists user_id uuid;
alter table public.expenses add column if not exists user_id uuid;
alter table public.saving_goals add column if not exists user_id uuid;
alter table public.contributions add column if not exists user_id uuid;
alter table public.paylaters add column if not exists user_id uuid;
alter table public.incomes add column if not exists user_id uuid;
alter table public.settings add column if not exists user_id uuid;

alter table public.orders alter column user_id set default auth.uid();
alter table public.expenses alter column user_id set default auth.uid();
alter table public.saving_goals alter column user_id set default auth.uid();
alter table public.contributions alter column user_id set default auth.uid();
alter table public.paylaters alter column user_id set default auth.uid();
alter table public.incomes alter column user_id set default auth.uid();
alter table public.settings alter column user_id set default auth.uid();

revoke all on table public.orders from anon;
revoke all on table public.expenses from anon;
revoke all on table public.saving_goals from anon;
revoke all on table public.contributions from anon;
revoke all on table public.paylaters from anon;
revoke all on table public.incomes from anon;
revoke all on table public.settings from anon;

grant select, insert, update, delete on table public.orders to authenticated;
grant select, insert, update, delete on table public.expenses to authenticated;
grant select, insert, update, delete on table public.saving_goals to authenticated;
grant select, insert, update, delete on table public.contributions to authenticated;
grant select, insert, update, delete on table public.paylaters to authenticated;
grant select, insert, update, delete on table public.incomes to authenticated;
grant select, insert, update, delete on table public.settings to authenticated;

drop policy if exists "Allow read orders" on public.orders;
drop policy if exists "Allow insert orders" on public.orders;
drop policy if exists "Allow update orders" on public.orders;
drop policy if exists "Allow delete orders" on public.orders;

drop policy if exists "Allow read expenses" on public.expenses;
drop policy if exists "Allow insert expenses" on public.expenses;
drop policy if exists "Allow update expenses" on public.expenses;
drop policy if exists "Allow delete expenses" on public.expenses;

drop policy if exists "Allow read saving_goals" on public.saving_goals;
drop policy if exists "Allow insert saving_goals" on public.saving_goals;
drop policy if exists "Allow update saving_goals" on public.saving_goals;
drop policy if exists "Allow delete saving_goals" on public.saving_goals;

drop policy if exists "Allow read contributions" on public.contributions;
drop policy if exists "Allow insert contributions" on public.contributions;
drop policy if exists "Allow update contributions" on public.contributions;
drop policy if exists "Allow delete contributions" on public.contributions;

drop policy if exists "Allow read paylaters" on public.paylaters;
drop policy if exists "Allow insert paylaters" on public.paylaters;
drop policy if exists "Allow update paylaters" on public.paylaters;
drop policy if exists "Allow delete paylaters" on public.paylaters;

drop policy if exists "Allow read incomes" on public.incomes;
drop policy if exists "Allow insert incomes" on public.incomes;
drop policy if exists "Allow update incomes" on public.incomes;
drop policy if exists "Allow delete incomes" on public.incomes;

drop policy if exists "Allow read settings" on public.settings;
drop policy if exists "Allow insert settings" on public.settings;
drop policy if exists "Allow update settings" on public.settings;
drop policy if exists "Allow delete settings" on public.settings;

create policy "Allow read orders"
on public.orders
for select
to authenticated
using (auth.uid() is not null and auth.uid() = user_id);

create policy "Allow insert orders"
on public.orders
for insert
to authenticated
with check (auth.uid() is not null and auth.uid() = user_id);

create policy "Allow update orders"
on public.orders
for update
to authenticated
using (auth.uid() is not null and auth.uid() = user_id)
with check (auth.uid() is not null and auth.uid() = user_id);

create policy "Allow delete orders"
on public.orders
for delete
to authenticated
using (auth.uid() is not null and auth.uid() = user_id);

create policy "Allow read expenses"
on public.expenses
for select
to authenticated
using (auth.uid() is not null and auth.uid() = user_id);

create policy "Allow insert expenses"
on public.expenses
for insert
to authenticated
with check (auth.uid() is not null and auth.uid() = user_id);

create policy "Allow update expenses"
on public.expenses
for update
to authenticated
using (auth.uid() is not null and auth.uid() = user_id)
with check (auth.uid() is not null and auth.uid() = user_id);

create policy "Allow delete expenses"
on public.expenses
for delete
to authenticated
using (auth.uid() is not null and auth.uid() = user_id);

create policy "Allow read saving_goals"
on public.saving_goals
for select
to authenticated
using (auth.uid() is not null and auth.uid() = user_id);

create policy "Allow insert saving_goals"
on public.saving_goals
for insert
to authenticated
with check (auth.uid() is not null and auth.uid() = user_id);

create policy "Allow update saving_goals"
on public.saving_goals
for update
to authenticated
using (auth.uid() is not null and auth.uid() = user_id)
with check (auth.uid() is not null and auth.uid() = user_id);

create policy "Allow delete saving_goals"
on public.saving_goals
for delete
to authenticated
using (auth.uid() is not null and auth.uid() = user_id);

create policy "Allow read contributions"
on public.contributions
for select
to authenticated
using (auth.uid() is not null and auth.uid() = user_id);

create policy "Allow insert contributions"
on public.contributions
for insert
to authenticated
with check (auth.uid() is not null and auth.uid() = user_id);

create policy "Allow update contributions"
on public.contributions
for update
to authenticated
using (auth.uid() is not null and auth.uid() = user_id)
with check (auth.uid() is not null and auth.uid() = user_id);

create policy "Allow delete contributions"
on public.contributions
for delete
to authenticated
using (auth.uid() is not null and auth.uid() = user_id);

create policy "Allow read paylaters"
on public.paylaters
for select
to authenticated
using (auth.uid() is not null and auth.uid() = user_id);

create policy "Allow insert paylaters"
on public.paylaters
for insert
to authenticated
with check (auth.uid() is not null and auth.uid() = user_id);

create policy "Allow update paylaters"
on public.paylaters
for update
to authenticated
using (auth.uid() is not null and auth.uid() = user_id)
with check (auth.uid() is not null and auth.uid() = user_id);

create policy "Allow delete paylaters"
on public.paylaters
for delete
to authenticated
using (auth.uid() is not null and auth.uid() = user_id);

create policy "Allow read incomes"
on public.incomes
for select
to authenticated
using (auth.uid() is not null and auth.uid() = user_id);

create policy "Allow insert incomes"
on public.incomes
for insert
to authenticated
with check (auth.uid() is not null and auth.uid() = user_id);

create policy "Allow update incomes"
on public.incomes
for update
to authenticated
using (auth.uid() is not null and auth.uid() = user_id)
with check (auth.uid() is not null and auth.uid() = user_id);

create policy "Allow delete incomes"
on public.incomes
for delete
to authenticated
using (auth.uid() is not null and auth.uid() = user_id);

create policy "Allow read settings"
on public.settings
for select
to authenticated
using (auth.uid() is not null and auth.uid() = user_id);

create policy "Allow insert settings"
on public.settings
for insert
to authenticated
with check (auth.uid() is not null and auth.uid() = user_id);

create policy "Allow update settings"
on public.settings
for update
to authenticated
using (auth.uid() is not null and auth.uid() = user_id)
with check (auth.uid() is not null and auth.uid() = user_id);

create policy "Allow delete settings"
on public.settings
for delete
to authenticated
using (auth.uid() is not null and auth.uid() = user_id);
