/**
 * GRAVITON 2026 - Central Configuration File
 * Jaya Sakthi Engineering College - Dept. of CSE & Cyber Security
 *
 * NOTE: For security, never put private Google Sheet credentials or
 * admin passwords in this frontend file. All verification logic is handled
 * securely in Google Apps Script (apps-script.gs).
 */

const CONFIG = {
    // =========================================================================
    // 1. GOOGLE APPS SCRIPT WEB APP API URL
    // =========================================================================
    // Deploy your apps-script.gs as a Web App (Access: Anyone) and paste the URL here.
    // Example: "https://script.google.com/macros/s/AKfycb.../exec"
    // Leave empty to run in Local Demo / Offline Fallback Mode.
    // =========================================================================
    API_URL: "https://script.google.com/macros/s/AKfycbzT9CjwAQpImUTnSUAMgkIjwa_JkR-fbhozcDHBi-FX7GHkz-RIqpl_wXCaDaaGDCNwMA/exec",

    // =========================================================================
    // 2. UPI PAYMENT CONFIGURATION
    // =========================================================================
    // This UPI ID will receive registration payments.
    // The payment page dynamically generates a UPI QR code with this ID.
    // =========================================================================
    UPI_ID: "9003252177@okaxis", // CONFIGURE THIS: Enter organizer UPI ID (e.g. yourname@okaxis / phone@upi)
    UPI_NAME: "GRAVITON 2026",    // Display name on UPI payment apps
    REGISTRATION_FEE: 100,        // Registration fee in Indian Rupees (INR)

    // =========================================================================
    // 3. SYMPOSIUM METADATA
    // =========================================================================
    SYMPOSIUM_NAME: "GRAVITON 2026",
    SYMPOSIUM_TAGLINE: "IDEAS BEYOND LIMITS",
    COLLEGE_NAME: "Jaya Sakthi Engineering College",
    COLLEGE_ACCREDITATION: "NAAC 'A' Grade | AICTE Approved | Anna Univ. Affiliated",
    CAMPUS_LOCATION: "Thiruninravur, Chennai - 602 024, Tamil Nadu",
    DEPARTMENT: "Department of Computer Science & Engineering & Cyber Security",

    // =========================================================================
    // 4. STUDENT CHAIR PERSONS CONTACTS
    // =========================================================================
    CONTACTS: [
        {
            name: "HARINI",
            role: "Student Chair Person",
            phone: "+91 90032 52177",
            tel: "+919003252177",
            whatsapp: "919003252177"
        },
        {
            name: "BALAGURUBARAN",
            role: "Student Chair Person",
            phone: "+91 90436 39975",
            tel: "+919043639975",
            whatsapp: "919043639975"
        }
    ]
};

// Freeze configuration to prevent accidental modification at runtime
if (typeof Object.freeze === 'function') {
    Object.freeze(CONFIG);
}
