-- Let customers see credits added by email, even if the credits were added
-- after their auth user already existed.

update public.credit_ledger
set user_id = public.profiles.id
from public.profiles
where public.credit_ledger.user_id is null
  and lower(public.credit_ledger.email) = lower(public.profiles.email);

create or replace view public.credit_balances
with (security_invoker = true) as
select
  coalesce(public.credit_ledger.user_id, public.profiles.id)::text as account_key,
  coalesce(public.credit_ledger.user_id, public.profiles.id) as user_id,
  lower(public.credit_ledger.email) as email,
  coalesce(sum(amount), 0)::integer as credits_remaining
from public.credit_ledger
left join public.profiles
  on lower(public.profiles.email) = lower(public.credit_ledger.email)
group by coalesce(public.credit_ledger.user_id, public.profiles.id), lower(public.credit_ledger.email);

drop policy if exists "Users can read credit ledger matching email" on public.credit_ledger;
create policy "Users can read credit ledger matching email"
on public.credit_ledger for select
to authenticated
using (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));
