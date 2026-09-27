# 🚀 GRAVITON 2026 - National Level College Technical Symposium
> **Department of Computer Science & Engineering & Cyber Security**  
> **Jaya Sakthi Engineering College (NAAC 'A' Grade | AICTE Approved | Anna Univ. Affiliated)**  
> *Thiruninravur, Chennai - 602 024, Tamil Nadu*  
> **Theme:** *IDEAS BEYOND LIMITS*

---

## 📖 1. Project Overview

**GRAVITON 2026** is a premium, futuristic, dark cosmic symposium web platform engineered with vanilla HTML5, CSS3, and JavaScript. It provides a complete end-to-end digital experience for college symposiums:

- **Cinematic Landing Page:** Atmospheric cosmic particle canvas, futuristic hero section with integrated animated warrior artwork, countdown timer, interactive 12+ event cards with category filtering, rules & guidelines modals, and symposium schedule.
- **Dedicated Registration Portal (`/register.html`):** Multi-step registration allowing delegates to select their event across Technical and Non-Technical categories under their pass.
- **Dynamic UPI Payment Gateway (`/payment.html`):** Dynamic peer-to-peer UPI QR code generation, deep link button to open mobile UPI apps (GPay, PhonePe, Paytm), and 12-digit UTR/transaction ID submission with optional screenshot upload.
- **Real-Time Status Tracker & Digital Pass (`/status.html`):** Live verification tracking with automatic unlocks for official **Digital Delegate Passes** complete with verified QR codes, college affiliations, and print/PDF support.
- **Organizer Admin Dashboard (`/admin.html`):** Secure PIN-protected organizer dashboard to view delegate lists, verify/reject payments, contact participants directly via WhatsApp, and export full registries to Excel (.csv).
- **Lightweight Serverless Backend (`apps-script.gs`):** Powered by Google Apps Script with Google Sheets as the persistent database. Zero hosting cost, zero complex infrastructure, and 100% static Vercel compatible!

---

## 📁 2. Folder Structure

```
graviton2026/
├── index.html          # Cinematic Main Landing Page (Hero, About, Events, Schedule, Venue, Contacts)
├── register.html       # Delegate Registration Portal
├── register.js         # Registration Form Validation & Submission Logic
├── payment.html        # UPI Payment Gateway Page with Dynamic QR Code
├── payment.js          # UPI Deep Links, Vector QR Renderer & UTR Submission
├── status.html         # Pass Status Tracker & Digital Delegate Pass
├── status.js           # Live Status Checker & Printable Pass Generator
├── admin.html          # Organizer Management Portal
├── admin.js            # Admin Dashboard, PIN Authentication, UTR Verification & Excel Export
├── config.js           # Central Configuration (API_URL, UPI_ID, Fees, Contacts)
├── apps-script.gs      # Google Apps Script Backend Code for Google Sheets
├── style.css           # Comprehensive Sci-Fi Dark Cosmic Design System
├── README.md           # Full Documentation & Deployment Guide
└── assets/
    └── hero_warrior.png # High-Resolution Sci-Fi Hero Artwork
```

---

## 📊 3. Google Sheet Setup (Step-by-Step)

