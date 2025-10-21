# Board & Officer Access Setup Guide

## Overview

The authentication system has been updated so that **only Board members and Officers can log in** and access the `/tasks` page.

## How Board/Officer Detection Works

1. When a user logs in with email/password, the system:
   - Authenticates via Supabase Auth
   - Fetches the user's profile from the `student` table by matching email
   - Checks if `role` column equals `"board"` OR `"officer"` (case-insensitive)
   - If not board/officer: signs them out immediately with error "Access denied. Officers and Board members only."

2. The `/tasks` route is protected:
   - Only authenticated board members and officers can access it
   - Regular members are redirected to `/login`

## Database Requirements

### 1. Student Table Must Have:

```sql
-- Required columns in 'student' table
- id (uuid, primary key)
- email (text) - matches auth.users email
- role (text) - must be 'board' or 'officer' for elevated access
- full_name (text) - display name
- student_id (text) - student ID number
- committee (text) - user's committee
- username (text, unique) - username for the system
```

### 2. Create Board/Officer Users

In Supabase SQL Editor:

```sql
-- First, create auth user
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
VALUES (
  'officer@example.com',
  crypt('YourSecurePassword', gen_salt('bf')),
  now()
);

-- Then, create student profile with officer role
INSERT INTO student (id, email, full_name, student_id, role, committee, username)
VALUES (
  gen_random_uuid(),
  'officer@example.com',
  'Officer Name',
  'A12345',
  'officer',  -- Can be 'officer' or 'board'
  'Events',  -- Their committee
  'officername'
);
```

### 3. Task Assignees Table

```sql
-- Create task_assignees junction table
CREATE TABLE IF NOT EXISTS task_assignees (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id uuid REFERENCES task(id) ON DELETE CASCADE,
  student_id uuid REFERENCES student(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(task_id, student_id)
);

-- Enable RLS
ALTER TABLE task_assignees ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated board/officers to manage assignments
CREATE POLICY "Allow board and officers to manage task assignees"
ON task_assignees
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
```

## Row Level Security (RLS) Policies

### For `student` table:

```sql
-- Allow authenticated users to read student profiles
CREATE POLICY "Allow authenticated to read students"
ON student FOR SELECT
TO authenticated
USING (true);
```

### For `task` table:

```sql
-- Already created in TASK_DATABASE_SETUP.md
-- Allows authenticated board members and officers to create/view/update/delete tasks
```

### For `task_assignees` table:

```sql
-- See above - allows board and officers to assign tasks to members
```

## Features

### Board & Officer Login
- Navigate to `/login`
- Enter board/officer credentials
- If email exists in `student` table with `role = 'board'` or `'officer'`: ✅ Login successful
- If not board/officer or no profile: ❌ "Access denied. Officers and Board members only."

### Tasks Page
When logged in as board member or officer:

1. **User Info Banner**
   - Shows logged-in email
   - Shows user's committee

2. **Create Task Form**
   - Title, Description, Due Date, Priority, Attachment URL
   - All standard validations

3. **Member Selection (NEW!)**
   - Automatically fetches all members in the same committee
   - Shows checkboxes with:
     - Member name
     - Student ID
   - Select members to assign the task to
   - On task creation, inserts rows into `task_assignees`

## Testing

### 1. Create Test Officer

```sql
-- Create auth user
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
VALUES ('test.officer@aast.edu', crypt('OfficerPass123', gen_salt('bf')), now());

-- Create officer profile
INSERT INTO student (id, email, full_name, student_id, role, committee, username)
VALUES (
  gen_random_uuid(),
  'test.officer@aast.edu',
  'Test Officer',
  'A00001',
  'officer',
  'Events',
  'testofficer'
);
```

### 2. Create Test Committee Members

```sql
-- Create regular members in same committee
INSERT INTO student (id, email, name, studentId, committee)
VALUES
  (gen_random_uuid(), 'member1@aast.edu', 'John Doe', 'S12345', 'Events'),
  (gen_random_uuid(), 'member2@aast.edu', 'Jane Smith', 'S12346', 'Events'),
  (gen_random_uuid(), 'member3@aast.edu', 'Bob Johnson', 'S12347', 'Events');
```

### 3. Test Login

1. Go to `/login`
2. Enter: `test.officer@aast.edu` / `OfficerPass123`
3. Should redirect to `/tasks`
4. Should see "Committee: Events"
5. Should see 3 members with checkboxes

### 4. Create Task

1. Fill in task details
2. Check 1 or more members
3. Click "Create Task"
4. Check Supabase:
   - New row in `task` table
   - New rows in `task_assignees` for each selected member

## Troubleshooting

### "Access denied. Officers and Board members only."
- User's email exists in `auth.users` but not in `student` table
- OR `role` field is not 'board' or 'officer' (case-insensitive)
- **Solution:** Insert/update the student record with `role = 'officer'` or `role = 'board'`

### "No members found in your committee"
- User's profile has no committee field set
- OR no other members have matching committee
- **Solution:** 
  - Set committee on the officer/board profile
  - Add members with same committee value

### White screen / App won't load
1. Open browser DevTools (F12) > Console tab
2. Look for error messages
3. Common fixes:
   - Clear browser cache
   - Delete `node_modules/.cache`
   - Restart dev server: `npm start`
   - Check `.env` file has correct Supabase credentials

### "Failed to load members for your committee"
- Supabase query failed (check browser console)
- RLS policy blocking select on `student` table
- **Solution:** Create policy to allow authenticated users to read students

## Member Checkbox Implementation

The member selection works as follows:

1. **On page load:**
   - Reads logged-in user's committee from profile
   - Queries `student` table for all rows where committee matches
   - Displays as scrollable list with checkboxes

2. **On task creation:**
   - Creates task in `task` table
   - For each checked member:
     - Inserts row into `task_assignees` with `task_id` and `student_id`

3. **Assumptions:**
   - Committee field name might vary (handles multiple possibilities)
   - Student ID might be `studentId` or `student_id`
   - Name might be `name`, `full_name`, or `FullName`

## Next Steps

### Recommended Enhancements

1. **Task Dashboard**
   - View all tasks
   - Filter by priority, status, assigned members
   - Mark tasks complete

2. **Edit/Delete Tasks**
   - Update task details
   - Reassign members
   - Delete tasks

3. **Member View**
   - Allow members to see their assigned tasks
   - Mark tasks as done
   - Add comments/updates

4. **Notifications**
   - Email members when assigned a task
   - Remind about due dates
   - Notify on status changes

## Summary

✅ Only board members and officers can log in
✅ Role detected from `student.role` column (accepts 'board' or 'officer')
✅ `/tasks` protected for board/officers only  
✅ Shows logged-in user's committee  
✅ Fetches committee members automatically  
✅ Displays members with names and student IDs  
✅ Creates task and assigns to selected members  
✅ All changes saved to Supabase  

---

For more info, see:
- `SUPABASE_SETUP.md` - Initial Supabase configuration
- `AUTHENTICATION_GUIDE.md` - Auth system overview
- `TASK_DATABASE_SETUP.md` - Task table setup

