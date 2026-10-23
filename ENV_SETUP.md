# Environment Variables — Full Setup Guide

This project needs **7 environment variables** in a `.env` file at the project root
(copy `.env.example` to `.env` and fill it in). None of them are provided by this
repo on purpose — each new deployment (e.g. a new team taking over this project)
must generate its **own** Supabase project and Google Apps Script deployments.
Nothing here is shared infrastructure you can keep reusing.

Restart `npm start` any time you change `.env` — Create React App only reads it at boot.

| Variable | Used for |
|---|---|
| `REACT_APP_SUPABASE_URL` | Supabase project URL (auth + database) |
| `REACT_APP_SUPABASE_ANON_KEY` | Supabase public anon key |
| `REACT_APP_GOOGLE_SHEETS_URL` | "Join Us" recruitment form → Google Sheet |
| `REACT_APP_GOOGLE_SHEETS_FORMS_URL` | General "Forms" page submissions → Google Sheet |
| `REACT_APP_CONTACT_FORM_URL` | "Get in Touch" contact form → email |
| `REACT_APP_SHEETS_VERIFY_URL` | Signup eligibility check (email + committee) against a Sheet |
| `REACT_APP_GAS_EMAIL_WEBHOOK_URL` | Task-assignment email notifications |

---

## 1. Supabase (auth + database)

The app uses Supabase for login/signup and as the database for students, tasks,
events and meetings (`src/config/supabaseClient.js`).

