# دیوان — Dewan: a Pashto Poetry Website

A complete website like Rekhta.org, for Pashto poetry. Visitors read poems, browse poets, listen to recitations, watch videos, download PDF books, copy verses and send feedback. You manage everything from a private, password-protected Admin panel.

**Built with:** Next.js + Tailwind CSS (website) · Supabase (database, login, file storage) · Vercel (hosting). All have free plans.

> You do **not** need to know programming. Follow the parts in order. Each part takes 5–15 minutes. Total: about one hour.

---

## What you will need

| Account | Used for | Link |
|---|---|---|
| **GitHub** | Stores your code so Vercel can publish it | github.com |
| **Supabase** | Database, admin login, uploaded files | supabase.com |
| **Vercel** | Puts the website on the internet | vercel.com |
| **Resend** (optional) | Emails you the feedback | resend.com |

Sign up for each with the same email address. Keep a notes file open: you will copy a few keys between websites.

---

## Part 1 — Create the database (Supabase)

1. Go to **supabase.com** → **Start your project** → sign in → **New project**.
2. Name it `dewan`, create a **database password** (save it in your notes), choose the region closest to your visitors, and click **Create new project**. Wait ~2 minutes.
3. In the left menu click **SQL Editor** → **New query**.
4. Open the file `supabase/schema.sql` from this project, copy **everything**, paste it into the editor and click **Run**. You should see “Success”.
   This creates the tables (poets, poetry, couplets, media, settings, feedback), the security rules, and the file storage bucket called `media`.
5. *(Optional)* Do the same with `supabase/seed_optional.sql` to add two sample poets.

### Get your keys

6. Click the **gear icon → Project Settings → API** (newer dashboards: **API Keys**). Copy into your notes:
   - **Project URL** (looks like `https://abcdxyz.supabase.co`)
   - **anon / public key** (newer name: *Publishable key*)
   - **service_role key** (newer name: *Secret key*). Click “Reveal”. **This one is very secret.**

---

## Part 2 — Login settings (Supabase)

1. **Stop strangers from registering:** left menu **Authentication → Sign In / Providers** (or *Settings*) → switch **off** “Allow new users to sign up”. (Even if you forget, the database rules still stop non-admins from changing anything.)
2. **Make password-reset emails work from any device:** **Authentication → Emails** (or *Email Templates*) → **Reset Password**. Replace the link in the template with:
   ```html
   <h2>Reset your password</h2>
   <p><a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/admin/reset-password">Choose a new password</a></p>
   ```
   Save it.
3. You will fill in **Authentication → URL Configuration** after Part 5, when you know your website address.

---

## Part 3 — Make yourself the admin

1. **Authentication → Users → Add user → Create new user.** Enter your email and a strong password (at least 10 characters), tick **Auto Confirm User**, and create it.
2. Go to **SQL Editor → New query**, paste this (change the email to yours) and **Run**:
   ```sql
   insert into public.admin_users (user_id)
   select id from auth.users where email = 'YOUR-EMAIL@example.com';
   ```
   It should say “Success. 1 row affected”. Only people in this list can ever change data.

Your password is stored by Supabase in hashed (scrambled, irreversible) form. It is never in your code.

---

## Part 4 — Put the code on GitHub

1. Unzip this project on your computer.
2. On **github.com** click **+ → New repository**. Name it `dewan`, choose **Private**, click **Create repository**.
3. On the next page click **“uploading an existing file”**. Drag **all the files and folders inside the `dewan` folder** (`src`, `supabase`, `package.json`, etc.) into the page. Wait for the upload to finish, then click **Commit changes**.
   - Do **not** upload a file named `.env.local` (it holds secrets). This project does not contain one, so you are fine.
   - Check that the `src` folder shows on GitHub. If a file with a dot name such as `.gitignore` is missing, that is OK.

---

## Part 5 — Publish the website (Vercel)

1. Go to **vercel.com** → **Sign up with GitHub** → **Add New… → Project** → **Import** your `dewan` repository.
2. Open **Environment Variables** and add these (names must match exactly):

   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | Project URL from Part 1 |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon / publishable key |
   | `SUPABASE_SERVICE_ROLE_KEY` | service_role / secret key |
   | `NEXT_PUBLIC_SITE_URL` | leave `http://localhost:3000` for now |
   | `RESEND_API_KEY` | *(optional, Part 6)* |
   | `FEEDBACK_FROM_EMAIL` | `Dewan <onboarding@resend.dev>` |

3. Click **Deploy**. After ~2 minutes you get an address like `https://dewan-abc.vercel.app`.
4. **Tell the site its real address:**
   - In Vercel: **Settings → Environment Variables** → edit `NEXT_PUBLIC_SITE_URL` to your real address (e.g. `https://dewan-abc.vercel.app`), then **Deployments → ⋯ → Redeploy**.
   - In Supabase: **Authentication → URL Configuration** → set **Site URL** to the same address, and under **Redirect URLs** add `https://dewan-abc.vercel.app/**` (and `http://localhost:3000/**` if you will test on your computer). Save.

Open your address: the public site is live. Add `/admin` to the end to reach the Admin login.

---

## Part 6 — Feedback emails (optional, free)

Feedback is **always saved** in the database and shown under **Admin → Feedback**. To also get an email:

1. Sign up at **resend.com** with the email address where you want the feedback.
2. **API Keys → Create API Key** → copy it → paste into Vercel as `RESEND_API_KEY` → Redeploy.
3. In your site: **Admin → Settings → Feedback email** → type the address → **Save settings**.

