-- Clear manually set test dates of birth so members can enter their own.
-- Run in Supabase SQL Editor.

-- Option A: specific emails (edit the list)
-- UPDATE public.profiles
-- SET date_of_birth = NULL,
--     last_birthday_reward_year = NULL
-- WHERE email IN (
--   'testuser@example.com',
--   'another@example.com'
-- );

-- Option B: everyone who currently has a DOB saved
-- UPDATE public.profiles
-- SET date_of_birth = NULL,
--     last_birthday_reward_year = NULL
-- WHERE date_of_birth IS NOT NULL;

-- Preview who would be affected (run this first)
SELECT id, email, full_name, date_of_birth, last_birthday_reward_year
FROM public.profiles
WHERE date_of_birth IS NOT NULL
ORDER BY email;
