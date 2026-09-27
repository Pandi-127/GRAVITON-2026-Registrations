/**
 * ============================================================================
 * GRAVITON 2026 - Google Apps Script Backend
 * Jaya Sakthi Engineering College (CSE & Cyber Security Dept.)
 * ============================================================================
 *
 * HOW TO DEPLOY:
 * 1. Open Google Sheets (create a new blank spreadsheet).
 * 2. Click "Extensions" > "Apps Script".
 * 3. Delete any code in the editor, and paste this entire file.
 * 4. (Optional) Set an Admin PIN in Script Properties:
 *    - Click Project Settings (gear icon) > Script Properties > Add "ADMIN_PIN" = "2026".
 *    - If not set, the default PIN defined below ("2026") is used.
 * 5. Click "Deploy" > "New deployment".
 * 6. Select type: "Web app".
 *    - Description: "GRAVITON 2026 API"
 *    - Execute as: "Me" (your email)
 *    - Who has access: "Anyone" (CRITICAL: Must be "Anyone" so frontend can submit)
 * 7. Click "Deploy", authorize permissions when prompted.
 * 8. Copy the "Web app URL" (ends in /exec).
 * 9. Paste that URL into `config.js` as `API_URL: "https://script.google.com/macros/s/.../exec"`.
 * ============================================================================
 */

// Fallback Admin Security PIN if not configured in Script Properties
const DEFAULT_ADMIN_PIN = "2026";

// Header columns for the Google Sheet database
const HEADERS = [
  "Registration ID",
  "Timestamp",
  "Full Name",
  "Email",
  "Phone",
  "College",
  "Department",
  "Year",
  "Selected Events",
  "Amount",
  "Payment Status",
  "UTR",
  "Payment Screenshot",
  "Verification Time",
  "Verified By"
];

/**
 * Handle HTTP GET Requests (Health Check & Read Actions)
 */
function doGet(e) {
  try {
    const params = e ? e.parameter : {};
    const action = params.action;

    if (!action || action === "ping") {
      return jsonResponse({
        success: true,
        message: "GRAVITON 2026 API is running successfully!",
        timestamp: new Date().toISOString()
      });
    }

    if (action === "checkStatus") {
      return handleCheckStatus(params.regId);
    }

    return jsonResponse({
      success: false,
      error: "Unknown GET action. Use POST for mutations."
    });
  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() });
  }
}

/**
 * Handle HTTP POST Requests (Registration, Payment Submission, Admin Actions)
 */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({ success: false, error: "Empty request payload" });
    }

    let data;
    try {
      data = JSON.parse(e.postData.contents);
    } catch (parseErr) {
      return jsonResponse({ success: false, error: "Invalid JSON payload" });
    }

    const action = data.action;

    switch (action) {
      case "register":
        return handleRegister(data);

      case "submitPayment":
        return handleSubmitPayment(data);

      case "checkStatus":
        return handleCheckStatus(data.regId);

      case "getRegistrations":
        return handleGetRegistrations(data);

      case "verifyPayment":
        return handleVerifyPayment(data);

      case "rejectPayment":
        return handleRejectPayment(data);

      default:
        return jsonResponse({
          success: false,
          error: "Unknown action: " + action
        });
    }
  } catch (err) {
    return jsonResponse({
      success: false,
      error: "Server processing error: " + err.toString()
    });
  }
}

/**
 * Helper to ensure the active sheet has the correct table headers
 */
function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("Registrations");
  if (!sheet) {
    sheet = ss.getSheets()[0];
    sheet.setName("Registrations");
  }

  // Check if header row exists
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    // Format header row
    const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
    headerRange.setBackground("#b3001b");
    headerRange.setFontColor("#ffffff");
    headerRange.setFontWeight("bold");
    sheet.setFrozenRows(1);
  }

  return sheet;
}

/**
 * ACTION: register
 * Registers participant and appends a row
 */
