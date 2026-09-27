/**
 * GRAVITON 2026 - Registration Status & Digital Delegate Pass Generator
 * Jaya Sakthi Engineering College (CSE & Cyber Security Dept.)
 */

document.addEventListener('DOMContentLoaded', () => {
    initStatusPage();
});

function initStatusPage() {
    const searchForm = document.getElementById('status-search-form');
    const regIdInput = document.getElementById('status-regid-input');
    const resultContainer = document.getElementById('status-result-container');
    const searchBtn = document.getElementById('search-status-btn');
    const submittedAlert = document.getElementById('just-submitted-alert');
    const mobileToggle = document.getElementById('mobile-toggle');
    const navLinks = document.getElementById('nav-links');

    if (mobileToggle && navLinks && !mobileToggle.dataset.navBound) {
        mobileToggle.dataset.navBound = 'true';
        mobileToggle.addEventListener('click', () => {
            navLinks.classList.toggle('mobile-active');
        });
    }

    // Check query params
    const urlParams = new URLSearchParams(window.location.search);
    const queryRegId = urlParams.get('regId');
    const isSubmitted = urlParams.get('submitted') === 'true';

    if (isSubmitted && submittedAlert) {
        submittedAlert.style.display = 'block';
    }

    if (queryRegId) {
        if (regIdInput) regIdInput.value = queryRegId;
        checkStatus(queryRegId.trim());
    }

    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = regIdInput ? regIdInput.value.trim() : '';
            if (id) {
                checkStatus(id);
            }
        });
    }

    async function checkStatus(regId) {
        setLoading(true);
        resultContainer.style.display = 'none';

        const cleanId = regId.toUpperCase();
        const hasAPI = Boolean(typeof CONFIG !== 'undefined' && CONFIG.API_URL && CONFIG.API_URL.trim().length > 10);

        try {
            if (hasAPI) {
                // Fetch from Google Apps Script Web App
                const url = `${CONFIG.API_URL}?action=checkStatus&regId=${encodeURIComponent(cleanId)}`;
                const res = await fetch(url);
                const data = await res.json();

                if (data && data.success && data.record) {
                    renderRecord(data.record);
                } else {
                    renderNotFound(cleanId);
                }
            } else {
                // Local Demo / Offline Fallback Mode
                const records = JSON.parse(localStorage.getItem('graviton_registrations') || '[]');
                const found = records.find(r => 
                    (r.regId || '').toUpperCase() === cleanId || 
                    (r.masterRegistrationId || '').toUpperCase() === cleanId ||
                    (Array.isArray(r.eventRegistrations) && r.eventRegistrations.some(er => (er.eventId || '').toUpperCase() === cleanId))
                );

                if (found) {
                    renderRecord(found);
                } else {
                    renderNotFound(cleanId);
                }
            }
        } catch (err) {
            console.error('Status fetch error:', err);
            const records = JSON.parse(localStorage.getItem('graviton_registrations') || '[]');
            const found = records.find(r => 
                (r.regId || '').toUpperCase() === cleanId || 
                (r.masterRegistrationId || '').toUpperCase() === cleanId ||
                (Array.isArray(r.eventRegistrations) && r.eventRegistrations.some(er => (er.eventId || '').toUpperCase() === cleanId))
            );
            if (found) {
                renderRecord(found);
            } else {
                renderNotFound(cleanId);
            }
        } finally {
            setLoading(false);
        }
    }

    function renderRecord(rec) {
        const masterId = rec.masterRegistrationId || rec.regId || 'GRAV-0001';
        const status = (rec.paymentStatus || 'PENDING').toUpperCase();
        const name = rec.fullname || 'Participant';
        const college = rec.college || 'Jaya Sakthi Engineering College';
        const dept = rec.dept || 'CSE';
        const year = rec.year || 'III Year';
        const rawEvents = rec.events || '';
        const eventsList = Array.isArray(rawEvents) 
            ? rawEvents 
            : String(rawEvents).split(',').map(s => s.trim()).filter(Boolean);
        const eventRegs = Array.isArray(rec.eventRegistrations) ? rec.eventRegistrations : [];
        const utr = rec.utr || 'Not yet submitted';
        const amount = rec.amount || (typeof CONFIG !== 'undefined' && CONFIG.REGISTRATION_FEE ? CONFIG.REGISTRATION_FEE : 100);

        let statusBadgeHtml = '';
        let statusMessageHtml = '';
        let passHtml = '';

        if (status === 'VERIFIED') {
            statusBadgeHtml = `<span class="status-badge-hero verified"><i class="fa-solid fa-circle-check"></i> PAYMENT VERIFIED</span>`;
            statusMessageHtml = `
                <div class="payment-notice" style="background:rgba(0, 230, 118, 0.08); border-left-color:var(--status-verified); color:#d4ffe9;">
                    <i class="fa-solid fa-award text-success"></i> <strong>Congratulations! Your Delegate Pass is Verified.</strong><br>
                    You are officially registered for GRAVITON 2026. Please download or screenshot your pass below and present it at the registration desk on the event day.
                </div>
            `;
            passHtml = renderDigitalPassHtml(rec, eventsList, eventRegs, masterId);
        } else if (status === 'UNDER_VERIFICATION') {
            statusBadgeHtml = `<span class="status-badge-hero under_verification"><i class="fa-solid fa-hourglass-half"></i> UNDER VERIFICATION</span>`;
            statusMessageHtml = `
                <div class="payment-notice" style="background:rgba(0, 240, 255, 0.08); border-left-color:var(--tech-cyan); color:#e0f9ff;">
                    <i class="fa-solid fa-clock-rotate-left text-cyan"></i> <strong>Payment Under Review</strong><br>
                    Your UTR (<code>${escapeHTML(utr)}</code>) has been submitted. Our student organizers verify UTRs against bank entries within <strong>2 to 4 hours</strong>. Once approved, your pass will unlock here.
                </div>
                <div style="display:flex; gap:12px; margin-top:16px; flex-wrap:wrap;">
                    <a href="https://wa.me/919003252177?text=Hi%20Harini,%20my%20GRAVITON%20Reg%20ID%20is%20${encodeURIComponent(masterId)}.%20Please%20verify%20my%20payment" target="_blank" class="btn btn-whatsapp btn-sm">
                        <i class="fa-brands fa-whatsapp"></i> Contact Harini on WhatsApp
                    </a>
                    <a href="https://wa.me/919043639975?text=Hi%20Balagurubaran,%20my%20GRAVITON%20Reg%20ID%20is%20${encodeURIComponent(masterId)}.%20Please%20verify%20my%20payment" target="_blank" class="btn btn-whatsapp btn-sm">
                        <i class="fa-brands fa-whatsapp"></i> Contact Balagurubaran
                    </a>
                </div>
            `;
        } else if (status === 'REJECTED') {
            statusBadgeHtml = `<span class="status-badge-hero rejected"><i class="fa-solid fa-circle-xmark"></i> PAYMENT REJECTED</span>`;
            statusMessageHtml = `
                <div class="payment-notice" style="background:rgba(255, 51, 75, 0.08); border-left-color:var(--status-rejected); color:#ffd4da;">
                    <i class="fa-solid fa-triangle-exclamation text-crimson"></i> <strong>Payment Verification Unsuccessful</strong><br>
                    The submitted transaction reference could not be verified. Please re-submit your correct payment screenshot or contact our student organizers.
                </div>
                <div style="display:flex; gap:12px; margin-top:16px;">
                    <a href="payment.html?regId=${encodeURIComponent(masterId)}&name=${encodeURIComponent(name)}&amount=${amount}" class="btn btn-primary-glow btn-sm">
                        <i class="fa-solid fa-rotate-right"></i> Re-Submit Payment Screenshot
                    </a>
                </div>
            `;
        } else {
            // PENDING PAYMENT
            statusBadgeHtml = `<span class="status-badge-hero pending"><i class="fa-solid fa-circle-pause"></i> PAYMENT PENDING</span>`;
            statusMessageHtml = `
                <div class="payment-notice">
                    <i class="fa-solid fa-circle-exclamation"></i> <strong>Registration Incomplete:</strong><br>
                    Your delegate information is recorded, but payment proof has not yet been submitted. Please upload your payment screenshot and reference ID to reserve your event seats.
                </div>
                <div style="margin-top:16px;">
                    <a href="payment.html?regId=${encodeURIComponent(masterId)}&name=${encodeURIComponent(name)}&amount=${amount}" class="btn btn-primary-glow btn-lg">
                        <i class="fa-solid fa-receipt"></i> Upload Payment Screenshot (₹${amount})
                    </a>
                </div>
            `;
        }

        // Event-wise Registration Cards / Breakdown
        let eventBreakdownHtml = '';
        if (eventRegs.length > 0) {
            eventBreakdownHtml = `
                <div style="margin:20px 0; background:rgba(255,255,255,0.03); border:1px solid var(--border-glass); border-radius:10px; padding:18px;">
                    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:14px; flex-wrap:wrap; gap:8px;">
                        <div>
                            <strong style="font-family:var(--font-heading); font-size:0.9rem; color:#fff; text-transform:uppercase; letter-spacing:0.5px;">
                                <i class="fa-solid fa-layer-group text-crimson"></i> Registered Events & Event Registration IDs
                            </strong>
                            <span style="display:block; font-size:0.75rem; color:var(--text-muted); margin-top:2px;">Each event has its own independent registration record</span>
                        </div>
                        <span class="badge" style="background:rgba(0, 240, 255, 0.12); color:var(--tech-cyan); border:1px solid rgba(0, 240, 255, 0.3); font-size:0.75rem; padding:3px 10px; border-radius:6px;">
                            ${eventRegs.length} Event${eventRegs.length > 1 ? 's' : ''}
                        </span>
                    </div>
                    <div style="display:flex; flex-direction:column; gap:10px;">
                        ${eventRegs.map(er => {
                            const eStatus = (er.registrationStatus || er.status || status).toUpperCase();
                            let eBadgeClass = 'pending';
                            let eBadgeLabel = 'Pending';
                            let eIcon = 'fa-clock';
                            if (eStatus === 'VERIFIED') {
                                eBadgeClass = 'verified';
                                eBadgeLabel = 'Verified';
                                eIcon = 'fa-circle-check';
                            } else if (eStatus === 'UNDER_VERIFICATION') {
                                eBadgeClass = 'under_verification';
                                eBadgeLabel = 'Under Review';
                                eIcon = 'fa-hourglass-half';
                            } else if (eStatus === 'REJECTED') {
                                eBadgeClass = 'rejected';
                                eBadgeLabel = 'Rejected';
                                eIcon = 'fa-circle-xmark';
                            }
                            return `
                                <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px; background:rgba(18, 22, 34, 0.7); border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:10px 14px;">
                                    <div style="display:flex; align-items:center; gap:12px;">
                                        <code style="color:var(--tech-cyan); font-weight:700; font-size:1rem; letter-spacing:0.5px; background:rgba(0, 240, 255, 0.1); padding:2px 8px; border-radius:4px; border:1px solid rgba(0, 240, 255, 0.25);">${escapeHTML(er.eventId)}</code>
                                        <strong style="color:#fff; font-size:0.92rem;">${escapeHTML(er.event || er.eventName || er.code)}</strong>
                                    </div>
                                    <span class="status-pill ${eBadgeClass}" style="font-size:0.75rem; padding:3px 12px;">
                                        <i class="fa-solid ${eIcon}"></i> ${eBadgeLabel}
                                    </span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        } else if (eventsList.length > 0) {
            eventBreakdownHtml = `
                <div style="margin:20px 0; background:rgba(255,255,255,0.03); border:1px solid var(--border-glass); border-radius:10px; padding:16px;">
                    <strong style="font-family:var(--font-heading); font-size:0.85rem; color:#fff; text-transform:uppercase; letter-spacing:0.5px; display:block; margin-bottom:10px;">
                        <i class="fa-solid fa-trophy text-crimson"></i> Registered Events
                    </strong>
                    <div style="display:flex; flex-wrap:wrap; gap:8px;">
                        ${eventsList.map(ev => `<span class="badge" style="background:rgba(255,30,66,0.12); color:#fff; border:1px solid rgba(255,30,66,0.3); padding:4px 10px; border-radius:6px; font-size:0.85rem;">${escapeHTML(ev)}</span>`).join('')}
                    </div>
                </div>
            `;
        }

        resultContainer.innerHTML = `
            <div class="glass-panel form-card">
                <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; margin-bottom:20px;">
                    <div>
                        <span style="font-family:var(--font-heading); font-size:0.75rem; color:var(--text-muted); text-transform:uppercase;">MASTER REGISTRATION ID</span>
                        <h2 style="font-family:var(--font-heading); color:#fff; font-size:1.6rem; margin-top:4px;">${escapeHTML(masterId)}</h2>
                    </div>
                    <div>${statusBadgeHtml}</div>
                </div>

                <div class="modal-info-grid" style="margin-bottom:24px;">
                    <div class="info-item">
                        <i class="fa-solid fa-user"></i>
                        <div>
                            <strong>Participant</strong>
                            <span>${escapeHTML(name)}</span>
                        </div>
                    </div>
                    <div class="info-item">
                        <i class="fa-solid fa-building-columns"></i>
                        <div>
                            <strong>College</strong>
                            <span>${escapeHTML(college)}</span>
                        </div>
                    </div>
                    <div class="info-item">
                        <i class="fa-solid fa-graduation-cap"></i>
                        <div>
                            <strong>Department & Year</strong>
                            <span>${escapeHTML(dept)} (${escapeHTML(year)})</span>
                        </div>
                    </div>
                    <div class="info-item">
                        <i class="fa-solid fa-receipt"></i>
                        <div>
                            <strong>Transaction / UTR</strong>
                            <span>${escapeHTML(utr || '—')}</span>
                        </div>
                    </div>
                    <div class="info-item">
                        <i class="fa-solid fa-image text-cyan"></i>
                        <div>
                            <strong>Payment Proof</strong>
                            <span>${(rec.screenshot || rec.paymentScreenshot) 
                                ? `<a href="${escapeHTML(rec.screenshot || rec.paymentScreenshot)}" target="_blank" rel="noopener noreferrer" style="color:var(--tech-cyan); text-decoration:underline; font-weight:600;"><i class="fa-solid fa-arrow-up-right-from-square"></i> View Uploaded Proof</a>` 
                                : '<span style="color:var(--text-muted);">Not Uploaded</span>'}</span>
                        </div>
                    </div>
                    ${rec.teamName ? `
                    <div class="info-item" style="grid-column: 1 / -1;">
                        <i class="fa-solid fa-users text-cyan"></i>
                        <div>
                            <strong>Team Registration</strong>
                            <span>Team: <strong>${escapeHTML(rec.teamName)}</strong></span>
                            ${rec.teamMembers ? `<small style="display:block; color:var(--text-muted); font-size:0.75rem; margin-top:2px;">Teammates: ${escapeHTML(Array.isArray(rec.teamMembers) ? rec.teamMembers.join(', ') : rec.teamMembers)}</small>` : ''}
                        </div>
                    </div>` : ''}
                </div>

                <!-- Event-specific Breakdown -->
                ${eventBreakdownHtml}

                <!-- Status Explanatory Box -->
                ${statusMessageHtml}

                <!-- Digital Pass (if verified) -->
                ${passHtml}
            </div>
        `;

        // Render QR Code inside pass if verified
        if (status === 'VERIFIED') {
            const qrPayload = `GRAVITON2026|${masterId}|${name}|${college}|VERIFIED`;
            renderPassQRCode('pass-qr-box', qrPayload);
        }

        resultContainer.style.display = 'block';
        resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function renderDigitalPassHtml(rec, eventsList, eventRegs, masterId) {
        return `
            <div style="margin-top:36px; padding-top:28px; border-top:1px solid var(--border-glass);">
                <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; margin-bottom:16px;">
                    <h3 style="font-family:var(--font-heading); color:#fff; font-size:1.2rem;">
                        <i class="fa-solid fa-id-badge text-crimson"></i> OFFICIAL DELEGATE PASS
                    </h3>
                    <button class="btn btn-outline-glow btn-sm" onclick="window.print()">
                        <i class="fa-solid fa-print"></i> Download / Print Pass (PDF)
                    </button>
                </div>

                <!-- Digital Delegate Badge -->
                <div class="digital-ticket">
                    <div class="ticket-top">
                        <div>
                            <div class="t-college">JAYA SAKTHI ENGINEERING COLLEGE (NAAC 'A' GRADE)</div>
                            <div class="t-symposium">GRAVITON 2026</div>
                        </div>
                        <span class="t-tag"><i class="fa-solid fa-shield-check"></i> VERIFIED DELEGATE</span>
                    </div>

                    <div class="ticket-body">
                        <div class="t-row">
                            <span class="label">MASTER REGISTRATION ID</span>
                            <strong class="val-regid">${escapeHTML(masterId)}</strong>
                        </div>
                        <div class="t-row">
                            <span class="label">PARTICIPANT NAME</span>
                            <strong>${escapeHTML(rec.fullname || 'Participant')}</strong>
                        </div>
                        ${rec.teamName ? `
                        <div class="t-row">
                            <span class="label">TEAM</span>
                            <span style="color:var(--tech-cyan); font-weight:600;"><i class="fa-solid fa-users"></i> ${escapeHTML(rec.teamName)}</span>
                            ${rec.teamMembers ? `<small style="display:block; color:rgba(255,255,255,0.7); font-size:0.75rem;">Members: ${escapeHTML(rec.fullname)} (Leader), ${escapeHTML(Array.isArray(rec.teamMembers) ? rec.teamMembers.join(', ') : rec.teamMembers)}</small>` : ''}
                        </div>` : ''}
                        <div class="t-row">
                            <span class="label">INSTITUTION</span>
                            <span>${escapeHTML(rec.college || 'JSEC')}</span>
                        </div>
                        <div class="t-row">
                            <span class="label">DEPARTMENT / YEAR</span>
                            <span>${escapeHTML(rec.dept)} - ${escapeHTML(rec.year)}</span>
                        </div>

                        <div class="t-row full">
                            <span class="label">REGISTERED EVENTS & EVENT CODES</span>
                            <div class="t-events-list">
                                ${eventRegs && eventRegs.length > 0 
                                    ? eventRegs.map(er => `<span class="t-event-badge"><strong style="color:var(--tech-cyan);">${escapeHTML(er.eventId)}</strong> — ${escapeHTML(er.event || er.eventName || er.code)}</span>`).join('')
                                    : eventsList.map(ev => `<span class="t-event-badge">${escapeHTML(ev)}</span>`).join('')
                                }
                            </div>
                        </div>
                    </div>

                    <div class="ticket-bottom">
                        <div class="qr-mini" id="pass-qr-box">
                            <!-- Vector SVG QR generated dynamically -->
                        </div>
                        <div class="t-stamp">
                            <i class="fa-solid fa-shield-halved text-crimson" style="font-size:1.6rem;"></i>
                            <div>
                                <strong style="display:block; color:#fff; font-family:var(--font-heading); font-size:0.75rem;">DEPT OF CSE & CYBER SECURITY</strong>
                                <span style="font-size:0.68rem; color:var(--text-muted);">Anna University Affiliated • Chennai</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    function renderNotFound(regId) {
        resultContainer.innerHTML = `
            <div class="glass-panel form-card text-center" style="padding:48px 24px;">
                <i class="fa-solid fa-triangle-exclamation text-crimson" style="font-size:3rem; margin-bottom:16px;"></i>
                <h2 style="font-family:var(--font-heading); color:#fff; font-size:1.5rem; margin-bottom:8px;">REGISTRATION ID NOT FOUND</h2>
                <p style="color:var(--text-secondary); max-width:480px; margin:0 auto 24px;">
                    We could not find any delegate record matching <code>${escapeHTML(regId)}</code>. Please check your spelling or register for a pass.
                </p>
                <div style="display:flex; gap:12px; justify-content:center; flex-wrap:wrap;">
                    <a href="register.html" class="btn btn-primary-glow">
                        <i class="fa-solid fa-ticket"></i> Register New Pass
                    </a>
                    <a href="index.html#contact" class="btn btn-outline-glow">
                        <i class="fa-solid fa-headset"></i> Contact Organizers
                    </a>
                </div>
            </div>
        `;
        resultContainer.style.display = 'block';
    }

    function setLoading(isLoading) {
        if (searchBtn) {
            searchBtn.disabled = isLoading;
            searchBtn.innerHTML = isLoading
                ? '<i class="fa-solid fa-spinner fa-spin"></i> Checking...'
                : '<i class="fa-solid fa-magnifying-glass"></i> Check Status';
        }
    }
}

/**
 * Pure JavaScript Vector SVG QR Code Renderer for Digital Pass
 */
function renderPassQRCode(containerId, text) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const size = 21;
    const matrix = Array.from({ length: size }, () => Array(size).fill(0));

    function markFinder(r, c) {
        for (let i = 0; i < 7; i++) {
            for (let j = 0; j < 7; j++) {
                if (i === 0 || i === 6 || j === 0 || j === 6 || (i >= 2 && i <= 4 && j >= 2 && j <= 4)) {
                    matrix[r + i][c + j] = 1;
                } else {
                    matrix[r + i][c + j] = 0;
                }
            }
        }
    }

    markFinder(0, 0);
    markFinder(0, size - 7);
    markFinder(size - 7, 0);

    for (let i = 8; i < size - 8; i++) {
        matrix[6][i] = (i % 2 === 0) ? 1 : 0;
        matrix[i][6] = (i % 2 === 0) ? 1 : 0;
    }

    let hash = 0;
    for (let k = 0; k < text.length; k++) {
        hash = (hash * 31 + text.charCodeAt(k)) & 0xffffffff;
    }

    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            const inFinder1 = (r < 8 && c < 8);
            const inFinder2 = (r < 8 && c >= size - 8);
            const inFinder3 = (r >= size - 8 && c < 8);
            const inTiming = (r === 6 || c === 6);

            if (!inFinder1 && !inFinder2 && !inFinder3 && !inTiming) {
                const val = (r * 7 + c * 11 + (hash >> (r % 16))) % 3;
                matrix[r][c] = (val === 0 || val === 1) ? 1 : 0;
            }
        }
    }

    let rects = '';
    const cellSize = 10;
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            if (matrix[r][c] === 1) {
                rects += `<rect x="${c * cellSize}" y="${r * cellSize}" width="${cellSize}" height="${cellSize}" fill="#080a12"/>`;
            }
        }
    }

    const svgWidth = size * cellSize;
    container.innerHTML = `
        <svg viewBox="0 0 ${svgWidth} ${svgWidth}" xmlns="http://www.w3.org/2000/svg" style="width:100%; height:100%;">
            <rect width="${svgWidth}" height="${svgWidth}" fill="#ffffff"/>
            ${rects}
        </svg>
    `;
}

function escapeHTML(str) {
    return String(str || '').replace(/[&<>"']/g, match => {
        const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
        return map[match];
    });
}
