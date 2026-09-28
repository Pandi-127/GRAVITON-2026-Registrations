/**
 * GRAVITON 2026 - Organizer Admin Dashboard Logic
 * Jaya Sakthi Engineering College (CSE & Cyber Security Dept.)
 */

let currentAdminPin = '';
let allRegistrations = [];
let currentFilter = 'ALL';
let currentEventFilter = 'ALL';
let currentSearch = '';

document.addEventListener('DOMContentLoaded', () => {
    initAdminPage();
});

function initAdminPage() {
    const loginForm = document.getElementById('admin-login-form');
    const pinInput = document.getElementById('admin-pin');
    const loginError = document.getElementById('login-error');
    const loginBtn = document.getElementById('login-btn');
    const loginContainer = document.getElementById('login-container');
    const dashboardContainer = document.getElementById('dashboard-container');
    const logoutBtn = document.getElementById('admin-logout-btn');
    const searchInput = document.getElementById('admin-search-input');
    const refreshBtn = document.getElementById('btn-refresh-data');
    const exportBtn = document.getElementById('btn-export-excel');
    const filterTabs = document.querySelectorAll('#status-filter-tabs .tab-btn');
    const eventFilterSelect = document.getElementById('admin-event-filter');
    const mobileToggle = document.getElementById('mobile-toggle');
    const navLinks = document.getElementById('nav-links');

    if (mobileToggle && navLinks && !mobileToggle.dataset.navBound) {
        mobileToggle.dataset.navBound = 'true';
        mobileToggle.addEventListener('click', () => {
            navLinks.classList.toggle('mobile-active');
        });
    }

    // Check if session PIN already stored
    const savedPin = sessionStorage.getItem('graviton_admin_pin');
    if (savedPin) {
        currentAdminPin = savedPin;
        authenticate(savedPin, false);
    }

    // Event Filter Dropdown
    if (eventFilterSelect) {
        eventFilterSelect.addEventListener('change', () => {
            currentEventFilter = eventFilterSelect.value;
            if (currentAdminPin) {
                fetchRegistrations(currentAdminPin);
            }
        });
    }

    // Login Form
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const pin = pinInput.value.trim();
            if (pin) {
                authenticate(pin, true);
            }
        });
    }

    // Logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            sessionStorage.removeItem('graviton_admin_pin');
            currentAdminPin = '';
            allRegistrations = [];
            dashboardContainer.style.display = 'none';
            logoutBtn.style.display = 'none';
            loginContainer.style.display = 'block';
            if (pinInput) pinInput.value = '';
        });
    }

    // Search
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentSearch = e.target.value.trim().toLowerCase();
            renderTable();
        });
    }

    // Refresh
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            if (currentAdminPin) {
                fetchRegistrations(currentAdminPin);
            }
        });
    }

    // Filter Tabs
    filterTabs.forEach(btn => {
        btn.addEventListener('click', () => {
            filterTabs.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.getAttribute('data-status');
            renderTable();
        });
    });

    // Export Excel
    if (exportBtn) {
        exportBtn.addEventListener('click', exportToCSV);
    }

    async function authenticate(pin, isUserAction) {
        if (loginBtn) {
            loginBtn.disabled = true;
            loginBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Verifying PIN...';
        }
        if (loginError) loginError.style.display = 'none';

        const hasAPI = Boolean(typeof CONFIG !== 'undefined' && CONFIG.API_URL && CONFIG.API_URL.trim().length > 10);

        try {
            if (hasAPI) {
                const res = await fetch(CONFIG.API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                    body: JSON.stringify({ action: 'getRegistrations', adminPin: pin, eventFilter: currentEventFilter })
                });
                const data = await res.json();

                if (data && data.success) {
                    currentAdminPin = pin;
                    sessionStorage.setItem('graviton_admin_pin', pin);
                    allRegistrations = data.records || [];
                    showDashboard();
                } else {
                    handleAuthFail(isUserAction);
                }
            } else {
                // Local Demo / Offline Fallback Mode
                const validPins = ['2026', '9003252177', '9043639975'];
                if (validPins.includes(pin)) {
                    currentAdminPin = pin;
                    sessionStorage.setItem('graviton_admin_pin', pin);
                    loadLocalRegistrations();
                    showDashboard();
                } else {
                    handleAuthFail(isUserAction);
                }
            }
        } catch (err) {
            console.error('Admin Auth Error:', err);
            // Fallback for offline testing
            if (pin === '2026' || pin === '9003252177' || pin === '9043639975') {
                currentAdminPin = pin;
                sessionStorage.setItem('graviton_admin_pin', pin);
                loadLocalRegistrations();
                showDashboard();
            } else {
                handleAuthFail(isUserAction);
            }
        } finally {
            if (loginBtn) {
                loginBtn.disabled = false;
                loginBtn.innerHTML = '<i class="fa-solid fa-unlock"></i> Unlock Dashboard';
            }
        }
    }

    function handleAuthFail(isUserAction) {
        if (isUserAction && loginError) {
            loginError.style.display = 'block';
            if (pinInput) {
                pinInput.value = '';
                pinInput.focus();
            }
        }
    }

    function showDashboard() {
        if (loginContainer) loginContainer.style.display = 'none';
        if (dashboardContainer) dashboardContainer.style.display = 'block';
        if (logoutBtn) logoutBtn.style.display = 'inline-flex';
        updateStats();
        renderTable();
    }

    function loadLocalRegistrations() {
        const allLocal = JSON.parse(localStorage.getItem('graviton_registrations') || '[]');
        if (currentEventFilter === 'ALL') {
            allRegistrations = allLocal;
        } else {
            const eventRecords = [];
            allLocal.forEach(r => {
                const evRegs = Array.isArray(r.eventRegistrations) ? r.eventRegistrations : [];
                const match = evRegs.find(er => er.code === currentEventFilter || er.event === currentEventFilter);
                const eventsStr = Array.isArray(r.events) ? r.events.join(', ') : (r.events || '');

                if (match) {
                    eventRecords.push({
                        eventId: match.eventId,
                        masterRegId: r.masterRegistrationId || r.regId,
                        regId: match.eventId,
                        timestamp: r.timestamp,
                        fullname: r.fullname,
                        email: r.email,
                        phone: r.phone,
                        college: r.college,
                        dept: r.dept,
                        year: r.year,
                        teamSize: r.teamMembers ? (1 + r.teamMembers.length) : 1,
                        teamName: r.teamName || '',
                        teamMembers: r.teamMembers || '',
                        events: `${match.event || match.code} (${match.eventId})`,
                        amount: '—',
                        utr: r.utr || '',
                        paymentStatus: match.status || r.paymentStatus || 'PENDING',
                        registrationStatus: match.status || r.paymentStatus || 'PENDING',
                        screenshot: r.screenshot || ''
                    });
                } else if (eventsStr.toLowerCase().includes(currentEventFilter.toLowerCase())) {
                    eventRecords.push({
                        eventId: `${currentEventFilter}-001`,
                        masterRegId: r.masterRegistrationId || r.regId,
                        regId: `${currentEventFilter}-001`,
                        timestamp: r.timestamp,
                        fullname: r.fullname,
                        email: r.email,
                        phone: r.phone,
                        college: r.college,
                        dept: r.dept,
                        year: r.year,
                        teamSize: 1,
                        teamName: r.teamName || '',
                        teamMembers: r.teamMembers || '',
                        events: `${currentEventFilter}`,
                        amount: '—',
                        utr: r.utr || '',
                        paymentStatus: r.paymentStatus || 'PENDING',
                        registrationStatus: r.paymentStatus || 'PENDING',
                        screenshot: r.screenshot || ''
                    });
                }
            });
            allRegistrations = eventRecords;
        }
    }

    async function fetchRegistrations(pin) {
        const hasAPI = Boolean(typeof CONFIG !== 'undefined' && CONFIG.API_URL && CONFIG.API_URL.trim().length > 10);
        try {
            if (hasAPI) {
                const res = await fetch(CONFIG.API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                    body: JSON.stringify({ action: 'getRegistrations', adminPin: pin, eventFilter: currentEventFilter })
                });
                const data = await res.json();
                if (data && data.success) {
                    allRegistrations = data.records || [];
                }
            } else {
                loadLocalRegistrations();
            }
            updateStats();
            renderTable();
        } catch (e) {
            console.error('Fetch error:', e);
        }
    }

    function updateStats() {
        let total = allRegistrations.length;
        let pending = 0;
        let verified = 0;
        let rejected = 0;

        allRegistrations.forEach(r => {
            const st = (r.paymentStatus || r.registrationStatus || 'PENDING').toUpperCase();
            if (st === 'VERIFIED') verified++;
            else if (st === 'REJECTED') rejected++;
            else pending++; // PENDING + UNDER_VERIFICATION
        });

        document.getElementById('stat-total').textContent = total;
        document.getElementById('stat-pending').textContent = pending;
        document.getElementById('stat-verified').textContent = verified;
        document.getElementById('stat-rejected').textContent = rejected;

        document.getElementById('badge-all').textContent = total;
        document.getElementById('badge-pending').textContent = pending;
        document.getElementById('badge-verified').textContent = verified;
        document.getElementById('badge-rejected').textContent = rejected;
    }

    function renderTable() {
        const thead = document.getElementById('admin-thead');
        const tbody = document.getElementById('admin-tbody');
        if (!tbody) return;

        const isSpecificEvent = currentEventFilter !== 'ALL';

        if (thead) {
            if (isSpecificEvent) {
                thead.innerHTML = `
                    <tr>
                        <th>Event Reg ID</th>
                        <th>Master Reg ID</th>
                        <th>Participant / Team</th>
                        <th>Contact Details</th>
                        <th>College & Dept</th>
                        <th>Team Details</th>
                        <th>UTR / Reference</th>
                        <th>Screenshot Proof</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                `;
            } else {
                thead.innerHTML = `
                    <tr>
                        <th>Master Reg ID</th>
                        <th>Participant Name</th>
                        <th>Contact Details</th>
                        <th>College & Dept</th>
                        <th>Selected Events</th>
                        <th>Amount</th>
                        <th>UTR / Reference</th>
                        <th>Screenshot Proof</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                `;
            }
        }

        // Apply Status Filter
        let filtered = allRegistrations.filter(r => {
            const st = (r.paymentStatus || r.registrationStatus || 'PENDING').toUpperCase();
            if (currentFilter === 'ALL') return true;
            if (currentFilter === 'UNDER_VERIFICATION') return (st === 'UNDER_VERIFICATION' || st === 'PENDING');
            return st === currentFilter;
        });

        // Apply Search
        if (currentSearch) {
            filtered = filtered.filter(r => {
                const text = `${r.regId || ''} ${r.eventId || ''} ${r.masterRegId || ''} ${r.fullname || ''} ${r.email || ''} ${r.phone || ''} ${r.college || ''} ${r.dept || ''} ${r.utr || ''} ${r.events || ''}`.toLowerCase();
                return text.includes(currentSearch);
            });
        }

        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="10" style="text-align:center; padding:32px; color:var(--text-muted);">No delegate registration records found for this filter.</td></tr>`;
            return;
        }

        tbody.innerHTML = filtered.map((r, index) => {
            const st = (r.paymentStatus || r.registrationStatus || 'PENDING').toUpperCase();
            let statusPillClass = 'pending';
            let statusLabel = 'Pending Payment';

            if (st === 'VERIFIED') {
                statusPillClass = 'verified';
                statusLabel = 'VERIFIED';
            } else if (st === 'UNDER_VERIFICATION') {
                statusPillClass = 'under_verification';
                statusLabel = 'Under Review';
            } else if (st === 'REJECTED') {
                statusPillClass = 'rejected';
                statusLabel = 'REJECTED';
            }

            const events = Array.isArray(r.events) ? r.events.join(', ') : (r.events || '');
            const amount = r.amount || 100;
            const utr = r.utr || '—';
            const targetId = r.eventId || r.regId;
            const masterId = r.masterRegId || r.regId;
            const screenshotBtn = (r.screenshot || r.paymentScreenshot) ? `
                <button class="table-screenshot-btn" onclick="viewParticipant('${escapeHTML(targetId)}')" title="View Payment Screenshot">
                    <i class="fa-solid fa-image"></i> View Proof
                </button>
            ` : `<span style="color:var(--text-muted); font-size:0.75rem;">None</span>`;

            if (isSpecificEvent) {
                const teamInfo = r.teamName 
                    ? `<strong>${escapeHTML(r.teamName)}</strong>` + (r.teamMembers ? `<br><small style="color:var(--text-muted); font-size:0.75rem;">${escapeHTML(Array.isArray(r.teamMembers) ? r.teamMembers.join(', ') : r.teamMembers)}</small>` : '')
                    : '—';

                return `
                    <tr>
                        <td><strong style="color:var(--tech-cyan); font-size:0.95rem;">${escapeHTML(targetId)}</strong></td>
                        <td><strong class="text-crimson">${escapeHTML(masterId)}</strong></td>
                        <td>
                            <strong>${escapeHTML(r.fullname)}</strong>
                            ${r.teamName ? `<br><span class="badge" style="background:rgba(255, 30, 66, 0.14); color:var(--tech-cyan); border:1px solid rgba(255, 30, 66, 0.4); font-size:0.72rem; padding:2px 6px; border-radius:6px; display:inline-block; margin-top:3px;"><i class="fa-solid fa-users"></i> ${escapeHTML(r.teamName)}</span>` : ''}
                        </td>
                        <td>
                            <a href="mailto:${escapeHTML(r.email)}" style="color:var(--text-secondary); text-decoration:none;">${escapeHTML(r.email)}</a><br>
                            <a href="tel:${escapeHTML(r.phone)}" style="color:var(--text-muted); text-decoration:none; font-size:0.8rem;"><i class="fa-solid fa-phone"></i> ${escapeHTML(r.phone)}</a>
                        </td>
                        <td>
                            <span style="font-size:0.88rem;">${escapeHTML(r.college)}</span><br>
                            <small style="color:var(--text-muted);">${escapeHTML(r.dept)} (${escapeHTML(r.year)})</small>
                        </td>
                        <td><span style="font-size:0.82rem;">${teamInfo}</span></td>
                        <td><code style="color:var(--tech-cyan); font-size:0.82rem;">${escapeHTML(utr)}</code></td>
                        <td>${screenshotBtn}</td>
                        <td><span class="status-pill ${statusPillClass}">${statusLabel}</span></td>
                        <td>
                            <div class="action-buttons">
                                <button class="btn btn-outline-glow btn-sm" onclick="viewParticipant('${escapeHTML(targetId)}')" title="View Full Details">
                                    <i class="fa-solid fa-eye"></i>
                                </button>
                                ${st !== 'VERIFIED' ? `
                                    <button class="btn btn-sm" style="background:#00e676; color:#000;" onclick="verifyParticipant('${escapeHTML(targetId)}')" title="Verify Registration & Send Confirmation Email">
                                        <i class="fa-solid fa-check"></i>
                                    </button>
                                ` : `
                                    <button class="btn btn-outline-glow btn-sm" style="border-color:#00e676; color:#00e676;" onclick="resendConfirmationEmail('${escapeHTML(targetId)}')" title="Resend Confirmation Email">
                                        <i class="fa-solid fa-paper-plane"></i>
                                    </button>
                                `}
                                ${st !== 'REJECTED' ? `
                                    <button class="btn btn-sm" style="background:#ff334b; color:#fff;" onclick="rejectParticipant('${escapeHTML(targetId)}')" title="Reject Registration">
                                        <i class="fa-solid fa-xmark"></i>
                                    </button>
                                ` : ''}
                            </div>
                        </td>
                    </tr>
                `;
            } else {
                return `
                    <tr>
                        <td><strong class="text-crimson">${escapeHTML(masterId)}</strong></td>
                        <td>
                            <strong>${escapeHTML(r.fullname)}</strong>
                            ${r.teamName ? `<br><span class="badge" style="background:rgba(255, 30, 66, 0.14); color:var(--tech-cyan); border:1px solid rgba(255, 30, 66, 0.4); font-size:0.72rem; padding:2px 6px; border-radius:6px; display:inline-block; margin-top:3px;"><i class="fa-solid fa-users"></i> Team: ${escapeHTML(r.teamName)}</span>` : ''}
                        </td>
                        <td>
                            <a href="mailto:${escapeHTML(r.email)}" style="color:var(--text-secondary); text-decoration:none;">${escapeHTML(r.email)}</a><br>
                            <a href="tel:${escapeHTML(r.phone)}" style="color:var(--text-muted); text-decoration:none; font-size:0.8rem;"><i class="fa-solid fa-phone"></i> ${escapeHTML(r.phone)}</a>
                        </td>
                        <td>
                            <span style="font-size:0.88rem;">${escapeHTML(r.college)}</span><br>
                            <small style="color:var(--text-muted);">${escapeHTML(r.dept)} (${escapeHTML(r.year)})</small>
                        </td>
                        <td>
                            <span style="font-size:0.82rem; color:var(--text-secondary); max-width:200px; display:inline-block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${escapeHTML(events)}">
                                ${escapeHTML(events)}
                            </span>
                        </td>
                        <td><strong>₹${amount}</strong></td>
                        <td><code style="color:var(--tech-cyan); font-size:0.82rem;">${escapeHTML(utr)}</code></td>
                        <td>${screenshotBtn}</td>
                        <td><span class="status-pill ${statusPillClass}">${statusLabel}</span></td>
                        <td>
                            <div class="action-buttons">
                                <button class="btn btn-outline-glow btn-sm" onclick="viewParticipant('${escapeHTML(masterId)}')" title="View Full Details">
                                    <i class="fa-solid fa-eye"></i>
                                </button>
                                ${st !== 'VERIFIED' ? `
                                    <button class="btn btn-sm" style="background:#00e676; color:#000;" onclick="verifyParticipant('${escapeHTML(masterId)}')" title="Verify Payment & Send Confirmation Email">
                                        <i class="fa-solid fa-check"></i>
                                    </button>
                                ` : `
                                    <button class="btn btn-outline-glow btn-sm" style="border-color:#00e676; color:#00e676;" onclick="resendConfirmationEmail('${escapeHTML(masterId)}')" title="Resend Confirmation Email">
                                        <i class="fa-solid fa-paper-plane"></i>
                                    </button>
                                `}
                                ${st !== 'REJECTED' ? `
                                    <button class="btn btn-sm" style="background:#ff334b; color:#fff;" onclick="rejectParticipant('${escapeHTML(masterId)}')" title="Reject Payment">
                                        <i class="fa-solid fa-xmark"></i>
                                    </button>
                                ` : ''}
                            </div>
                        </td>
                    </tr>
                `;
            }
        }).join('');
    }

    // View Modal
    window.viewParticipant = function(regId) {
        const record = allRegistrations.find(r => r.regId === regId || r.eventId === regId || r.masterRegId === regId);
        if (!record) return;

        const modal = document.getElementById('participant-modal');
        const pRegId = document.getElementById('p-regid');
        const pName = document.getElementById('p-name');
        const pBody = document.getElementById('p-body-content');
        const pFooter = document.getElementById('p-modal-footer');

        const displayId = record.eventId 
            ? `${record.eventId} (Master: ${record.masterRegId || record.regId})` 
            : (record.masterRegId || record.regId);

        pRegId.textContent = displayId;
        pName.textContent = record.fullname;

        const st = (record.paymentStatus || record.registrationStatus || 'PENDING').toUpperCase();
        const proofImg = record.screenshot || record.paymentScreenshot;
        let screenshotHtml = '';
        if (proofImg) {
            screenshotHtml = `
                <div style="margin-top:18px; background:rgba(255, 30, 66, 0.08); border:1px solid rgba(255, 30, 66, 0.35); border-radius:8px; padding:14px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; flex-wrap:wrap; gap:8px;">
                        <strong style="color:var(--tech-cyan); font-size:0.85rem;"><i class="fa-solid fa-receipt"></i> Payment Proof / Screenshot:</strong>
                        <a href="${escapeHTML(proofImg)}" target="_blank" rel="noopener noreferrer" class="btn btn-outline-glow btn-sm" style="font-size:0.75rem; padding:4px 10px; text-decoration:none;">
                            <i class="fa-solid fa-up-right-from-square"></i> Open Full Image
                        </a>
                    </div>
                    <div style="text-align:center; background:#000; border-radius:6px; overflow:hidden; padding:8px;">
                        <a href="${escapeHTML(proofImg)}" target="_blank" rel="noopener noreferrer">
                            <img src="${escapeHTML(proofImg)}" alt="Payment Screenshot" style="max-width:100%; max-height:360px; object-fit:contain; border-radius:4px; display:inline-block; cursor:pointer;" title="Click to open full image">
                        </a>
                    </div>
                </div>
            `;
        } else {
            screenshotHtml = `
                <div style="margin-top:16px; background:rgba(255,255,255,0.03); border:1px dashed var(--border-glass); border-radius:8px; padding:12px; text-align:center; color:var(--text-muted); font-size:0.82rem;">
                    <i class="fa-solid fa-image-slash"></i> No payment screenshot uploaded yet.
                </div>
            `;
        }

        pBody.innerHTML = `
            <div class="modal-info-grid">
                <div class="info-item">
                    <i class="fa-solid fa-envelope"></i>
                    <div>
                        <strong>Email</strong>
                        <span>${escapeHTML(record.email)}</span>
                    </div>
                </div>
                <div class="info-item">
                    <i class="fa-solid fa-phone"></i>
                    <div>
                        <strong>Mobile</strong>
                        <span>${escapeHTML(record.phone)}</span>
                    </div>
                </div>
                <div class="info-item">
                    <i class="fa-solid fa-building-columns"></i>
                    <div>
                        <strong>College</strong>
                        <span>${escapeHTML(record.college)}</span>
                    </div>
                </div>
                <div class="info-item">
                    <i class="fa-solid fa-graduation-cap"></i>
                    <div>
                        <strong>Department / Year</strong>
                        <span>${escapeHTML(record.dept)} - ${escapeHTML(record.year)}</span>
                    </div>
                </div>
            </div>

            ${record.teamName ? `
            <div style="margin:16px 0; background:rgba(255, 30, 66, 0.08); border:1px solid rgba(255, 30, 66, 0.35); padding:14px; border-radius:8px;">
                <strong style="font-family:var(--font-heading); font-size:0.75rem; color:var(--tech-cyan); display:block; text-transform:uppercase;">
                    <i class="fa-solid fa-users"></i> TEAM PARTICIPATION (${escapeHTML(record.teamName)})
                </strong>
                <p style="color:#fff; font-size:0.88rem; margin-top:4px;"><strong>Team Leader:</strong> ${escapeHTML(record.fullname)}</p>
                ${record.teamMembers ? `<p style="color:var(--text-secondary); font-size:0.84rem; margin-top:2px;"><strong>Teammates:</strong> ${escapeHTML(Array.isArray(record.teamMembers) ? record.teamMembers.join(', ') : record.teamMembers)}</p>` : ''}
            </div>` : ''}

            <div style="margin:16px 0; background:rgba(255,255,255,0.03); padding:14px; border-radius:8px;">
                <strong style="font-family:var(--font-heading); font-size:0.75rem; color:var(--text-muted); display:block; text-transform:uppercase;">REGISTERED EVENTS</strong>
                <p style="color:#fff; font-size:0.9rem; margin-top:4px;">${escapeHTML(record.events)}</p>
            </div>

            <div style="margin:16px 0; background:rgba(255,255,255,0.03); padding:14px; border-radius:8px; display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <strong style="font-family:var(--font-heading); font-size:0.75rem; color:var(--text-muted); display:block; text-transform:uppercase;">UTR / TRANSACTION ID</strong>
                    <code style="color:var(--tech-cyan); font-size:1rem; font-weight:700;">${escapeHTML(record.utr || 'None')}</code>
                </div>
                <div>
                    <span class="status-pill ${st === 'VERIFIED' ? 'verified' : (st === 'REJECTED' ? 'rejected' : 'pending')}">${st}</span>
                </div>
            </div>

            <div style="display:flex; gap:10px; margin-top:14px;">
                <a href="https://wa.me/${encodeURIComponent(String(record.phone).replace(/\D/g, ''))}?text=Hi%20${encodeURIComponent(record.fullname)},%20regarding%20your%20GRAVITON%202026%20registration%20(${encodeURIComponent(displayId)})" target="_blank" class="btn btn-whatsapp btn-sm btn-block">
                    <i class="fa-brands fa-whatsapp"></i> Chat with Delegate on WhatsApp
                </a>
            </div>

            ${screenshotHtml}
        `;

        const actionTargetId = record.eventId || record.masterRegId || record.regId;
        pFooter.innerHTML = `
            <button class="btn btn-outline-glow btn-sm" onclick="closeParticipantModal()">Close</button>
            <button class="btn btn-outline-glow btn-sm" onclick="resendConfirmationEmail('${escapeHTML(actionTargetId)}')">
                <i class="fa-solid fa-paper-plane"></i> Send / Resend Email
            </button>
            ${st !== 'VERIFIED' ? `
                <button class="btn btn-sm" style="background:#00e676; color:#000;" onclick="verifyParticipant('${escapeHTML(actionTargetId)}'); closeParticipantModal();">
                    <i class="fa-solid fa-check"></i> Mark Verified
                </button>
            ` : ''}
            ${st !== 'REJECTED' ? `
                <button class="btn btn-sm" style="background:#ff334b; color:#fff;" onclick="rejectParticipant('${escapeHTML(actionTargetId)}'); closeParticipantModal();">
                    <i class="fa-solid fa-xmark"></i> Mark Rejected
                </button>
            ` : ''}
        `;

        modal.classList.add('active');
    };

    window.closeParticipantModal = function() {
        const modal = document.getElementById('participant-modal');
        if (modal) modal.classList.remove('active');
    };

    const modalCloseBtn = document.getElementById('p-modal-close');
    if (modalCloseBtn) modalCloseBtn.addEventListener('click', window.closeParticipantModal);

    // Helper to send email via SMTP endpoint (gravtion2026@gmail.com)
    async function sendSmtpEmail(record) {
        if (!record || !record.email) return { success: false, error: 'No email found' };
        try {
            const res = await fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ participant: record })
            });
            return await res.json();
        } catch (e) {
            console.warn('Local SMTP endpoint call failed:', e);
            return { success: false, error: e.message };
        }
    }

    // Verify Action with Automated Confirmation Email
    window.verifyParticipant = async function(regId) {
        if (!confirm(`Are you sure you want to mark registration ${regId} as VERIFIED?\n\nThis will update all event sheets and automatically dispatch the official event confirmation email to the participant.`)) return;

        const hasAPI = Boolean(typeof CONFIG !== 'undefined' && CONFIG.API_URL && CONFIG.API_URL.trim().length > 10);

        try {
            if (hasAPI) {
                const res = await fetch(CONFIG.API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                    body: JSON.stringify({
                        action: 'verifyPayment',
                        adminPin: currentAdminPin,
                        regId: regId,
                        verifiedBy: 'Organizer'
                    })
                });
                const data = await res.json();
                if (data && data.success) {
                    const item = allRegistrations.find(r => r.regId === regId || r.eventId === regId || r.masterRegId === regId);
                    if (item) item.paymentStatus = 'VERIFIED';
                    updateStats();
                    renderTable();

                    // Automatically send email via SMTP if Apps Script did not send it
                    let smtpResult = null;
                    if (!data.emailSent && item && item.email) {
                        smtpResult = await sendSmtpEmail(item);
                    }

                    if (data.emailSent) {
                        alert(`✅ Registration verified successfully!\n\n📧 Official confirmation email sent to:\n${data.recipientEmail}`);
                    } else if (smtpResult && smtpResult.success) {
                        alert(`✅ Registration marked as VERIFIED!\n\n📧 Official confirmation email automatically sent via SMTP (gravtion2026@gmail.com) to:\n${smtpResult.recipientEmail}`);
                    } else if (data.recipientEmail) {
                        alert(`✅ Registration marked as VERIFIED.\n\n⚠️ Note on email delivery: ${data.emailError || 'Email could not be dispatched.'}`);
                    } else {
                        alert(`✅ Registration successfully marked as VERIFIED.`);
                    }
                } else {
                    alert(data.error || 'Verification failed on server.');
                }
            } else {
                // Local Demo
                const existing = JSON.parse(localStorage.getItem('graviton_registrations') || '[]');
                existing.forEach(r => {
                    if (r.regId === regId || r.masterRegistrationId === regId) {
                        r.paymentStatus = 'VERIFIED';
                    }
                    if (Array.isArray(r.eventRegistrations)) {
                        r.eventRegistrations.forEach(er => {
                            if (er.eventId === regId || r.regId === regId || r.masterRegistrationId === regId) {
                                er.status = 'VERIFIED';
                            }
                        });
                    }
                });
                localStorage.setItem('graviton_registrations', JSON.stringify(existing));

                const memoryItem = allRegistrations.find(r => r.regId === regId || r.eventId === regId || r.masterRegId === regId);
                if (memoryItem) memoryItem.paymentStatus = 'VERIFIED';

                updateStats();
                renderTable();

                if (memoryItem && memoryItem.email) {
                    const smtpRes = await sendSmtpEmail(memoryItem);
                    if (smtpRes && smtpRes.success) {
                        alert(`✅ Registration ${regId} marked as VERIFIED.\n\n📧 Confirmation email sent via SMTP to:\n${smtpRes.recipientEmail}`);
                        return;
                    }
                }
                alert(`✅ Registration ${regId} marked as VERIFIED (Local Mode).`);
            }
        } catch (err) {
            console.error('Verify error:', err);
            alert('Verification request failed. Check network or server configuration.');
        }
    };

    // Resend Confirmation Email Action
    window.resendConfirmationEmail = async function(regId) {
        if (!confirm(`Dispatch/resend official event confirmation email for registration ${regId}?`)) return;

        const item = allRegistrations.find(r => r.regId === regId || r.eventId === regId || r.masterRegId === regId);

        // 1. Try dedicated SMTP endpoint first (gravtion2026@gmail.com)
        if (item && item.email) {
            const smtpRes = await sendSmtpEmail(item);
            if (smtpRes && smtpRes.success) {
                alert(`📧 Confirmation email successfully sent via SMTP to:\n${smtpRes.recipientEmail}`);
                return;
            }
        }

        // 2. Fallback to Google Apps Script if available
        const hasAPI = Boolean(typeof CONFIG !== 'undefined' && CONFIG.API_URL && CONFIG.API_URL.trim().length > 10);
        if (hasAPI) {
            try {
                const res = await fetch(CONFIG.API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                    body: JSON.stringify({
                        action: 'sendConfirmationEmail',
                        adminPin: currentAdminPin,
                        regId: regId
                    })
                });
                const data = await res.json();
                if (data && data.success) {
                    alert(`📧 Confirmation email successfully sent to:\n${data.recipientEmail}`);
                } else {
                    alert(`❌ Email dispatch failed:\n${data.error || 'Unknown error'}`);
                }
            } catch (err) {
                console.error('Resend email error:', err);
                alert('Request failed. Check network or server connection.');
            }
        } else {
            alert('⚠️ No active email connection available.');
        }
    };

    // Reject Action
    window.rejectParticipant = async function(regId) {
        const reason = prompt(`Enter rejection reason for registration ${regId}:`, "Invalid / unverified UTR transaction");
        if (reason === null) return;

        const hasAPI = Boolean(typeof CONFIG !== 'undefined' && CONFIG.API_URL && CONFIG.API_URL.trim().length > 10);

        try {
            if (hasAPI) {
                const res = await fetch(CONFIG.API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                    body: JSON.stringify({
                        action: 'rejectPayment',
                        adminPin: currentAdminPin,
                        regId: regId,
                        reason: reason
                    })
                });
                const data = await res.json();
                if (data && data.success) {
                    const item = allRegistrations.find(r => r.regId === regId || r.eventId === regId || r.masterRegId === regId);
                    if (item) item.paymentStatus = 'REJECTED';
                    updateStats();
                    renderTable();
                } else {
                    alert(data.error || 'Rejection failed on server.');
                }
            } else {
                // Local Demo
                const existing = JSON.parse(localStorage.getItem('graviton_registrations') || '[]');
                existing.forEach(r => {
                    if (r.regId === regId || r.masterRegistrationId === regId) {
                        r.paymentStatus = 'REJECTED';
                    }
                    if (Array.isArray(r.eventRegistrations)) {
                        r.eventRegistrations.forEach(er => {
                            if (er.eventId === regId || r.regId === regId || r.masterRegistrationId === regId) {
                                er.status = 'REJECTED';
                            }
                        });
                    }
                });
                localStorage.setItem('graviton_registrations', JSON.stringify(existing));

                const memoryItem = allRegistrations.find(r => r.regId === regId || r.eventId === regId || r.masterRegId === regId);
                if (memoryItem) memoryItem.paymentStatus = 'REJECTED';

                updateStats();
                renderTable();
            }
        } catch (err) {
            console.error('Reject error:', err);
            alert('Rejection request failed.');
        }
    };

    // Export Excel CSV
    function exportToCSV() {
        if (!allRegistrations.length) {
            alert('No registrations available to export.');
            return;
        }

        const isSpecificEvent = currentEventFilter !== 'ALL';
        let csv = '\uFEFF'; // UTF-8 BOM

        if (isSpecificEvent) {
            csv += 'Event Registration ID,Master Registration ID,Timestamp,Participant / Team Name,Email,Phone,College,Department,Year,Team Size,Team Members,UTR Number,Payment Status,Registration Status,Verified By,Verification Date\n';

            allRegistrations.forEach(r => {
                const teamMembersStr = Array.isArray(r.teamMembers) ? r.teamMembers.join('; ') : (r.teamMembers || '');
                const row = [
                    r.eventId || r.regId,
                    r.masterRegId || r.regId,
                    r.timestamp || '',
                    escapeCSV(r.fullname),
                    escapeCSV(r.email),
                    escapeCSV(r.phone),
                    escapeCSV(r.college),
                    escapeCSV(r.dept),
                    escapeCSV(r.year),
                    r.teamSize || 1,
                    escapeCSV(teamMembersStr),
                    escapeCSV(r.utr),
                    r.paymentStatus || 'PENDING',
                    r.registrationStatus || 'PENDING',
                    r.verifiedBy || '',
                    r.verificationTime || ''
                ];
                csv += row.map(val => `"${val}"`).join(',') + '\n';
            });
        } else {
            csv += 'Master Registration ID,Timestamp,Full Name,Email,Phone,College,Department,Year,Selected Events,Participation Type,Team Name,Team Members,Amount,Payment Status,UTR,Verification Time,Verified By\n';

            allRegistrations.forEach(r => {
                const events = Array.isArray(r.events) ? r.events.join('; ') : (r.events || '');
                const teamMembersStr = Array.isArray(r.teamMembers) ? r.teamMembers.join('; ') : (r.teamMembers || '');
                const row = [
                    r.masterRegId || r.regId,
                    r.timestamp || '',
                    escapeCSV(r.fullname),
                    escapeCSV(r.email),
                    escapeCSV(r.phone),
                    escapeCSV(r.college),
                    escapeCSV(r.dept),
                    escapeCSV(r.year),
                    escapeCSV(events),
                    escapeCSV(r.participationType || (r.teamName ? 'Team' : 'Solo')),
                    escapeCSV(r.teamName || ''),
                    escapeCSV(teamMembersStr),
                    r.amount || 100,
                    r.paymentStatus || 'PENDING',
                    escapeCSV(r.utr),
                    r.verificationTime || '',
                    r.verifiedBy || ''
                ];
                csv += row.map(val => `"${val}"`).join(',') + '\n';
            });
        }

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const tag = isSpecificEvent ? currentEventFilter : 'MASTER';
        link.download = `GRAVITON_2026_${tag}_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
}

function escapeCSV(str) {
    return String(str || '').replace(/"/g, '""');
}

function escapeHTML(str) {
    return String(str || '').replace(/[&<>"']/g, match => {
        const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
        return map[match];
    });
}
