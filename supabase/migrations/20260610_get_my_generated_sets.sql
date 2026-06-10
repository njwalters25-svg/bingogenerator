-- Return the signed-in customer's saved generated sets.
-- Reopening a saved set does not spend credits.

create or replace function public.get_my_generated_sets()
returns table (
  id uuid,
  source_items jsonb,
  requested_count integer,
  cards jsonb,
  generation_snapshot jsonb,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    generated_sets.id,
    generated_sets.source_items,
    generated_sets.requested_count,
    generated_sets.cards,
    generated_sets.generation_snapshot,
    generated_sets.created_at
  from public.generated_sets
  where generated_sets.user_id = auth.uid()
  order by generated_sets.created_at desc
  limit 12;
$$;

grant execute on function public.get_my_generated_sets() to authenticated;
