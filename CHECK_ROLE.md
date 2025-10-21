# 🔍 Check Your User's Role Value

## Run This in Supabase SQL Editor

```sql
-- Check what role value your user actually has
SELECT email, role, committee 
FROM student 
WHERE email = 'ali@gmail.com';  -- Replace with YOUR email
```

## Expected Results

Your role should be **one of these** (case-insensitive):
- `'officer'`
- `'board'` 
- `'OFFICER'`
- `'BOARD'`

## ❌ If Your Role Shows Something Different

Like `'admin'`, `'Admin'`, `'ADMIN'`, or anything else, you need to update it:

```sql
-- Update your role to 'board' (or 'officer')
UPDATE student 
SET role = 'board'  -- or 'officer'
WHERE email = 'ali@gmail.com';  -- Replace with YOUR email
```

## ✅ Then Test Again

1. Logout
2. Clear cache (F12 → Application → Clear site data)
3. Login again
4. Should work! ✅

---

## 🔍 Debug: Check Console Logs

After login, look for this in the browser console:

```
[Auth] Login - profile role: YOUR_ROLE_HERE
[Auth] Login - has elevated access: true/false
```

If it says `false`, your role value doesn't match `'officer'` or `'board'`.

