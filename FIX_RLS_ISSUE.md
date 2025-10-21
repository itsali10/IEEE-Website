# 🚨 URGENT: Fix Row Level Security (RLS) Issue

## The Problem

The `fetchProfile` query is **timing out** (>5 seconds), which means Supabase RLS is likely **blocking** the query.

You can see this error in the console:
```
[Auth] fetchProfile - query taking longer than 10 seconds...
```

## ✅ Solution: Fix RLS Policy

Go to **Supabase Dashboard** → **SQL Editor** and run this:

### Option 1: Allow Authenticated Users to Read Their Own Profile

```sql
-- Drop any existing conflicting policies
DROP POLICY IF EXISTS "Allow authenticated users to read student profiles" ON student;
DROP POLICY IF EXISTS "Users can read own profile" ON student;

-- Create policy to allow authenticated users to read any student profile
CREATE POLICY "Allow authenticated users to read all student profiles"
ON student
FOR SELECT
TO authenticated
USING (true);
```

### Option 2: Temporarily Disable RLS (Quick Fix)

```sql
-- WARNING: This disables security - only for development!
ALTER TABLE student DISABLE ROW LEVEL SECURITY;
```

### Option 3: Allow Users to Read Only Their Own Profile

```sql
-- More secure: Users can only read their own profile
CREATE POLICY "Users can read own profile"
ON student
FOR SELECT
TO authenticated
USING (auth.uid() = id);
```

---

## 🧪 How to Test After Fixing

1. **Run the SQL** in Supabase SQL Editor
2. **Refresh your browser** (F5)
3. **Watch the console** for:
   ```
   [Auth] fetchProfile - result: Found
   [Auth] Has elevated access: true
   [Tasks] Found 2 members
   ```

4. **The loading should complete** in under 1 second

---

## 🔍 Why This Happens

1. You login → Supabase creates an auth session
2. App tries to fetch your profile from `student` table
3. **RLS blocks the query** because no policy allows it
4. Query hangs for 10+ seconds
5. Members can't load because profile isn't loaded

---

## ⚡ Recommendation

Use **Option 1** above - it's the most practical for a task management system where officers need to see all committee members.

After running the SQL, everything should load instantly! 🚀

