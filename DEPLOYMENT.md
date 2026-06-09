# Deployment Notes

## Recommended First Launch

1. Create a subfolder or subdomain, for example `bingo.yourdomain.com` or `yourdomain.com/bingo`.
2. Upload the app files to that folder.
3. In cPanel, use Directory Privacy / Password Protect Directory for the app folder.
4. Add the app link and password to your Etsy instant-download PDF.
5. In the Etsy listing, say it is for personal use only.

## GitHub + cPanel

If using GitHub with cPanel Git Version Control:

1. Create a private GitHub repository.
2. Push this folder to GitHub.
3. In cPanel, open Git Version Control.
4. Clone the repository into a non-public repo folder.
5. Deploy the files into your public app folder.

cPanel deployments usually use a `.cpanel.yml` file. The exact deploy path depends on your cPanel username and desired folder, so use the example below and replace the path.

```yaml
---
deployment:
  tasks:
    - export DEPLOYPATH=/home/YOUR_CPANEL_USERNAME/public_html/bingo/
    - /bin/cp index.html $DEPLOYPATH
    - /bin/cp styles.css $DEPLOYPATH
    - /bin/cp app.js $DEPLOYPATH
    - /bin/cp .htaccess $DEPLOYPATH
    - /bin/cp robots.txt $DEPLOYPATH
```

## Automatic Deploys with GitHub Actions

This repo includes an optional GitHub Actions workflow at `.github/workflows/deploy-cpanel.yml`.
When it is configured, every push to `main` will ask cPanel to:

1. Update the cPanel-managed repository from GitHub.
2. Deploy the HEAD commit using `.cpanel.yml`.

In GitHub, open the repository, then go to **Settings > Secrets and variables > Actions**.

Add these **Repository secrets**:

- `CPANEL_HOST` or `CPANEL_DOMAIN` - your cPanel server host, without `https://` and without `:2083`
- `CPANEL_USERNAME` - your cPanel username, for example `simpxlow`
- `CPANEL_API_TOKEN` - a cPanel API token created in cPanel
- `CPANEL_REPOSITORY_ROOT` or `CPANEL_PATH` - the cPanel Git repository path, for example `/home/simpxlow/repositories/bingogenerator`

If you already use the names `CPANEL_DOMAIN`, `CPANEL_PATH`, `CPANEL_USERNAME`, and `CPANEL_API_TOKEN`
in another repository, you can use those same names here. For this workflow, `CPANEL_PATH` must be the
cPanel Git repository path, not the public website folder.

Optional **Repository variable**:

- `CPANEL_BRANCH` - defaults to `main`, so you only need this if your deployed branch changes.

To create the API token in cPanel:

1. Open **Manage API Tokens**.
2. Create a new token called something like `github-bingo-deploy`.
3. Copy it immediately and paste it into the GitHub secret `CPANEL_API_TOKEN`.

Keep using `.cpanel.yml` for the actual file-copy instructions. The workflow simply replaces the manual
**Update from Remote** and **Deploy HEAD Commit** clicks.

## Access Control Choices

Best simple setup:

- One shared password.
- Keep it stable so buyers can reuse the tool.
- Put the password in the Etsy download PDF.

More controlled later:

- Add Supabase magic-link accounts.
- Add credit-based generation through Supabase Edge Functions.
- Use Make.com to add credits from Etsy purchases.
- See `docs/SUPABASE_SETUP.md` for the planned setup.