function handleRegister(data) {
  const sheet = getOrCreateSheet();
  const lock = LockService.getScriptLock();

  // Try to obtain lock for concurrency safety (wait up to 30 seconds)
  try {
    lock.waitLock(30000);
  } catch (e) {
    return jsonResponse({ success: false, error: "Server busy, please try again." });
  }

  try {
    const fullname = (data.fullname || "").trim();
    const email = (data.email || "").trim().toLowerCase();
    const phone = (data.phone || "").trim();
    const college = (data.college || "").trim();
    const dept = (data.dept || "").trim();
    const year = (data.year || "").trim();
    const events = Array.isArray(data.events) ? data.events.join(", ") : (data.events || "").toString();
    const amount = Number(data.amount) || 100;
    const teamName = (data.teamName || "").trim();
    const teamMembers = Array.isArray(data.teamMembers) ? data.teamMembers.join(", ") : (data.teamMembers || "").toString();
    const participationType = (data.participationType || (teamName ? "Team" : "Solo")).trim();

    let eventsDisplay = events;
    if (teamName) {
      eventsDisplay += " [Team: " + teamName + (teamMembers ? " (" + fullname + ", " + teamMembers + ")" : "") + "]";
    }

    if (!fullname || !email || !phone || !college || !dept || !year) {
      return jsonResponse({ success: false, error: "All required fields must be filled." });
    }

    // Generate unique Registration ID (GRAV-2026-XXXX)
    const existingData = sheet.getDataRange().getValues();
    const existingIds = new Set();
    for (let i = 1; i < existingData.length; i++) {
      existingIds.add(String(existingData[i][0]).toUpperCase());
    }

    let regId = "";
    let attempts = 0;
    do {
      const rand = Math.floor(1000 + Math.random() * 9000);
      regId = "GRAV-2026-" + rand;
      attempts++;
    } while (existingIds.has(regId) && attempts < 100);

    const timestamp = new Date().toISOString();
    const paymentStatus = "PENDING";
    const utr = "";
    const paymentScreenshot = "";
    const verificationTime = "";
    const verifiedBy = "";

    const row = [
      regId,
      timestamp,
      fullname,
      email,
      phone,
      college,
      dept,
      year,
      eventsDisplay,
      amount,
      paymentStatus,
      utr,
      paymentScreenshot,
      verificationTime,
      verifiedBy
    ];

    sheet.appendRow(row);

    return jsonResponse({
      success: true,
      regId: regId,
      fullname: fullname,
      amount: amount,
      paymentStatus: paymentStatus,
      participationType: participationType,
      teamName: teamName,
      teamMembers: teamMembers,
      message: "Registration recorded successfully! Please proceed to payment."
    });
  } finally {
    lock.releaseLock();
  }
}

/**
 * ACTION: submitPayment
 * Updates UTR and marks status as UNDER_VERIFICATION
 */
function handleSubmitPayment(data) {
  const sheet = getOrCreateSheet();
  const lock = LockService.getScriptLock();

  try {
    lock.waitLock(30000);
  } catch (e) {
    return jsonResponse({ success: false, error: "Server busy, please retry." });
  }

  try {
    const regId = (data.regId || "").trim().toUpperCase();
    const utr = (data.utr || "").trim();
    const screenshot = (data.screenshot || "").trim(); // base64 or drive link

    if (!regId || !utr) {
      return jsonResponse({ success: false, error: "Registration ID and UTR / Transaction ID are required." });
    }

    const values = sheet.getDataRange().getValues();
    let rowIndex = -1;

    for (let i = 1; i < values.length; i++) {
      if (String(values[i][0]).trim().toUpperCase() === regId) {
        rowIndex = i + 1; // 1-indexed in Sheets
        break;
      }
    }

    if (rowIndex === -1) {
      return jsonResponse({ success: false, error: "Registration ID not found: " + regId });
    }

    // Column mapping (1-indexed):
    // 11 = Payment Status, 12 = UTR, 13 = Payment Screenshot
    sheet.getRange(rowIndex, 11).setValue("UNDER_VERIFICATION");
    sheet.getRange(rowIndex, 12).setValue(utr);
    if (screenshot) {
      // Store screenshot (truncate if too long for a single cell, or keep first 40000 chars)
      sheet.getRange(rowIndex, 13).setValue(screenshot.substring(0, 45000));
    }

    return jsonResponse({
      success: true,
      regId: regId,
      status: "UNDER_VERIFICATION",
      message: "Payment details submitted! Status updated to PENDING VERIFICATION."
    });
  } finally {
    lock.releaseLock();
  }
}

/**
 * ACTION: checkStatus
 * Looks up registration by Registration ID
 */
