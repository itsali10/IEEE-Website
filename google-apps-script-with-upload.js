// === CONFIG ===
const SHEET_ID = '14lKBw23LuH11IGO0qbpvLL4-s1fNQN5Ks-a-XnfFw7w'; // spreadsheet ID (or leave empty to use bound sheet)
const SHEET_NAME = 'Sheet1'; // change to your sheet/tab name
const DRIVE_FOLDER_ID = 'YOUR_GOOGLE_DRIVE_FOLDER_ID_HERE'; // REPLACE WITH YOUR DRIVE FOLDER ID

function getSheet_() {
  var ss = SHEET_ID
    ? SpreadsheetApp.openById(SHEET_ID)
    : SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) throw new Error('Sheet "' + SHEET_NAME + '" not found.');
  return sh;
}

function doGet(e) {
  return respond_({ ok: true, message: 'Forms endpoint is live' }, 200);
}

function doOptions(e) {
  return ContentService.createTextOutput()
    .setMimeType(ContentService.MimeType.TEXT)
    .setContent('')
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function doPost(e) {
  try {
    Logger.log('=== doPost started ===');
    
    if (!e) {
      Logger.log('ERROR: No event object');
      return respond_({ ok: false, error: 'No event object' }, 400);
    }

    // Parse JSON payload
    var payload = {};
    if (e.postData && e.postData.contents) {
      Logger.log('POST data received, length: ' + e.postData.contents.length);
      try {
        payload = JSON.parse(e.postData.contents);
        Logger.log('Parsed payload: ' + JSON.stringify(payload, null, 2).substring(0, 500));
      } catch (parseErr) {
        Logger.log('ERROR: JSON parse failed: ' + String(parseErr));
        return respond_({ ok: false, error: 'Invalid JSON: ' + String(parseErr) }, 400);
      }
    } else {
      Logger.log('ERROR: No POST data received');
      return respond_({ ok: false, error: 'No POST data received' }, 400);
    }

    // Normalize preferredContactMethod to array
    if (payload.preferredContactMethod && !Array.isArray(payload.preferredContactMethod)) {
      if (typeof payload.preferredContactMethod === 'string') {
        payload.preferredContactMethod = payload.preferredContactMethod
          .split(',')
          .map(function (s) {
            return s.trim();
          });
      }
    }

    // Handle file upload (National ID photo)
    var fileUrl = '';
    if (payload.nationalIdPhoto && payload.nationalIdPhotoName) {
      Logger.log('File upload detected: ' + payload.nationalIdPhotoName);
      try {
        fileUrl = saveFileToDrive_(
          payload.nationalIdPhoto,
          payload.nationalIdPhotoName,
          payload.name || 'Unknown'
        );
        Logger.log('File uploaded successfully: ' + fileUrl);
      } catch (fileErr) {
        Logger.log('ERROR: File upload failed: ' + fileErr);
        return respond_({ ok: false, error: 'File upload failed: ' + String(fileErr) }, 500);
      }
    } else {
      Logger.log('No file upload detected');
    }

    // Sheet mapping
    Logger.log('Getting sheet...');
    var sheet = getSheet_();
    Logger.log('Sheet name: ' + sheet.getName());
    Logger.log('Sheet ID: ' + sheet.getParent().getId());
    
    var lastCol = Math.max(1, sheet.getLastColumn());
    Logger.log('Last column: ' + lastCol);
    
    var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    Logger.log('Existing headers: ' + JSON.stringify(headers));

    var fieldByHeader = {
      'Timestamp': payload.timestamp || new Date().toISOString(),
      'Name': payload.name || '',
      'National ID': payload.nationalId || '',
      'Phone': payload.phone || '',
      'Email': payload.email || '',
      'Preferred Contact Method': Array.isArray(payload.preferredContactMethod)
        ? payload.preferredContactMethod.join(', ')
        : payload.preferredContactMethod || '',
      'Affiliation': payload.affiliation || '',
      'Affiliation Full Name': payload.affiliationFullName || '',
      'Volunteering Position': payload.position || '',
      'SIGHT Membership': payload.hasSIGHTMembership || '',
      'Membership Number': payload.membershipNumber || '',
      'Attendance Confirmation': payload.attendanceConfirmation || '',
      'Comments': payload.comments || '',
      'National ID Photo': fileUrl
    };

    // Create headers if sheet is empty
    var nonEmptyHeaders = headers.filter(function (h) {
      return h && h.toString().trim() !== '';
    });

    if (nonEmptyHeaders.length === 0) {
      Logger.log('Sheet is empty, creating headers...');
      var headerRow = Object.keys(fieldByHeader);
      sheet.appendRow(headerRow);
      headers = headerRow;
      Logger.log('Headers created: ' + JSON.stringify(headers));
    }

    // Append row
    var row = headers.map(function (header) {
      return Object.prototype.hasOwnProperty.call(fieldByHeader, header)
        ? fieldByHeader[header]
        : '';
    });
    
    Logger.log('Appending row with ' + row.length + ' values');
    Logger.log('Row data: ' + JSON.stringify(row));
    
    sheet.appendRow(row);
    Logger.log('Row appended successfully!');

    // === EVENT CONFIRMATION EMAIL ===
    if (payload.email && String(payload.email).trim()) {
      Logger.log('Sending email to: ' + payload.email);
      try {
        var to = String(payload.email).trim();
        var subject = 'IEEE AAST — Event Registration Confirmed';
        var body =
          'Hello ' + (payload.name || '') + ',\n\n' +
          'Your registration for the event has been confirmed successfully.\n\n' +
          'We are looking forward to meeting you at the event.\n\n' +
          'Further details will be shared with you soon.\n\n' +
          'Best regards,\n' +
          'IEEE AAST Cairo Student Branch';

        MailApp.sendEmail({
          to: to,
          subject: subject,
          body: body,
          name: 'IEEE AAST Cairo SB'
        });
        Logger.log('Email sent successfully!');
      } catch (mailErr) {
        Logger.log('ERROR: Mail send failed: ' + mailErr);
      }
    } else {
      Logger.log('No email address provided, skipping email');
    }

    Logger.log('=== doPost completed successfully ===');
    return respond_({ ok: true, message: 'Registration successful' }, 200);
  } catch (err) {
    Logger.log('FATAL ERROR in doPost: ' + err);
    Logger.log('Stack trace: ' + err.stack);
    return respond_({ ok: false, error: String(err) }, 500);
  }
}

function saveFileToDrive_(base64Data, fileName, userName) {
  // Remove data URL prefix if present (e.g., "data:image/jpeg;base64,")
  var base64 = base64Data;
  if (base64.indexOf(',') !== -1) {
    base64 = base64.split(',')[1];
  }

  // Decode base64
  var blob = Utilities.newBlob(
    Utilities.base64Decode(base64),
    'image/jpeg',
    fileName
  );

  // Get or create folder
  var folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);

  // Create filename with timestamp and user name
  var timestamp = Utilities.formatDate(new Date(), 'GMT', 'yyyyMMdd_HHmmss');
  var sanitizedName = userName.replace(/[^a-zA-Z0-9]/g, '_');
  var finalFileName = sanitizedName + '_' + timestamp + '_' + fileName;

  // Save to Drive
  var file = folder.createFile(blob.setName(finalFileName));

  // Make file viewable by anyone with link (optional)
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  // Return the file URL
  return file.getUrl();
}

function respond_(obj, code) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type');
}