1. Create a free project at [supabase.com](https://supabase.com) → **New project**.
2. In **Project Settings → API**, copy:
   - **Project URL** → `REACT_APP_SUPABASE_URL`
   - **anon public** key → `REACT_APP_SUPABASE_ANON_KEY`
   (The anon key is meant to be public/client-side — access is controlled by Row Level Security policies, not by hiding this key.)
3. In **Authentication → Providers**, make sure **Email** sign-in is enabled (it's on by default). The signup flow creates a user via `supabase.auth.signUp` and then inserts a matching row into `student`.
4. In the **SQL Editor**, run the schema below to create the tables the app queries (inferred from every `.from(...)` call in `src/`):

```sql
-- Student / member profile (id matches the Supabase auth user id)
create table student (
  id uuid primary key references auth.users(id) on delete cascade,
  student_id text,
  full_name text,
  email text,
  phone_number text,
  date_of_birth date,
  age int,
  gender text,
  faculty text,
  department text,
  graduation_year int,
  committee text,
  ieee_member text,
  role text default 'MEMBER' -- e.g. MEMBER, HR, ADMIN/BOA — checked throughout the dashboard
);

-- Tasks created by committee heads/admins
create table task (
  id uuid primary key default gen_random_uuid(),
  title text,
  description text,
  due_date date,
  priority text,
  task_attachment text,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

-- Many-to-many: which students a task is assigned to
create table task_assignees (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references task(id) on delete cascade,
  student_id uuid references student(id) on delete cascade,
  status text default 'pending' -- read ViewAssignedTasks.js / HRReviews.js for the exact values used
);

-- Events shown on the Season Calendar / dashboard
create table events (
  id uuid primary key default gen_random_uuid(),
  title text,
  description text,
  start_date date,
  end_date date,
  location text,
  created_by uuid references auth.users(id)
);

-- Committee meetings
create table meetings (
  id uuid primary key default gen_random_uuid(),
  committee text,
  meeting_date date,
  meeting_time time,
  meeting_mode text,
  meeting_link text,
  description text
);

-- Which HR members can review which committee (HRReviews.js)
create table hr_assignations (
  id uuid primary key default gen_random_uuid(),
  student_id text, -- the university student_id string, NOT the auth uuid
  committee varchar
);
```

5. Add **Row Level Security (RLS) policies** on each table before going to production — the schema above intentionally ships with none, so decide per table who may read/write (e.g. a student can read their own `student` row; only HR/admin roles can insert into `task`). Grep the components under `src/components/DashboardNew/` for the exact reads/writes each role needs.

---

## 2. Google Apps Script endpoints (5 total)

All five are plain Google Apps Script **Web Apps** bound to a Google Sheet. The
general recipe is always:

1. Create/open a Google Sheet.
2. **Extensions → Apps Script**, paste the code for that endpoint (below).
3. **Deploy → New deployment → Web app**, Execute as **Me**, Who has access **Anyone**.
4. Copy the `.../exec` URL into the matching `.env` variable.
5. Re-deploy (**Manage deployments → Edit → New version**) any time you change the script — editing the code alone does not update a live `/exec` URL.

The frontend posts with `mode: 'no-cors'`, so the browser never sees the response —
treat a non-throwing `fetch` as success and verify delivery by checking the Sheet directly.

### 2a. `REACT_APP_GOOGLE_SHEETS_URL` — Join Us form
Full walkthrough with the exact sheet columns and `doPost` code is already written up in **[GOOGLE_SHEETS_SETUP.md](GOOGLE_SHEETS_SETUP.md)** — follow that document for this variable. Payload shape is defined in `src/Routes/JoinUs.js`.

### 2b. `REACT_APP_GOOGLE_SHEETS_FORMS_URL` — General Forms page
Sent from `src/Routes/Forms.js` as JSON (not form-encoded), including an optional base64 photo:

```javascript
function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  sheet.appendRow([
    data.timestamp, data.name, data.nationalId, data.phone, data.email,
    (data.preferredContactMethod || []).join(', '), data.affiliation, data.affiliationFullName,
    data.position, data.hasSIGHTMembership, data.membershipNumber,
    data.attendanceConfirmation, data.comments
  ]);
  // data.nationalIdPhoto, if present, is a base64 string — e.g. save it to Drive here.
  return ContentService.createTextOutput(JSON.stringify({ status: 'success' }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

### 2c. `REACT_APP_CONTACT_FORM_URL` — Get in Touch form
Sent from `src/components/GetInTouch/GetInTouch.js`. Simplest option: forward straight to email with `MailApp` instead of writing to a sheet.

```javascript
function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  MailApp.sendEmail({
    to: 'info@ieeeaastcairo.org', // or data.to
    subject: `[Contact Form] ${data.subject}`,
    body: `From: ${data.firstName} ${data.lastName} <${data.email}>\n\n${data.message}`
  });
  return ContentService.createTextOutput(JSON.stringify({ status: 'success' }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

### 2d. `REACT_APP_SHEETS_VERIFY_URL` — Signup eligibility check
Called as a **GET** from `src/Routes/Signup.js`: `?email=...&committee=...`. Must return JSON `{ "eligible": true|false, "reason"?: "..." }`. This implies you maintain a separate Sheet of pre-approved members (e.g. from a recruitment round) that signup checks against:

```javascript
function doGet(e) {
  const email = (e.parameter.email || '').toLowerCase().trim();
  const committee = (e.parameter.committee || '').trim();
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const rows = sheet.getDataRange().getValues(); // expects columns: Email, Committee
  const match = rows.find(r => (r[0] || '').toString().toLowerCase().trim() === email);

  let result;
  if (!match) {
    result = { eligible: false, reason: 'Email not found' };
  } else if ((match[1] || '').toString().trim() !== committee) {
    result = { eligible: false, reason: 'Committee mismatch' };
  } else {
    result = { eligible: true };
  }
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}
```

### 2e. `REACT_APP_GAS_EMAIL_WEBHOOK_URL` — Task assignment emails
Called from `src/components/DashboardNew/TaskAssignment.js` and `src/Routes/Tasks.js` whenever a task is created, with `{ type: 'task_created', title, description, due_date, priority, task_attachment, created_by_email, recipients: [email, ...] }`:

```javascript
function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  if (data.type === 'task_created' && Array.isArray(data.recipients)) {
    data.recipients.forEach(email => {
      MailApp.sendEmail({
        to: email,
        subject: `New Task: ${data.title}`,
        body: `${data.description}\n\nDue: ${data.due_date}\nPriority: ${data.priority}\nAssigned by: ${data.created_by_email}`
      });
    });
  }
  return ContentService.createTextOutput(JSON.stringify({ status: 'success' }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

---

## 3. Verifying everything works

- `isSupabaseConfigured` in `src/config/supabaseClient.js` logs a console warning if the two Supabase vars are missing — open devtools on first run to confirm it's silent.
- `JoinUs.js`, `Forms.js` and `Signup.js` each throw a clear error naming the missing variable if its URL isn't set, so a misconfigured `.env` fails loudly in the form rather than silently dropping data.
- After filling in `.env`, restart `npm start` and submit each form once, then check the corresponding Sheet/inbox/Supabase table for the new row.
