-- Spend one credit and save the generated card arrangement.
-- Previewing, editing, printing, downloading, and reprinting do not call this.

create or replace function public.create_generated_set_with_credit(
  p_generated_set_id uuid,
  p_project_id uuid,
  p_source_items jsonb,
  p_requested_count integer,
  p_cards jsonb,
  p_generation_snapshot jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  current_email text := lower(coalesce(auth.jwt() ->> 'email', ''));
  current_balance integer;
  new_balance integer;
begin
  if auth.uid() is null then
    raise exception 'You must be signed in to generate bingo cards.';
  end if;

  if p_requested_count < 1 or p_requested_count > 300 then
    raise exception 'Card count must be between 1 and 300.';
  end if;

  select coalesce(sum(amount), 0)::integer
  into current_balance
  from public.credit_ledger
  where user_id = auth.uid()
    or lower(email) = current_email;

  if current_balance < 1 then
    raise exception 'You do not have enough credits to generate a new bingo set.';
  end if;

  insert into public.generated_sets (
    id,
    project_id,
    user_id,
    source_items,
    requested_count,
    cards,
    generation_snapshot
  )
  values (
    p_generated_set_id,
    p_project_id,
    auth.uid(),
    p_source_items,
    p_requested_count,
    p_cards,
    p_generation_snapshot
  )
  on conflict (id) do nothing;

  insert into public.credit_ledger (
    user_id,
    email,
    amount,
    reason,
    source,
    source_ref,
    metadata
  )
  values (
    auth.uid(),
    current_email,
    -1,
    'Generated bingo set',
    'generation',
    p_generated_set_id::text,
    jsonb_build_object('requested_count', p_requested_count)
  )
  on conflict (source, source_ref) where source_ref is not null do nothing;

  select coalesce(sum(amount), 0)::integer
  into new_balance
  from public.credit_ledger
  where user_id = auth.uid()
    or lower(email) = current_email;

  return jsonb_build_object(
    'generated_set_id', p_generated_set_id,
    'credits_remaining', new_balance
  );
end;
$$;

grant execute on function public.create_generated_set_with_credit(uuid, uuid, jsonb, integer, jsonb, jsonb) to authenticated;
