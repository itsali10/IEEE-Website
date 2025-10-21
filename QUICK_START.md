# Quick Start Guide

## 🚀 Getting Started (Without Authentication)

The app now works **without** Supabase configuration! You'll see a warning banner, but all pages will load normally.

### Option 1: Run Without Authentication (Fastest)

Just start the app - it will work immediately:

```bash
npm start
```

The app will:
- ✅ Load all pages normally
- ✅ Show warning banners on protected pages
- ⚠️ Login will not work (shows warning)
- ⚠️ Tasks page accessible without login (shows warning)

### Option 2: Run With Full Authentication

To enable the complete authentication system:

#### Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up for a free account
3. Click **New Project**
4. Fill in project details and create

#### Step 2: Get Your Credentials

1. In Supabase Dashboard, go to **Settings** > **API**
2. Copy these two values:
   - **Project URL** (e.g., `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon/public** key (long string starting with `eyJ...`)

#### Step 3: Create .env File

Create a file named `.env` in the project root directory:

```env
REACT_APP_SUPABASE_URL=paste_your_project_url_here
REACT_APP_SUPABASE_ANON_KEY=paste_your_anon_key_here
```

**Important:** Replace the placeholder values with your actual credentials!

#### Step 4: Create Admin User

In Supabase Dashboard:
1. Go to **Authentication** > **Users**
2. Click **Add User**
3. Enter:
   - Email: `admin@example.com` (or any email)
   - Password: Choose a secure password
4. Click **Create User**

#### Step 5: Restart the App

```bash
# Stop the current server (Ctrl+C)
npm start
```

#### Step 6: Test Login

1. Navigate to `http://localhost:3000/login`
2. Enter the email and password you created
3. Click **Sign In**
4. You should be logged in and redirected to `/tasks`

## 🔧 Troubleshooting White Screen

If you see a white screen:

### Solution 1: Check Console Errors
1. Open browser Developer Tools (F12)
2. Check the Console tab for error messages
3. Look for any import errors or missing files

### Solution 2: Clear Cache
```bash
# Stop the server (Ctrl+C)
# Delete build and cache
rm -rf build node_modules/.cache
# Restart
npm start
```

### Solution 3: Rebuild
```bash
npm run build
npm start
```

### Solution 4: Check Environment Variables
If you created a `.env` file:
- Make sure it's in the **root directory** (same level as `package.json`)
- Variable names must start with `REACT_APP_`
- No spaces around the `=` sign
- Restart the server after creating/editing `.env`

Example `.env` format:
```env
REACT_APP_SUPABASE_URL=https://yourproject.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 📂 Project Structure

```
IEEE-Website/
├── src/
│   ├── Routes/
│   │   ├── Home.js          ✅ Public
│   │   ├── About.js         ✅ Public
│   │   ├── Events.js        ✅ Public
│   │   ├── JoinUs.js        ✅ Public
│   │   ├── Teams.js         ✅ Public
│   │   ├── Login.js         ✅ Public (new)
│   │   └── Tasks.js         🔒 Protected (new)
│   ├── components/
│   │   └── ProtectedRoute/  🔒 Route protection
│   ├── context/
│   │   └── AuthContext.js   🔐 Auth management
│   └── config/
│       └── supabaseClient.js 🔧 Supabase setup
├── .env                     🔐 Your credentials (create this)
├── .env.example            📝 Template
└── SUPABASE_SETUP.md       📚 Detailed guide
```

## 🎯 Available Routes

| Route      | Access     | Description                          |
|------------|------------|--------------------------------------|
| `/`        | Public     | Home page                            |
| `/about`   | Public     | About IEEE AAST                      |
| `/events`  | Public     | Events listing                       |
| `/joinus`  | Public     | Join IEEE form                       |
| `/teams`   | Public     | Teams overview                       |
| `/login`   | Public     | Admin login (new)                    |
| `/tasks`   | Protected  | Task management (requires login)     |

## ⚡ Quick Commands

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

## 💡 Tips

1. **Start Simple:** Run the app without Supabase first to make sure everything works
2. **Set Up Supabase Later:** Add authentication when you're ready
3. **Check Documentation:** See `SUPABASE_SETUP.md` for detailed instructions
4. **Use .env.example:** Copy it to `.env` and fill in your values

## 📞 Need Help?

Check these files for detailed information:
- `SUPABASE_SETUP.md` - Complete Supabase setup
- `AUTHENTICATION_GUIDE.md` - How to use authentication
- `IMPLEMENTATION_SUMMARY.md` - What was implemented

## ✅ Success Indicators

App is working when you see:
- ✅ All pages load without white screen
- ✅ Navigation works between pages
- ✅ Console shows "⚠️ Supabase is not configured" (if no .env)
- ✅ Login page loads (shows warning if no .env)
- ✅ Tasks page loads (shows warning if no .env)

App is **fully configured** when:
- ✅ No warning banners on login/tasks pages
- ✅ Login works with your credentials
- ✅ Logout button appears in header when logged in
- ✅ Tasks page only accessible after login

---

**Happy coding! 🎉**

