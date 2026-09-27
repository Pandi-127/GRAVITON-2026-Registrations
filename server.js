const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static frontend files
app.use(express.static(__dirname));

// Nodemailer Gmail SMTP Transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_USER || 'gravtion2026@gmail.com',
    pass: (process.env.GMAIL_PASS || 'ykphffkqxfkgfamu').replace(/\s+/g, '')
  }
});

// Verify SMTP connection on startup
transporter.verify((err, success) => {
  if (err) {
    console.error('❌ SMTP Connection Warning:', err.message);
  } else {
    console.log('✅ SMTP Server Ready to send emails via gravtion2026@gmail.com');
  }
});

// Helper to construct HTML email
function buildConfirmationEmail(p) {
  const masterId = p.masterRegId || p.regId || 'GRAV-2026';
  const name = p.fullname || 'Delegate';
  const college = p.college || 'Institution';
  const dept = p.dept || 'Engineering';
  const year = p.year || 'Student';
  const phone = p.phone || '—';
  const amount = p.amount || 100;
  const utr = p.utr || 'VERIFIED';
  const events = p.events || 'GRAVITON 2026 Events';
  const teamName = p.teamName || '';
  const teamMembers = p.teamMembers || '';

  const passUrl = `https://graviton26.vercel.app/status.html?regId=${encodeURIComponent(masterId)}`;

  const teamHtml = teamName ? `
    <div style="background: rgba(255, 51, 75, 0.08); border: 1px solid rgba(255, 51, 75, 0.3); border-radius: 8px; padding: 12px 16px; margin-top: 14px;">
      <div style="color: #ff334b; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Team Participation</div>
      <div style="color: #ffffff; font-size: 14px; margin-top: 4px;"><strong>Team Name:</strong> ${teamName}</div>
      ${teamMembers ? `<div style="color: #cbd5e1; font-size: 13px; margin-top: 2px;"><strong>Members:</strong> ${teamMembers}</div>` : ''}
    </div>
  ` : '';

  const htmlBody = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>GRAVITON 2026 Confirmation</title></head>
<body style="margin: 0; padding: 0; background-color: #060913; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #060913; padding: 24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 620px; background: #0e1626; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.6);">
        <tr>
          <td style="background: linear-gradient(135deg, #b3001b 0%, #ff334b 60%, #0e1626 100%); padding: 26px 20px; text-align: center;">
            <div style="color: rgba(255,255,255,0.9); font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 4px;">Jaya Sakthi Engineering College</div>
            <div style="color: #ffffff; font-size: 11px; opacity: 0.85;">NAAC 'A' Grade Accredited • Anna University Affiliated</div>
            <div style="height: 1px; background: rgba(255,255,255,0.25); margin: 12px auto; max-width: 280px;"></div>
            <h1 style="color: #ffffff; font-size: 26px; font-weight: 800; margin: 0; letter-spacing: 2px;">GRAVITON 2026</h1>
            <div style="color: #00f0ff; font-size: 13px; font-weight: 600; margin-top: 4px;">Department of Computer Science & Engineering and Cyber Security</div>
          </td>
        </tr>
        <tr>
          <td style="padding: 24px 28px 12px 28px; text-align: center;">
            <div style="display: inline-block; background: #003318; border: 1px solid #00e676; color: #00e676; padding: 8px 18px; border-radius: 50px; font-size: 13px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;">
              ✓ Payment & Pass Verified
            </div>
            <h2 style="color: #ffffff; font-size: 20px; font-weight: 700; margin: 16px 0 6px 0;">Official Registration Confirmation</h2>
            <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0;">
              Dear <strong style="color: #ffffff;">${name}</strong>, congratulations! Your payment for <strong>GRAVITON 2026</strong> has been verified by the organizing committee. Your official delegate credentials are confirmed below.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding: 12px 28px;">
            <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background: rgba(0, 240, 255, 0.04); border: 1px dashed rgba(0, 240, 255, 0.4); border-radius: 12px; padding: 18px; text-align: center;">
              <tr><td>
                <div style="color: #94a3b8; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Master Delegate Registration ID</div>
                <div style="color: #00f0ff; font-size: 24px; font-weight: 800; letter-spacing: 2px; font-family: monospace; margin: 6px 0;">${masterId}</div>
                <div style="color: #cbd5e1; font-size: 12px;">Present this ID or your digital pass at the registration desk.</div>
              </td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding: 12px 28px;">
            <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background: #121b2d; border: 1px solid #1e293b; border-radius: 12px; padding: 16px;">
              <tr><td style="padding: 6px 8px; color: #94a3b8; font-size: 13px; width: 40%;">Participant Name:</td><td style="padding: 6px 8px; color: #ffffff; font-size: 13px; font-weight: 600;">${name}</td></tr>
              <tr><td style="padding: 6px 8px; color: #94a3b8; font-size: 13px;">College / Institution:</td><td style="padding: 6px 8px; color: #ffffff; font-size: 13px; font-weight: 600;">${college}</td></tr>
              <tr><td style="padding: 6px 8px; color: #94a3b8; font-size: 13px;">Department & Year:</td><td style="padding: 6px 8px; color: #ffffff; font-size: 13px; font-weight: 600;">${dept} • ${year}</td></tr>
              <tr><td style="padding: 6px 8px; color: #94a3b8; font-size: 13px;">Registered Phone:</td><td style="padding: 6px 8px; color: #ffffff; font-size: 13px; font-weight: 600;">${phone}</td></tr>
              <tr><td style="padding: 6px 8px; color: #94a3b8; font-size: 13px;">Registration Fee:</td><td style="padding: 6px 8px; color: #00e676; font-size: 13px; font-weight: 700;">₹${amount} (PAID & VERIFIED)</td></tr>
              <tr><td style="padding: 6px 8px; color: #94a3b8; font-size: 13px;">Transaction / UTR:</td><td style="padding: 6px 8px; color: #00f0ff; font-size: 13px; font-family: monospace; font-weight: 600;">${utr}</td></tr>
            </table>
            ${teamHtml}
          </td>
        </tr>
        <tr>
          <td style="padding: 16px 28px 8px 28px;">
            <h3 style="color: #ffffff; font-size: 15px; font-weight: 700; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.5px;">Registered Events</h3>
            <div style="background: rgba(0, 240, 255, 0.05); border: 1px solid rgba(0, 240, 255, 0.25); border-radius: 8px; padding: 12px 16px;">
              <strong style="color: #ffffff; font-size: 15px;">${events}</strong>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding: 12px 28px;">
            <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid #1e293b; border-radius: 12px; padding: 18px;">
              <h4 style="color: #ff334b; font-size: 14px; font-weight: 700; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 0.5px;">Event Day Guidelines & Logistics</h4>
              <ul style="margin: 0; padding-left: 20px; color: #cbd5e1; font-size: 13px; line-height: 1.7;">
                <li><strong>Reporting Time:</strong> 8:30 AM IST (Registration desk opens at 8:00 AM).</li>
                <li><strong>Venue:</strong> Jaya Sakthi Engineering College, St. Thomas College Road, Thiruninravur, Chennai - 602 024.</li>
                <li><strong>Mandatory:</strong> Bring your <strong>physical College ID Card</strong> (strict entry requirement).</li>
                <li><strong>Presentation Delegates:</strong> Bring PPT slides on a pen drive and keep a backup in your email.</li>
                <li><strong>Included:</strong> Participation certificate and lunch provided to all registered delegates.</li>
              </ul>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding: 16px 28px 24px 28px; text-align: center;">
            <a href="${passUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #00f0ff, #00a8ff); color: #060913; font-weight: 800; font-size: 14px; text-decoration: none; padding: 14px 32px; border-radius: 8px; letter-spacing: 0.5px;">
              View Digital Delegate Pass Online →
            </a>
          </td>
        </tr>
        <tr>
          <td style="padding: 0 28px 24px 28px;">
            <div style="border-top: 1px solid #1e293b; padding-top: 18px; text-align: center;">
              <div style="color: #94a3b8; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-bottom: 8px;">Student Coordinator Contacts</div>
              <div style="font-size: 13px; color: #cbd5e1; line-height: 1.6;">
                <strong>Harini:</strong> <a href="https://wa.me/919003252177" style="color: #00f0ff; text-decoration: none;">+91 90032 52177 (WhatsApp)</a> &nbsp;|&nbsp; 
                <strong>Balagurubaran:</strong> <a href="https://wa.me/919043639975" style="color: #00f0ff; text-decoration: none;">+91 90436 39975 (WhatsApp)</a>
              </div>
            </div>
          </td>
        </tr>
        <tr>
          <td style="background: #080d17; padding: 18px 24px; text-align: center; border-top: 1px solid #1e293b;">
            <p style="color: #64748b; font-size: 11px; margin: 0; line-height: 1.5;">
              GRAVITON 2026 • Department of CSE & Cyber Security • Jaya Sakthi Engineering College<br>
              This is an automated confirmation sent upon payment verification.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  const plainTextBody = `GRAVITON 2026 - OFFICIAL REGISTRATION CONFIRMATION
Jaya Sakthi Engineering College (NAAC 'A' Grade | Anna Univ. Affiliated)
Department of Computer Science & Engineering and Cyber Security

Dear ${name},

Congratulations! Your payment for GRAVITON 2026 has been verified by the organizing committee. Your official delegate credentials are confirmed.

============================================================
DELEGATE CREDENTIALS:
============================================================
Master Registration ID : ${masterId}
Participant Name       : ${name}
College / Institution  : ${college}
Department & Year      : ${dept} (${year})
Registered Phone       : ${phone}
Amount Paid            : ₹${amount} (PAID & VERIFIED)
Payment UTR / Ref      : ${utr}
${teamName ? `Team: ${teamName} (${teamMembers})` : ''}

============================================================
REGISTERED EVENTS:
============================================================
${events}

============================================================
EVENT LOGISTICS & IMPORTANT CHECKLIST:
============================================================
- Reporting Time : 8:30 AM IST (Registration desk opens at 8:00 AM)
- Venue          : Jaya Sakthi Engineering College, Thiruninravur, Chennai - 602 024
- College ID     : Mandatory physical College ID card required for campus entry.
- Presentation   : Carry your slides on a USB pen drive + keep an email backup.
- Lunch & Kit    : Provided to all registered participants.

View Digital Delegate Pass Online:
${passUrl}

============================================================
COORDINATOR CONTACTS:
============================================================
- Harini (Student Coordinator)       : +91 90032 52177
- Balagurubaran (Student Coordinator): +91 90436 39975

We look forward to seeing you at GRAVITON 2026!
Code • Create • Compete • Conquer`;

  return { htmlBody, plainTextBody, subject: `🎟️ Payment Verified & Confirmed | GRAVITON 2026 [${masterId}]` };
}

// API Endpoint to send automated confirmation email
app.post('/api/send-email', async (req, res) => {
  try {
    const p = req.body.participant || req.body;
    const toEmail = (p.email || '').trim();

    if (!toEmail || !toEmail.includes('@')) {
      return res.status(400).json({ success: false, error: 'Valid participant email is required.' });
    }

    const { htmlBody, plainTextBody, subject } = buildConfirmationEmail(p);

    const info = await transporter.sendMail({
      from: '"GRAVITON 2026 Organizing Committee" <gravtion2026@gmail.com>',
      to: toEmail,
      subject: subject,
      html: htmlBody,
      text: plainTextBody
    });

    console.log(`✅ [SMTP] Automated confirmation email dispatched to: ${toEmail} [Message ID: ${info.messageId}]`);
    res.json({
      success: true,
      recipientEmail: toEmail,
      messageId: info.messageId,
      message: `Confirmation email dispatched to ${toEmail}`
    });
  } catch (err) {
    console.error('❌ [SMTP] Error sending confirmation email:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`🚀 GRAVITON 2026 Local Server running on http://localhost:${PORT}`);
});
