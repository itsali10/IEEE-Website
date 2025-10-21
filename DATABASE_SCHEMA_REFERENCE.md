# Database Schema Reference

## ✅ Updated Code Matches Your Schema

### Student Table Columns
- `id` - UUID (PK, references auth.users)
- `student_id` - text (university ID)
- `full_name` - text
- `email` - text
- `committee` - text
- `role` - text (values: `'officer'`, `'board'`, `'member'`)

### Board & Officer Access
**Who can log in:** Users with `role = 'officer'` OR `role = 'board'`

### Task Table Columns
- `id` - UUID (PK)
- `title` - text
- `description` - text
- `due_date` - date
- `task_attachment` - text
- `priority` - text

### Task Assignees Table
- `task_id` - UUID (FK to task.id)
- `student_id` - UUID (FK to student.id)

## 🔧 What Was Updated

1. **AuthContext.js** - Now checks for `role = 'officer'` OR `'board'`
2. **Tasks.js** - Uses correct column names: `full_name`, `student_id`
3. **Login.js** - Updated error messages to say "Officers and Board members"

## 🧪 Testing Checklist

1. **Clear Session First**
   - Go to: http://localhost:3000/clear-session.html
   - Or press F12 → Console → Run: `localStorage.clear(); location.reload();`

2. **Test Login**
   - Make sure your test user has `role = 'officer'` or `'board'` in the `student` table
   - Login should work without "Access denied" alerts

3. **Test Member Fetching**
   - After login, go to `/tasks`
   - Check browser console for:
     ```
     [Auth] Login - profile role: officer
     [Auth] Login - has elevated access: true
     [Tasks] Fetching members for committee: Events
     [Tasks] Found members: 5
     ```

4. **Verify Members Display**
   - Should show checkboxes with member names and student IDs
   - Only members from the same committee as the logged-in officer/board member

## 🐛 Troubleshooting

### "No members found"
- Check that other students have the same `committee` value in the database
- Example: If admin is in "Events", other students need `committee = 'Events'`

### "Access denied" still showing
- Verify the user's `role` is exactly `'officer'` or `'board'` (case-insensitive)
- Check console logs for actual role value showing as `[Auth] Login - has elevated access: true`

### Logout button still visible after restart
- Browser localStorage persists between server restarts
- Use clear-session.html to clear it

## 📝 Sample Data

To test, ensure you have:

```sql
-- Sample board member in Events committee
INSERT INTO public.student (id, student_id, full_name, email, committee, role, username)
VALUES 
  ('user-uuid-here', '12345', 'John Doe', 'john@example.com', 'Events', 'officer', 'johndoe');

-- Sample members in same committee
INSERT INTO public.student (id, student_id, full_name, email, committee, role, username)
VALUES 
  ('uuid-2', '12346', 'Jane Smith', 'jane@example.com', 'Events', 'member', 'janesmith'),
  ('uuid-3', '12347', 'Bob Johnson', 'bob@example.com', 'Events', 'member', 'bobjohnson');
```

