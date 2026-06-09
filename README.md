# Bingo Card Generator

Static browser app for creating printable text-based bingo cards.

Phase 2 account and credit setup is being prepared in the `supabase/` and `docs/` folders.
The current generator still works without Supabase until login is wired into the app.

## Files

- `index.html` - app markup
- `styles.css` - screen and print styling
- `app.js` - card generation and controls
- `.htaccess` - prevents directory listing on Apache/cPanel hosting
- `robots.txt` and the `noindex` meta tag - discourages search indexing
- `supabase/schema.sql` - database schema for the future account/credit system
- `docs/SUPABASE_SETUP.md` - setup notes for Supabase, magic links, and Etsy credits

## Hosting

This app does not need a database or build step. Upload these files to a folder on your hosting account, for example:

`public_html/bingo/`

Then visit:

`https://yourdomain.com/bingo/`

## Access

For a simple paid Etsy product, use cPanel Directory Privacy / Password Protect Directory on the hosted folder. Put the link and shared password in the Etsy download PDF.

Keep the password stable if buyers are allowed to reuse the tool.

For the planned credit-based version, see `docs/SUPABASE_SETUP.md`.
