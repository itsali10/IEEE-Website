# Task Database Setup Guide

## Table Schema

Your Supabase `task` table has the following columns:

| Column          | Type   | Description                              |
|-----------------|--------|------------------------------------------|
| id              | uuid   | Primary key (auto-generated)             |
| title           | text   | Task title (required)                    |
| description     | text   | Task description (required)              |
| due_date        | date   | Task due date (required)                 |
| task_attachment | text   | URL to attachments (optional)            |
| priority        | text   | Priority level: Low, Medium, High        |

## Setting Up Row Level Security (RLS)

To allow authenticated users to create and manage tasks, you need to set up Row Level Security policies in Supabase.

### Step 1: Enable RLS

In your Supabase dashboard:
1. Go to **Table Editor**
2. Select the `task` table
3. Click on **RLS** (Row Level Security)
4. Toggle **Enable RLS** to ON

### Step 2: Create Policies

Go to **Authentication** > **Policies** or use the SQL Editor and run these commands:

```sql
-- Policy: Allow authenticated users to INSERT tasks
CREATE POLICY "Allow authenticated users to insert tasks"
ON task
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy: Allow authenticated users to SELECT (view) all tasks
CREATE POLICY "Allow authenticated users to view tasks"
ON task
FOR SELECT
TO authenticated
USING (true);

-- Policy: Allow authenticated users to UPDATE tasks
CREATE POLICY "Allow authenticated users to update tasks"
ON task
FOR UPDATE
TO authenticated
USING (true);

-- Policy: Allow authenticated users to DELETE tasks
CREATE POLICY "Allow authenticated users to delete tasks"
ON task
FOR DELETE
TO authenticated
USING (true);
```

### Alternative: User-Specific Tasks

If you want users to only manage their own tasks, first add a `created_by` column:

```sql
-- Add created_by column to track who created each task
ALTER TABLE task 
ADD COLUMN created_by UUID REFERENCES auth.users(id);

-- Set default to current user
ALTER TABLE task 
ALTER COLUMN created_by SET DEFAULT auth.uid();
```

Then use these policies instead:

```sql
-- Allow users to insert their own tasks
CREATE POLICY "Users can insert own tasks"
ON task
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

-- Allow users to view their own tasks
CREATE POLICY "Users can view own tasks"
ON task
FOR SELECT
TO authenticated
USING (auth.uid() = created_by);

-- Allow users to update their own tasks
CREATE POLICY "Users can update own tasks"
ON task
FOR UPDATE
TO authenticated
USING (auth.uid() = created_by);

-- Allow users to delete their own tasks
CREATE POLICY "Users can delete own tasks"
ON task
FOR DELETE
TO authenticated
USING (auth.uid() = created_by);
```

## Testing the Integration

### 1. Start Your App
```bash
npm start
```

### 2. Log In
- Navigate to `/login`
- Enter your Supabase admin credentials

### 3. Create a Task
- Go to `/tasks`
- Fill in the form:
  - **Title**: Test Task
  - **Description**: This is a test task
  - **Due Date**: Select a future date
  - **Priority**: Select High, Medium, or Low
  - **Task Attachment**: (Optional) Add a URL
- Click **Create Task**

### 4. Verify in Supabase
- Go to Supabase Dashboard
- Navigate to **Table Editor** > `task`
- You should see your newly created task

## Form Fields

The Tasks page now includes:

✅ **Task Title** - Text input (required, 3-100 characters)  
✅ **Task Description** - Textarea (required, 10-1000 characters)  
✅ **Due Date** - Date picker (required, cannot be in the past)  
✅ **Priority** - Dropdown menu (Low, Medium, High)  
✅ **Task Attachment** - URL input (optional)  

## Features

- ✅ Real-time validation
- ✅ Character counter for description
- ✅ Date validation (no past dates)
- ✅ Success/error messages
- ✅ Form reset after successful submission
- ✅ Direct Supabase integration
- ✅ Loading states during submission

## Troubleshooting

### Error: "new row violates row-level security policy"
**Solution:** Make sure you've created the RLS policies shown above.

### Error: "permission denied for table task"
**Solution:** 
1. Check that RLS is enabled
2. Verify you're logged in as an authenticated user
3. Ensure policies are created correctly

### Tasks not saving
**Solution:**
1. Open browser console (F12) to see error messages
2. Check Supabase Dashboard > **Logs** for detailed errors
3. Verify your `.env` file has correct Supabase credentials

### Can't see created tasks
**Solution:**
1. Refresh the Supabase Table Editor
2. Check that the SELECT policy is created
3. Verify the user is authenticated

## Next Steps

### Add Task List View
Create a component to display all tasks:

```javascript
import { useEffect, useState } from 'react';
import { supabase } from '../config/supabaseClient';

function TaskList() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks() {
    const { data, error } = await supabase
      .from('task')
      .select('*')
      .order('due_date', { ascending: true });
    
    if (error) console.error('Error:', error);
    else setTasks(data);
  }

  return (
    <div>
      {tasks.map(task => (
        <div key={task.id}>
          <h3>{task.title}</h3>
          <p>{task.description}</p>
          <span>Due: {task.due_date}</span>
          <span>Priority: {task.priority}</span>
        </div>
      ))}
    </div>
  );
}
```

### Add Real-time Updates
```javascript
useEffect(() => {
  const subscription = supabase
    .channel('task-changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'task' },
      (payload) => {
        console.log('Change received!', payload);
        fetchTasks(); // Refresh tasks
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}, []);
```

## Summary

Your task management system is now ready to:
- ✅ Create tasks with all required fields
- ✅ Save tasks to Supabase database
- ✅ Validate all inputs
- ✅ Only allow authenticated users
- ✅ Provide great UX with validation and feedback

Next, you can build the task list view, edit functionality, and task completion features!