**Important:** until you verify your own domain at Resend, Resend only delivers to the email you signed up with. To send to any address, add a domain at Resend (**Domains**) and change `FEEDBACK_FROM_EMAIL` to something like `Dewan <feedback@yourdomain.com>`.

---

## Part 7 — Using the Admin panel

Go to `your-site/admin` and sign in.

- **Settings:** feedback email, “About the Developer” (photo, name, bio in 3 languages), featured poet, Couplet of the Day choice.
- **Poets → New poet:** names, born/died, biography, profile picture. After saving, the same page lets you add audio, PDFs and videos about the poet.
- **Poetry → New poem:** pick poet and type (Ghazal, Nazam, Tappa, Rubai, Charbeta, Landay, Marsia, Naat, Other). Write one line per line; leave a blank line between couplets. After saving, add **audio recitations, image poetry, YouTube/Vimeo links, PDF books**.
- **Couplets:** add couplets. Each day the home page shows a different one automatically. Press **Feature on home page** to choose one yourself, or **Stop manual feature** to go back to automatic.
- **Feedback:** read, mark as read, delete.
- **Forgot password?** link on the login page emails you a reset link.

Uploads: pictures, audio (MP3/M4A/WAV/OGG) and PDFs up to **50 MB each**. Compress larger audio first.

### Languages
Every poet, poem, couplet and the developer page can have **Pashto script**, **Roman Pashto** and **English** versions. Visitors choose a language at the top of the site. If a version is missing, the site falls back to Pashto script, then Roman, then English.

---

## Part 8 — Try it on your own computer (optional)

1. Install **Node.js** (LTS) from nodejs.org.
2. In the project folder copy `.env.local.example` to `.env.local` and fill in the values.
3. Open a terminal in the folder and run:
   ```
   npm install
   npm run dev
   ```
4. Open http://localhost:3000

Any later code change you upload to GitHub is redeployed by Vercel automatically. **Your data lives in Supabase, a separate service, so updating the code never deletes it.**

---

## Changing words on the website

All menu and button text (in the three languages) is in `src/lib/i18n.ts`. Roman Pashto spelling is not standardised, so please read the Roman lines and correct anything you prefer. Colors are in `tailwind.config.ts`.

---

## Folder map

```
dewan/
├─ supabase/schema.sql          ← database + security + storage (run once)
├─ supabase/seed_optional.sql   ← two sample poets
├─ .env.local.example           ← the keys you need (copy to .env.local)
├─ src/
│  ├─ middleware.ts             ← first gate: /admin needs login
│  ├─ lib/                      ← languages, Supabase clients, helpers
│  ├─ components/               ← header, cards, poem viewer, media, admin forms
│  └─ app/
│     ├─ (site)/                ← public pages: home, poets, poetry, search, about, contact
│     ├─ admin/                 ← login, forgot/reset password, dashboard & management pages
│     ├─ auth/                  ← password-reset links and sign-out
│     └─ api/feedback/          ← receives feedback, saves it, emails you
```

---

## How your data is protected

- **Passwords** are handled only by Supabase Auth (hashed). They are not in the code.
- **Three locks on `/admin`:** (1) middleware requires a login, (2) the admin pages re-check the login on the server, (3) the database itself only accepts changes from accounts listed in `admin_users` (Row Level Security). A hacked browser still cannot write data.
- **Public visitors** can only *read* poets, poetry, couplets and media. They can never read the feedback email address or feedback messages.
- **The secret key** (`SUPABASE_SERVICE_ROLE_KEY`) is used only inside the feedback server code. Never paste it into a chat, a screenshot or GitHub. If it leaks, create a new one in Supabase and update Vercel.
- Feedback has a hidden spam trap and a limit of 5 messages per visitor per 10 minutes. Uploads are restricted to images, audio and PDFs.

## Good to know about the free plans

- Supabase free projects are **paused after about a week with no activity**. Log in to Supabase and click **Restore** if that happens; your data is kept. Visiting the admin panel now and then avoids it.
- The free plan has **no downloadable backups**. Once in a while open **Table Editor**, choose a table and export it as CSV (or ask for help with a full backup). Keep original files of audio and PDFs on your computer too.
- Vercel’s free *Hobby* plan is meant for personal, non-commercial projects.

---

## Troubleshooting

| Problem | What to do |
|---|---|
| Site shows “Something went wrong” | A Vercel environment variable is missing or mistyped. Check Part 5, then **Redeploy**. |
| Login says “Incorrect email or password” | Check the user exists in **Authentication → Users**. Use **Forgot password**. |
| After login: “Not an admin account” | Run the SQL in Part 3, step 2, with the exact email you log in with. |
| “Permission denied” when saving | Same cause as above. |
| Upload fails | File over 50 MB, or wrong type (only JPG/PNG/WebP/GIF, MP3/M4A/WAV/OGG/AAC, PDF). |
| Reset email never arrives | Check spam. Supabase’s built-in email allows only a few messages per hour. Wait and try again. |
| Reset link says “expired” | Request a new link (links work once and expire). Make sure Part 2 step 2 and Part 5 step 4 are done. |
| “Can’t delete poet” | Delete or reassign that poet’s poems first. This protects you from losing poems by accident. |
| Feedback email not arriving | Is `RESEND_API_KEY` set, a feedback email saved in Settings, and (for addresses other than your Resend login) a verified domain? Messages are still in **Admin → Feedback**. |
