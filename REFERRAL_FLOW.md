# Referral flow and code map

Referrals are **created in the database when the user is created** (on signup), not when they first open a session. The app passes the referrer in signup metadata; a DB trigger on `auth.users` inserts the referral row and awards 100 pts.

---

## End-to-end flow

1. **Referrer shares link**  
   Link: `/#/login?ref=<referrer_user_id>` (see Dashboard).

2. **Friend opens link**  
   `App.tsx` → `PersistReferralRef` saves `ref` to `sessionStorage` so it survives navigation to Login.

3. **Friend signs up**  
   On Login, `getReferrerIdFromUrl()` reads `ref` from URL or sessionStorage.  
   `signUp(email, password, { name, referrer_id })` is called so `referrer_id` is stored in **user metadata** in `auth.users`.

4. **User created in DB**  
   Supabase inserts a row into `auth.users`.  
   **Trigger** `on_auth_user_created_referral` (AFTER INSERT) runs:
   - Reads `referrer_id` from `NEW.raw_user_meta_data`.
   - Inserts one row into `public.referrals` (referrer_id, referred_user_id, referred_email, status `completed`).
   - Calls `update_user_points(referrer_id, 100, 'bonus', ...)` so the referrer gets 100 pts.

5. **After login**  
   `RewardsContext` runs `processReferralFromMetadata`: it only **clears** `sessionStorage` and `user_metadata.referrer_id` and refreshes points. It does **not** create the referral (trigger already did).

---

## Where referral is managed (code)

| Step | File | What it does |
|------|------|----------------|
| Persist `ref` from URL | `src/App.tsx` | `PersistReferralRef`: on route change, if `?ref=...` in URL, saves to `sessionStorage` key `peplab_ref`. |
| Signup with referrer | `src/pages/Login.tsx` | `getReferrerIdFromUrl()`: reads `ref` from hash query or sessionStorage. `handleMemberSubmit` (signup): calls `signUp(..., { name, referrer_id })` when ref is present. `clearStoredRef()` after signup. |
| Create referral at user creation | **DB** `supabase_referrals.sql` | Trigger `on_auth_user_created_referral` on `auth.users` AFTER INSERT: inserts into `referrals`, calls `update_user_points` for 100 pts. Function `referral_on_auth_user_created()`. |
| Cleanup after login | `src/context/RewardsContext.tsx` | `processReferralFromMetadata(user)`: if user has `referrer_id` in metadata or `peplab_ref` in sessionStorage, removes both and refreshes points. Does **not** call any create-referral RPC. |
| Referral list + link | `src/pages/Dashboard.tsx` | Referral link: `/#/login?ref=${userId}`. Loads list via `getReferrals(userId)` from Supabase. |
| DB helpers | `src/lib/supabase-db.ts` | `getReferrals(referrerId)`: SELECT from `referrals`. `create_referral_and_award` RPC and `insertReferral` exist for legacy/fallback; **primary path is the trigger**. |

---

## SQL to run (Supabase)

- **`supabase_referrals.sql`**  
  - Table `referrals`, RLS, indexes.  
  - RPC `create_referral_and_award` (used only if you ever need to create a referral from the client; trigger is the main path).  
  - Function `public.referral_on_auth_user_created()` and trigger `on_auth_user_created_referral` on `auth.users`.

The trigger runs with **SECURITY DEFINER** so it can insert into `referrals` and call `update_user_points` without a client session. No need to wait for “create session”; the referral is created as soon as the user row is inserted.

---

## Duplicate protection

- Unique index `idx_referrals_referrer_referred` on `(referrer_id, referred_user_id)` prevents duplicate referral rows.
- Trigger and RPC both catch `unique_violation` and return without failing.

---

## Summary

- **When** is the referral created? When the **user is created** (INSERT into `auth.users`), via the trigger.
- **Where** is the referrer id set? In **Login** at signup, in `signUp(..., { referrer_id })`.
- **Where** is the referral row and 100 pts written? In the **DB trigger** in `supabase_referrals.sql`.
- **Client** only: persist `ref`, pass it at signup, then clear ref and refresh points after login.
