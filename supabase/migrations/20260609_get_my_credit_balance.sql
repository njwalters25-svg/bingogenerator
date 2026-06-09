-- Robust customer credit lookup for the logged-in user.
-- This counts credits linked by user_id or by the signed-in email address.

create or replace function public.get_my_credit_balance()
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(sum(amount), 0)::integer
  from public.credit_ledger
  where user_id = auth.uid()
    or lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''));
$$;

grant execute on function public.get_my_credit_balance() to authenticated;