1. Open your browser and go to [Google Sheets](https://sheets.new).
2. Create a new blank spreadsheet.
3. Rename the spreadsheet to:
   ```
   GRAVITON 2026 Registrations
   ```
4. Rename the default sheet tab at the bottom from `Sheet1` to:
   ```
   Registrations
   ```
5. *(Optional)* You can manually add the headers or let `apps-script.gs` automatically create and style the headers on first run:
   - `Registration ID`
   - `Timestamp`
   - `Full Name`
   - `Email`
   - `Phone`
   - `College`
   - `Department`
   - `Year`
   - `Selected Events`
   - `Amount`
   - `Payment Status`
   - `UTR`
   - `Payment Screenshot`
   - `Verification Time`
   - `Verified By`

---

## ⚡ 4. Google Apps Script Setup

1. In your newly created Google Sheet, click on the top menu:  
   **Extensions** → **Apps Script**.
2. A new tab will open with the Apps Script code editor.
3. Delete any default code inside `Code.gs`.
4. Open the file [`apps-script.gs`](apps-script.gs) in this project, copy its entire contents, and paste it into the Apps Script editor.
5. Click the **Save** icon (floppy disk) or press `Ctrl + S`.
6. *(Optional)* Set a custom Security PIN:
   - Click the gear icon on the left navigation (**Project Settings**).
   - Scroll down to **Script Properties** → Click **Add script property**.
   - Property: `ADMIN_PIN` | Value: `your_secret_pin` (e.g. `2026`).
   - If you skip this, the default PIN `2026` will be used.

---

## 🌐 5. Deploying Google Apps Script as a Web App

To allow the static website to submit and retrieve registrations:

1. In the top right corner of the Apps Script editor, click **Deploy** → **New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Fill in the fields:
   - **Description:** `GRAVITON 2026 API`
   - **Execute as:** `Me (your_email@gmail.com)`
   - **Who has access:** `Anyone`  
     *(⚠️ IMPORTANT: This MUST be set to "Anyone" so participants and the static frontend can submit registrations without requiring Google login!)*
4. Click **Deploy**.
5. When prompted to **Authorize Access**:
   - Choose your Google account.
   - Click **Advanced** (at the bottom left of the warning popup).
   - Click **Go to Untitled project (unsafe)** or **Go to GRAVITON (unsafe)**.
   - Click **Allow**.
6. Google will provide a **Web App URL** that ends in `/exec`:
   ```
   https://script.google.com/macros/s/AKfycbx.../exec
   ```
7. Copy this URL.

---

## ⚙️ 6. How to Configure `config.js`

Open [`config.js`](config.js) in your code editor and update the fields:

```javascript
const CONFIG = {
    // 1. Google Apps Script Web App URL:
    API_URL: "https://script.google.com/macros/s/AKfycb.../exec",

    // 2. Cashfree Payment Link (Optional but Recommended):
    CASHFREE_PAYMENT_LINK: "https://payments.cashfree.com/links/...", // Your Cashfree Payment Link

    // 3. Direct UPI ID (Fallback peer-to-peer):
    UPI_ID: "9003252177@okaxis", // Student Chair Harini's UPI or symposium UPI
    UPI_NAME: "GRAVITON 2026",
    REGISTRATION_FEE: 100, // INR
    // ...
};
```

### 💳 Creating a Cashfree Payment Link (Step-by-Step)
1. Log into your [Cashfree Merchant Dashboard](https://merchant.cashfree.com).
2. Go to **Payment Gateway** → **Payment Links**.
3. Click **Create Payment Link**.
4. Fill in:
   - **Title / Purpose:** `GRAVITON 2026 Delegate Pass`
   - **Amount:** `100` (or your registration fee)
   - **Customer Details:** Can be left open or ask for Name/Email/Phone.
5. Click **Create Link**.
6. Copy the generated payment link (e.g. `https://payments.cashfree.com/links/...`).
7. Paste it into `CASHFREE_PAYMENT_LINK` in `config.js`. When set, participants can click **"Pay via Cashfree"** to checkout via Credit/Debit Cards, UPI, NetBanking, and Wallets!

---

## 💳 7. How Organizer Verification Works

1. **Participant Registration:**
   - Delegate fills the form at [`register.html`](register.html).
   - A unique Registration ID (`GRAV-2026-XXXX`) is generated and recorded in Google Sheets with `Payment Status: PENDING`.
2. **UPI Payment & UTR Submission:**
   - Participant scans the dynamic UPI QR code or clicks "Pay Using UPI App" on [`payment.html`](payment.html).
   - Participant transfers ₹100 via their preferred UPI app (GPay/PhonePe/Paytm/BHIM).
   - Participant enters the 12-digit **UTR / Transaction ID** and clicks "Submit Payment".
   - The status updates to `UNDER_VERIFICATION`.
3. **Organizer Approval (`admin.html`):**
   - Organizer logs into [`admin.html`](admin.html) using the Security PIN (default: `2026`).
   - Organizer matches the participant's UTR against the symposium bank/UPI statement.
   - Click **Mark Verified** (green check) or **Mark Rejected** (red cross).
4. **Digital Pass Release:**
   - Once verified, the participant checking [`status.html`](status.html) instantly receives their official **Digital Delegate Pass** featuring a holographic seal and scannable QR verification code.

---

## 🚀 8. How to Deploy on Vercel (Zero Build Step)

Since the website is built with pure Vanilla HTML5, CSS3, and JavaScript, **no build process, Node.js, or bundlers are required**:

### Option A: Via GitHub (Recommended)
1. Push this folder to your GitHub repository:
   ```bash
   git add .
   git commit -m "Deploy GRAVITON 2026 Symposium Website"
   git push origin main
   ```
2. Go to [Vercel](https://vercel.com) and log in.
3. Click **Add New...** → **Project**.
4. Select your GitHub repository.
5. In the configuration screen:
   - **Framework Preset:** `Other` (or leave default)
   - **Root Directory:** `./`
   - **Build Command:** *(Leave blank)*
   - **Output Directory:** *(Leave blank)*
6. Click **Deploy**. Your website will be live worldwide in under 30 seconds with a free `.vercel.app` domain and HTTPS!

### Option B: Via Vercel CLI
```bash
npm install -g vercel
vercel
```

---

## 🏆 9. Event Catalog & Rules

All 12 events are faithfully preserved from the department's syllabus:

### Technical Arenas (7 Events)
1. **PPT Presentation:** 10 mins presentation + 10 mins Q&A before expert panel. (Team 1-3)
2. **Tech Quiz:** 3 rounds covering CS, Cyber Security, and AI lore. (Solo / Duo)
3. **AI Prompt Battle:** Craft precise generative prompts to reproduce target media. (Individual)
4. **Reverse Coding:** Analyze blackbox inputs/outputs to reconstruct algorithm. (Individual)
5. **CTF (Capture The Flag):** Web Exploitation, Cryptography, Steganography & Forensics flags. (Team 1-2)
6. **Web Creation Without Using AI:** Build pure HTML/CSS/JS responsive webpage without AI tools. (Individual)
7. **Data Grid:** Clean messy data & formulate complex SQL queries under time constraint. (Individual)

### Non-Technical Showcases (5 Events)
8. **Meme Marketing:** Craft viral, humorous tech memes for brand campaigns. (Solo / Duo)
9. **Number Logic Battle:** Rapid mental arithmetic, sequences, and numerical puzzles. (Individual)
10. **E Sports Battle:** Tactical tournament matches (custom rooms & knockouts). (Squad 4)
11. **Squid Game:** High-stakes physical and mental agility survival challenges. (Individual)
12. **Treasure Hunt:** Decode cryptic technical clues hidden across campus. (Team 2-3)

---

## 🔒 10. Security Notes

- **Zero Credential Exposure:** Never put Google Service Account keys, Sheet IDs, or admin passwords in `config.js` or client-side files.
- **Server-Side Validation:** All status mutations (`verifyPayment`, `rejectPayment`, `getRegistrations`) are authenticated inside Google Apps Script using the secret `ADMIN_PIN`.
- **Payment Verification Integrity:** Client-side requests cannot directly mark a pass as `VERIFIED`. Pass generation is only enabled when the record status is confirmed `VERIFIED` by the backend.
- **Sanitized Inputs:** All dynamic user values rendered to the DOM are escaped using `escapeHTML` to prevent Cross-Site Scripting (XSS).

---

## 📞 Support Contacts
- **Harini (Student Chair Person):** [+91 90032 52177](tel:+919003252177) | [WhatsApp](https://wa.me/919003252177)
- **Balagurubaran (Student Chair Person):** [+91 90436 39975](tel:+919043639975) | [WhatsApp](https://wa.me/919043639975)
- **Institution:** Jaya Sakthi Engineering College, Thiruninravur, Chennai - 602 024.