function handleCheckStatus(rawRegId) {
  const sheet = getOrCreateSheet();
  const regId = (rawRegId || "").trim().toUpperCase();

  if (!regId) {
    return jsonResponse({ success: false, error: "Registration ID is required." });
  }

  const values = sheet.getDataRange().getValues();

  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    if (String(row[0]).trim().toUpperCase() === regId) {
      return jsonResponse({
        success: true,
        record: {
          regId: row[0],
          timestamp: row[1],
          fullname: row[2],
          email: row[3],
          phone: row[4],
          college: row[5],
          dept: row[6],
          year: row[7],
          events: row[8],
          amount: row[9],
          paymentStatus: row[10] || "PENDING",
          utr: row[11] || "",
          verificationTime: row[13] || "",
          verifiedBy: row[14] || ""
        }
      });
    }
  }

  return jsonResponse({
    success: false,
    error: "Registration ID not found. Please double-check your ID or register."
  });
}

/**
 * Helper to verify Admin Security PIN
 */
function isValidAdminPin(enteredPin) {
  const scriptProps = PropertiesService.getScriptProperties();
  const configuredPin = scriptProps.getProperty("ADMIN_PIN") || DEFAULT_ADMIN_PIN;
  return String(enteredPin).trim() === String(configuredPin).trim();
}

/**
 * ACTION: getRegistrations
 * Returns all registrations (Requires Admin PIN)
 */
function handleGetRegistrations(data) {
  if (!isValidAdminPin(data.adminPin)) {
    return jsonResponse({ success: false, error: "Unauthorized. Invalid Security PIN." });
  }

  const sheet = getOrCreateSheet();
  const values = sheet.getDataRange().getValues();
  const records = [];

  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    if (!row[0]) continue;
    records.push({
      regId: row[0],
      timestamp: row[1],
      fullname: row[2],
      email: row[3],
      phone: row[4],
      college: row[5],
      dept: row[6],
      year: row[7],
      events: row[8],
      amount: row[9],
      paymentStatus: row[10] || "PENDING",
      utr: row[11] || "",
      hasScreenshot: Boolean(row[12]),
      screenshot: row[12] ? String(row[12]).substring(0, 500) : "",
      verificationTime: row[13] || "",
      verifiedBy: row[14] || ""
    });
  }

  return jsonResponse({
    success: true,
    records: records,
    count: records.length
  });
}

/**
 * ACTION: verifyPayment
 * Marks participant payment status as VERIFIED
 */
function handleVerifyPayment(data) {
  if (!isValidAdminPin(data.adminPin)) {
    return jsonResponse({ success: false, error: "Unauthorized. Invalid Security PIN." });
  }

  const sheet = getOrCreateSheet();
  const regId = (data.regId || "").trim().toUpperCase();
  const verifiedBy = (data.verifiedBy || "Organizer").trim();

  if (!regId) {
    return jsonResponse({ success: false, error: "Registration ID is required." });
  }

  const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0]).trim().toUpperCase() === regId) {
      const rowIndex = i + 1;
      const now = new Date().toISOString();
      sheet.getRange(rowIndex, 11).setValue("VERIFIED");
      sheet.getRange(rowIndex, 14).setValue(now);
      sheet.getRange(rowIndex, 15).setValue(verifiedBy);

      return jsonResponse({
        success: true,
        regId: regId,
        paymentStatus: "VERIFIED",
        verificationTime: now,
        verifiedBy: verifiedBy,
        message: "Payment successfully marked as VERIFIED."
      });
    }
  }

  return jsonResponse({ success: false, error: "Registration ID not found: " + regId });
}

/**
 * ACTION: rejectPayment
 * Marks participant payment status as REJECTED
 */
function handleRejectPayment(data) {
  if (!isValidAdminPin(data.adminPin)) {
    return jsonResponse({ success: false, error: "Unauthorized. Invalid Security PIN." });
  }

  const sheet = getOrCreateSheet();
  const regId = (data.regId || "").trim().toUpperCase();
  const reason = (data.reason || "Invalid / mismatched UTR").trim();

  if (!regId) {
    return jsonResponse({ success: false, error: "Registration ID is required." });
  }

  const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0]).trim().toUpperCase() === regId) {
      const rowIndex = i + 1;
      const now = new Date().toISOString();
      sheet.getRange(rowIndex, 11).setValue("REJECTED");
      sheet.getRange(rowIndex, 14).setValue(now);
      sheet.getRange(rowIndex, 15).setValue("Reason: " + reason);

      return jsonResponse({
        success: true,
        regId: regId,
        paymentStatus: "REJECTED",
        message: "Payment marked as REJECTED."
      });
    }
  }

  return jsonResponse({ success: false, error: "Registration ID not found: " + regId });
}

/**
 * Helper to construct JSON response with CORS headers
 */
function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
