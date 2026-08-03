# Cloud sync and automatic updates

## Supabase sync

1. Create a Supabase project.
2. Open **SQL Editor** and run `supabase_setup.sql`.
3. In the app, open **Sincronização / Cloud sync**.
4. Paste:
   - Project URL
   - Publishable key (or legacy anon key)
   - Email and password
5. Create an account or sign in.
6. Upload or download your save.

Never paste a `service_role` or secret API key into the browser app.

The SQL enables RLS and restricts every row to `auth.uid() = user_id`.

## Automatic guide updates

The app reads `updates.json`. When you publish a newer app:
1. Replace the app files.
2. Increase the version in `updates.json`.
3. Set `download_url` to the new ZIP or release page.

## ATM10 updates

- With a CurseForge API key, the app checks CurseForge project ID `925200`.
- Without a key, it checks the official ATM-10 GitHub changelog.
- The check runs at most once every 24 hours when online.
