/**
 * Google Apps Script for Email + Committee Verification
 * 
 * If container-bound to the target Sheet, leave SPREADSHEET_ID as null.
 * If standalone, set SPREADSHEET_ID to the Sheet ID (between /d/ and /edit).
 */
const SPREADSHEET_ID = null; // e.g. '1AbC...'; keep null if container-bound
const SHEET_NAME = 'Sheet1'; // change if different
const EMAIL_COLUMN_HEADER = 'Email Address';
const COMMITTEE_COLUMN_HEADER = 'Committee you joined';

function doGet(e) {
  try {
    const emailRaw = (e.parameter.email || '').trim();
    const committeeRaw = (e.parameter.committee || '').trim();
    
    if (!emailRaw || !committeeRaw) {
      return jsonResponse({ eligible: false, reason: 'Missing email or committee' });
    }

    const ss = SPREADSHEET_ID
      ? SpreadsheetApp.openById(SPREADSHEET_ID)
      : SpreadsheetApp.getActive();
    if (!ss) return jsonResponse({ eligible: false, reason: 'Spreadsheet not found' });

    const sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) return jsonResponse({ eligible: false, reason: 'Sheet not found' });

    const values = sheet.getDataRange().getValues();
    if (values.length < 2) return jsonResponse({ eligible: false, reason: 'No data in sheet' });

    const header = values[0].map(h => String(h || '').trim());
    const emailIdx = findHeaderIndex(header, EMAIL_COLUMN_HEADER);
    const committeeIdx = findHeaderIndex(header, COMMITTEE_COLUMN_HEADER);
    
    if (emailIdx === -1) {
      return jsonResponse({ eligible: false, reason: 'Email column not found' });
    }
    if (committeeIdx === -1) {
      return jsonResponse({ eligible: false, reason: 'Committee column not found' });
    }

    const reqEmail = normalizeEmail(emailRaw);
    // Map full committee name to abbreviation
    const reqCommitteeAbbr = mapCommitteeToAbbreviation(committeeRaw);

    for (let i = 1; i < values.length; i++) {
      const rowEmail = normalizeEmail(String(values[i][emailIdx] || ''));
      const rowCommittee = normalizeCommittee(String(values[i][committeeIdx] || ''));
      
      if (rowEmail && rowEmail === reqEmail) {
        // Email matches, now check committee
        if (rowCommittee === reqCommitteeAbbr) {
          return jsonResponse({ eligible: true });
        } else {
          return jsonResponse({ 
            eligible: false, 
            reason: 'Email found but committee mismatch. Your selected committee does not match the committee in the sheet.' 
          });
        }
      }
    }

    return jsonResponse({ eligible: false, reason: 'Email not found in the members sheet' });
  } catch (err) {
    return jsonResponse({ eligible: false, reason: 'Server error: ' + err });
  }
}

function findHeaderIndex(headerRow, name) {
  const target = String(name).trim().toLowerCase();
  for (let i = 0; i < headerRow.length; i++) {
    if (String(headerRow[i]).trim().toLowerCase() === target) return i;
  }
  return -1;
}

function normalizeEmail(e) {
  return String(e || '')
    .toLowerCase()
    .trim()
    .replace(/[\u200B-\u200D\uFEFF]/g, ''); // remove zero-width chars
}

function normalizeCommittee(c) {
  // Normalize committee: uppercase, trim, remove extra spaces
  return String(c || '')
    .toUpperCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[\u200B-\u200D\uFEFF]/g, '');
}

/**
 * Maps full committee names from signup form to abbreviations used in Google Sheet
 * Signup form uses: "Computer Society (CS)", "Power & Energy Society (PES)", etc.
 * Google Sheet uses: "CS", "IES", "PES", "RAS", "HR", "Branding", "Events"
 */
function mapCommitteeToAbbreviation(fullName) {
  const normalized = String(fullName || '').toUpperCase().trim();
  
  // Map full names to abbreviations
  if (normalized.includes('COMPUTER SOCIETY') || normalized.includes('(CS)')) {
    return 'CS';
  }
  if (normalized.includes('POWER') && normalized.includes('ENERGY') || normalized.includes('(PES)')) {
    return 'PES';
  }
  if (normalized.includes('ROBOTICS') && normalized.includes('AUTOMATION') || normalized.includes('(RAS)')) {
    return 'RAS';
  }
  if (normalized.includes('INDUSTRIAL') && normalized.includes('ELECTRONICS') || normalized.includes('(IES)')) {
    return 'IES';
  }
  if (normalized.includes('HUMAN RESOURCES') || normalized.includes('(HR)')) {
    return 'HR';
  }
  if (normalized.includes('BRANDING')) {
    return 'BRANDING';
  }
  if (normalized.includes('EVENTS')) {
    return 'EVENTS';
  }
  
  // If already an abbreviation, return as uppercase
  const abbrs = ['CS', 'PES', 'RAS', 'IES', 'HR', 'BRANDING', 'EVENTS'];
  if (abbrs.includes(normalized)) {
    return normalized;
  }
  
  // Default fallback
  return normalized;
}

function jsonResponse(obj) {
  const out = ContentService.createTextOutput(JSON.stringify(obj));
  out.setMimeType(ContentService.MimeType.JSON);
  return out;
}

