# Supabase Setup

This is the account and credit foundation for the bingo generator.

## What This Adds

- Magic-link customer accounts
- Saved draft projects
- Saved generated card sets
- Credit ledger for purchases and generation use
- Etsy order tracking foundation

The current app can still run without Supabase while this is being set up.

## Create the Supabase Project

1. Go to Supabase and create a new project.
2. Choose a project name such as `bingo-generator`.
3. Save the project URL and anon public key from **Project Settings > API**.
4. Do not put the service role key in the app or GitHub repository.

## Run the Schema

1. Open **SQL Editor** in Supabase.
2. Open `supabase/schema.sql` from this repository.
3. Paste the full SQL into Supabase.
4. Run it.

This creates:

- `profiles`
- `projects`
- `generated_sets`
- `credit_ledger`
- `etsy_products`
- `etsy_orders`
- `credit_balances`

## Auth Settings

In **Authentication > Providers**, enable email login.

Use magic links, not passwords.

In **Authentication > URL Configuration**, add your site URL, for example:

`https://bingogenerator.alloccasionsprintables.com`

Also add local development URLs if needed:

`http://localhost:8765`

## App Config

Copy:

`supabase/config.example.js`

to:

`supabase/config.js`

Then replace the placeholder values with your Supabase project URL and anon key.

Important:

- `config.js` contains only the public anon key.
- The anon key is safe to be loaded by the browser.
- Never add the service role key to browser files.

## Credit Rules

Credits should be added and spent through Edge Functions later.

Customers should be able to:

- log in without using credits
- create and edit drafts without using credits
- print or download an existing generated set without using credits

Customers should use one credit only when a new generated set is successfully created and saved.

## Etsy Product Mapping

Later, each Etsy listing ID should be added to `etsy_products`.

Example:

```sql
insert into public.etsy_products (listing_id, name, credits)
values
  ('YOUR_STARTER_LISTING_ID', 'Starter Pack', 3),
  ('YOUR_PARTY_LISTING_ID', 'Party Pack', 10),
  ('YOUR_EVENT_LISTING_ID', 'Event Pack', 50);
```

## Make.com Flow Later

Make should:

1. Detect a paid Etsy order.
2. Send the Etsy receipt ID, buyer email, and listing ID to a Supabase Edge Function.
3. Let Supabase decide the number of credits from `etsy_products`.
4. Insert the Etsy order and credit ledger row once only.
5. Send the customer their access instructions.

Do not let Make send an arbitrary credit amount directly into the database.
