# Authentication System Guide

This document describes the Supabase authentication system implemented in the IEEE Website project.

## Overview

The project now includes a complete authentication system using Supabase for secure user login and protected routes. The `/tasks` page is now protected and requires authentication.

## Features

✅ **Email/Password Authentication** - Secure login using Supabase Auth
✅ **Protected Routes** - Tasks page accessible only to authenticated users
✅ **Session Persistence** - Users stay logged in across page refreshes
✅ **Auto Redirect** - Unauthorized users redirected to login page
✅ **Logout Functionality** - Users can sign out from the header
✅ **Loading States** - Beautiful loading screens while checking auth status
✅ **Error Handling** - Comprehensive error messages for login issues

## File Structure

```
src/
├── config/
│   └── supabaseClient.js          # Supabase client configuration
├── context/
│   └── AuthContext.js              # Authentication context provider
├── components/
│   └── ProtectedRoute/
│       └── ProtectedRoute.js       # Route protection component
├── Routes/
│   ├── Login.js                    # Login page component
│   └── Tasks.js                    # Protected tasks page (updated)
└── css/
    └── loginStyles.css             # Login page styles
```

## Setup Instructions

### 1. Install Dependencies

Dependencies are already installed:
```bash
npm install @supabase/supabase-js
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```env
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Important:** Never commit the `.env` file to version control. It's already in `.gitignore`.

### 3. Set Up Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and create an account
2. Create a new project
3. Go to **Settings** > **API** and copy:
   - Project URL
   - anon/public key
4. Add these to your `.env` file

### 4. Enable Email Authentication

In your Supabase dashboard:
1. Go to **Authentication** > **Providers**
2. Enable the **Email** provider
3. Configure email templates (optional)

### 5. Create Admin Users

#### Via Supabase Dashboard:
1. Go to **Authentication** > **Users**
2. Click **Add User**
3. Enter email and password
4. Click **Create User**

#### Via SQL Editor:
```sql
-- Create a user
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
VALUES (
  'admin@example.com',
  crypt('your_password', gen_salt('bf')),
  now()
);
```

## Usage

### Login Page

Navigate to `/login` to access the login page. Users must enter:
- Email address
- Password

The system provides:
- Real-time validation
- Show/hide password toggle
- Error messages for invalid credentials
- Loading state during authentication

### Protected Routes

The `/tasks` page is now protected. When users try to access it:
- If not authenticated → Redirected to `/login`
- If authenticated → Page loads normally
- After successful login → Redirected back to the page they were trying to access

### Logout

Authenticated users see a **Logout** button in the header (both desktop and mobile views). Clicking it:
1. Signs the user out
2. Clears the session
3. Redirects to the home page

## Using the Auth System in Your Components

### Check if User is Logged In

```javascript
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (user) {
    return <div>Welcome, {user.email}!</div>;
  }

  return <div>Please log in</div>;
}
```

### Sign In

```javascript
import { useAuth } from '../context/AuthContext';

function LoginComponent() {
  const { signIn } = useAuth();

  const handleLogin = async (email, password) => {
    const { error } = await signIn(email, password);
    if (error) {
      console.error('Login failed:', error);
    } else {
      console.log('Login successful!');
    }
  };

  return (
    // Your login form
  );
}
```

### Sign Out

```javascript
import { useAuth } from '../context/AuthContext';

function LogoutButton() {
  const { signOut } = useAuth();

  const handleLogout = async () => {
    const { error } = await signOut();
    if (error) {
      console.error('Logout failed:', error);
    }
  };

  return <button onClick={handleLogout}>Logout</button>;
}
```

### Protect a Route

```javascript
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute';
import MyProtectedPage from './MyProtectedPage';

// In your routes
<Route 
  path="/protected" 
  element={
    <ProtectedRoute>
      <MyProtectedPage />
    </ProtectedRoute>
  } 
/>
```

## AuthContext API

The `AuthContext` provides the following:

### State
- `user` - Current user object (null if not logged in)
- `session` - Current session object
- `loading` - Boolean indicating auth initialization status

### Methods
- `signIn(email, password)` - Sign in with email and password
- `signOut()` - Sign out the current user
- `signUp(email, password, metadata)` - Register a new user
- `resetPassword(email)` - Send password reset email
- `updatePassword(newPassword)` - Update user's password

All methods return `{ data, error }` objects.

## Security Best Practices

1. **Never commit `.env` file** - Keep credentials secret
2. **Use HTTPS in production** - Ensure secure connections
3. **Enable Row Level Security in Supabase** - Protect your database
4. **Validate on both client and server** - Don't trust client-side validation alone
5. **Use environment variables** - Never hardcode sensitive data
6. **Implement rate limiting** - Prevent brute force attacks (Supabase does this automatically)

## Troubleshooting

### "Missing Supabase environment variables" Error
- Ensure `.env` file exists in the root directory
- Check that variable names are correct: `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_ANON_KEY`
- Restart the development server after adding environment variables

### "Invalid login credentials" Error
- Verify the user exists in Supabase Dashboard > Authentication > Users
- Check that the email is confirmed (or disable email confirmation in Supabase settings)
- Ensure password is correct

### Session Not Persisting
- Check browser console for errors
- Clear browser cache and cookies
- Verify Supabase URL and key are correct

### Redirect Loop
- Check that the login page (`/login`) is not wrapped in `ProtectedRoute`
- Verify redirect logic in `ProtectedRoute.js`

## Next Steps

### Recommended Enhancements

1. **Password Reset Flow**
   - Create a forgot password page
   - Implement password reset functionality

2. **User Registration**
   - Create a signup page for new users
   - Add email verification flow

3. **Role-Based Access Control**
   - Add user roles (admin, member, etc.)
   - Protect routes based on user roles

4. **Task Management with Supabase**
   - Create tasks table in Supabase
   - Implement CRUD operations for tasks
   - Associate tasks with users

5. **Profile Management**
   - Allow users to update their profile
   - Add profile pictures
   - Manage user preferences

## Support

For issues or questions:
- Check the [Supabase Documentation](https://supabase.com/docs)
- Review the `SUPABASE_SETUP.md` file
- Contact the development team

## License

This authentication system is part of the IEEE AAST Cairo SB Website project.

