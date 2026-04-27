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

## Access Control Choices

Best simple setup:

- One shared password.
- Keep it stable so buyers can reuse the tool.
- Put the password in the Etsy download PDF.

More controlled later:

- Add a small backend for access codes.
- Keep old codes valid for existing buyers.
- Only do this if the product sells enough to justify the admin and development.
