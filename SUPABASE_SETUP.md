# Supabase Setup Guide

This guide will help you set up Supabase authentication for the IEEE Website project.

## Prerequisites

1. Create a Supabase account at [https://supabase.com](https://supabase.com)
2. Create a new project in your Supabase dashboard

## Configuration Steps

### 1. Get Your Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to **Settings** > **API**
3. Copy the following values:
   - **Project URL** (e.g., `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

### 2. Create Environment Variables

Create a `.env` file in the root directory of your project with the following content:

```env
# Supabase Configuration
REACT_APP_SUPABASE_URL=your_supabase_project_url_here
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Google Sheets Configuration (existing)
REACT_APP_GOOGLE_SHEETS_URL=your_google_apps_script_web_app_url_here
```

Replace the placeholder values with your actual Supabase credentials.

### 3. Set Up Authentication

In your Supabase dashboard:

1. Go to **Authentication** > **Providers**
2. Enable **Email** provider (this allows username/password login)
3. Configure email templates if needed

### 4. Create Users

You can create users in two ways:

#### Option A: Via Supabase Dashboard
1. Go to **Authentication** > **Users**
2. Click **Add User**
3. Enter email and password
4. Click **Create User**

#### Option B: Via SQL (for bulk users)
Go to **SQL Editor** and run:

```sql
-- Create a user with email/password
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
VALUES (
  'admin@example.com',
  crypt('your_password', gen_salt('bf')),
  now()
);
```

### 5. Database Schema for Tasks (Optional)

If you want to store tasks in Supabase, create a tasks table:

```sql
-- Create tasks table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  assigned_to UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  due_date TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to read all tasks
CREATE POLICY "Allow authenticated users to read tasks"
  ON tasks FOR SELECT
  TO authenticated
  USING (true);

-- Create policy to allow authenticated users to insert tasks
CREATE POLICY "Allow authenticated users to insert tasks"
  ON tasks FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create policy to allow authenticated users to update tasks
CREATE POLICY "Allow authenticated users to update tasks"
  ON tasks FOR UPDATE
  TO authenticated
  USING (true);
```

## Testing

1. Start your development server: `npm start`
2. Navigate to `/login`
3. Enter the credentials you created in Supabase
4. You should be authenticated successfully

## Troubleshooting

- **Environment variables not found**: Make sure your `.env` file is in the root directory and restart the development server
- **Authentication fails**: Check that the email provider is enabled in Supabase
- **User not found**: Verify the user exists in **Authentication** > **Users**

## Security Notes

- Never commit your `.env` file to version control
- The `.env` file is already listed in `.gitignore`
- Use environment variables for all sensitive credentials
- The anon key is safe to use in client-side code (it has limited permissions)

