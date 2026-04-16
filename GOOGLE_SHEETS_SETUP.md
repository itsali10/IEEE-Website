# Google Sheets Integration Setup Guide

## 📋 Overview
This guide will help you set up Google Sheets to receive form submissions from the JoinUs page.

## 🚀 Step-by-Step Setup

### 1. Create a Google Sheet
1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it "IEEE AAST JoinUs Form Submissions" (or your preferred name)

### 2. Set Up Your Sheet Headers
Add these columns in the first row (A1:Q1):
```
A: Timestamp
B: Name
C: Email
D: Phone
E: Age
F: Date of Birth
G: Nationality
H: National ID
I: Gender
J: Faculty
K: Major
L: Student ID
M: Graduation Year
N: Recruiter Name
O: Has IEEE Membership
P: IEEE Membership ID
Q: Desired Committee
R: Has Other Student Activities
S: Other Student Activities
T: Interview Date
U: Interview Time
V: Previous Work (Branding)
```

### 3. Create Google Apps Script
1. In your Google Sheet, go to **Extensions** → **Apps Script**
2. Replace the default code with the following:

```javascript
function doPost(e) {
  try {
    // Get the active spreadsheet and sheet
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getActiveSheet();
    
    // Parse the incoming data
    const data = JSON.parse(e.postData.contents);
    
    // Prepare row data
    const rowData = [
      data.timestamp,
      data.name,
      data.email,
      data.phone,
      data.age,
      data.dob,
      data.nationality,
      data.nationalId,
      data.gender,
      data.faculty,
      data.major,
      data.studentId,
      data.graduationYear,
      data.recruiterName,
      data.hasIEEEMembership,
      data.ieeeMembershipId,
      data.firstCommittee,
      data.hasOtherActivities,
      data.otherActivities,
      data.interviewDate,
      data.interviewTime,
      data.previousWork
    ];
    
    // Append the data to the sheet
    sheet.appendRow(rowData);
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({ 
        status: 'success', 
        message: 'Data submitted successfully' 
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Return error response
    return ContentService
      .createTextOutput(JSON.stringify({ 
        status: 'error', 
        message: error.toString() 
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput('Google Sheets API is working!')
    .setMimeType(ContentService.MimeType.TEXT);
}
```

### 4. Deploy as Web App
1. Click **Deploy** → **New deployment**
2. Choose **Web app** as the type
3. Set the following:
   - **Execute as**: Me (your Google account)
   - **Who has access**: Anyone
4. Click **Deploy**
5. **Authorize** the app when prompted
6. Copy the **Web app URL** (you'll need this for the next step)

### 5. Update Your React App
1. Open `src/Routes/JoinUs.js`
2. Find this line:
   ```javascript
   const GOOGLE_SHEETS_URL = 'YOUR_GOOGLE_SHEETS_WEB_APP_URL_HERE';
   ```
3. Replace `'YOUR_GOOGLE_SHEETS_WEB_APP_URL_HERE'` with your actual web app URL

### 6. Test the Integration
1. Fill out the form on your website
2. Submit the form
3. Check your Google Sheet - you should see a new row with the submitted data

## 🔧 Advanced Features (Optional)

### Add Email Notifications
Add this to your Apps Script to get email notifications for new submissions:

```javascript
// Add this inside the doPost function, after sheet.appendRow(rowData);
const emailAddress = "your-email@example.com"; // Replace with your email
const subject = "New IEEE JoinUs Form Submission";
const message = `
New form submission received:

Name: ${data.name}
Email: ${data.email}
Phone: ${data.phone}
Desired Committee: ${data.firstCommittee}
Other Activities: ${data.hasOtherActivities === 'yes' ? data.otherActivities : 'None'}

View full details in the spreadsheet.
`;

MailApp.sendEmail(emailAddress, subject, message);
```

### Add Data Validation
Add this to your Apps Script to validate data before saving:

```javascript
// Add this before sheet.appendRow(rowData);
if (!data.email || !data.name) {
  throw new Error("Required fields missing");
}

// Validate email format
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(data.email)) {
  throw new Error("Invalid email format");
}
```

## 🛡️ Security Considerations

### CORS Configuration
If you encounter CORS errors, add this to your Apps Script:

```javascript
// Add this at the beginning of doPost function
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST',
  'Access-Control-Allow-Headers': 'Content-Type'
};

// Add this before returning the response
Object.keys(headers).forEach(key => {
  response.setHeader(key, headers[key]);
});
```

### Rate Limiting
Google Apps Script has limits:
- 6 executions per minute per user
- 20 executions per minute per project
- Consider implementing a queue system for high traffic

## 📊 Monitoring and Analytics

### View Submission Statistics
Add this to your Apps Script to track submissions:

```javascript
// Add this after sheet.appendRow(rowData);
const statsSheet = spreadsheet.getSheetByName("Statistics");
if (!statsSheet) {
  // Create statistics sheet if it doesn't exist
  const newSheet = spreadsheet.insertSheet("Statistics");
  newSheet.getRange("A1:B1").setValues([["Metric", "Value"]]);
  newSheet.getRange("A2:B2").setValues([["Total Submissions", "=COUNTA('Sheet1'!A:A)-1"]]);
  newSheet.getRange("A3:B3").setValues([["Today's Submissions", "=COUNTIF('Sheet1'!A:A, TODAY())"]]);
}
```

## 🚨 Troubleshooting

### Common Issues:

1. **"Script function not found"**
   - Make sure you saved the Apps Script code
   - Check that the function name is exactly `doPost`

2. **"Access denied"**
   - Ensure the web app is deployed with "Anyone" access
   - Re-authorize the app if needed

3. **"CORS error"**
   - Add the CORS headers as shown above
   - Check that your web app URL is correct

4. **"Data not appearing in sheet"**
   - Check the Apps Script logs for errors
   - Verify the sheet name and column structure
   - Ensure the script has permission to edit the sheet

## 📞 Support
If you encounter issues:
1. Check the Apps Script logs (View → Execution log)
2. Verify your web app URL is correct
3. Test with a simple form submission first
4. Check the browser console for JavaScript errors

## 🎯 Next Steps
Once setup is complete:
1. Test with real form submissions
2. Set up email notifications (optional)
3. Configure data validation rules
4. Set up automated backups
5. Monitor submission patterns

---

**Note**: Keep your web app URL secure and don't share it publicly to prevent spam submissions. 