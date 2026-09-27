/**
 * GRAVITON 2026 - Organizer Admin Dashboard Logic
 * Jaya Sakthi Engineering College (CSE & Cyber Security Dept.)
 */

let currentAdminPin = '';
let allRegistrations = [];
let currentFilter = 'ALL';
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
                    body: JSON.stringify({ action: 'getRegistrations', adminPin: pin })
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
                    allRegistrations = JSON.parse(localStorage.getItem('graviton_registrations') || '[]');
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
                allRegistrations = JSON.parse(localStorage.getItem('graviton_registrations') || '[]');
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

    async function fetchRegistrations(pin) {
        const hasAPI = Boolean(typeof CONFIG !== 'undefined' && CONFIG.API_URL && CONFIG.API_URL.trim().length > 10);
        try {
            if (hasAPI) {
                const res = await fetch(CONFIG.API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                    body: JSON.stringify({ action: 'getRegistrations', adminPin: pin })
                });
                const data = await res.json();
                if (data && data.success) {
                    allRegistrations = data.records || [];
                }
            } else {
                allRegistrations = JSON.parse(localStorage.getItem('graviton_registrations') || '[]');
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
            const st = (r.paymentStatus || 'PENDING').toUpperCase();
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
        const tbody = document.getElementById('admin-tbody');
        if (!tbody) return;

        // Apply Status Filter
        let filtered = allRegistrations.filter(r => {
            const st = (r.paymentStatus || 'PENDING').toUpperCase();
            if (currentFilter === 'ALL') return true;
            if (currentFilter === 'UNDER_VERIFICATION') return (st === 'UNDER_VERIFICATION' || st === 'PENDING');
            return st === currentFilter;
        });

        // Apply Search
        if (currentSearch) {
            filtered = filtered.filter(r => {
                const text = `${r.regId} ${r.fullname} ${r.email} ${r.phone} ${r.college} ${r.dept} ${r.utr} ${r.events}`.toLowerCase();
                return text.includes(currentSearch);
            });
        }

        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:32px; color:var(--text-muted);">No delegate registration records found.</td></tr>`;
            return;
        }

        tbody.innerHTML = filtered.map((r, index) => {
            const st = (r.paymentStatus || 'PENDING').toUpperCase();
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

            return `
                <tr>
                    <td><strong class="text-crimson">${escapeHTML(r.regId)}</strong></td>
                    <td>
                        <strong>${escapeHTML(r.fullname)}</strong>
                        ${r.teamName ? `<br><span class="badge" style="background:rgba(0, 240, 255, 0.12); color:var(--tech-cyan); border:1px solid rgba(0, 240, 255, 0.3); font-size:0.72rem; padding:2px 6px; border-radius:6px; display:inline-block; margin-top:3px;"><i class="fa-solid fa-users"></i> Team: ${escapeHTML(r.teamName)}</span>` : ''}
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
                    <td><span class="status-pill ${statusPillClass}">${statusLabel}</span></td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn-outline-glow btn-sm" onclick="viewParticipant('${escapeHTML(r.regId)}')" title="View Full Details">
                                <i class="fa-solid fa-eye"></i>
                            </button>
                            ${st !== 'VERIFIED' ? `
                                <button class="btn btn-sm" style="background:#00e676; color:#000;" onclick="verifyParticipant('${escapeHTML(r.regId)}')" title="Verify Payment">
                                    <i class="fa-solid fa-check"></i>
                                </button>
                            ` : ''}
                            ${st !== 'REJECTED' ? `
                                <button class="btn btn-sm" style="background:#ff334b; color:#fff;" onclick="rejectParticipant('${escapeHTML(r.regId)}')" title="Reject Payment">
                                    <i class="fa-solid fa-xmark"></i>
                                </button>
                            ` : ''}
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // View Modal
    window.viewParticipant = function(regId) {
        const record = allRegistrations.find(r => r.regId === regId);
        if (!record) return;

        const modal = document.getElementById('participant-modal');
        const pRegId = document.getElementById('p-regid');
        const pName = document.getElementById('p-name');
        const pBody = document.getElementById('p-body-content');
        const pFooter = document.getElementById('p-modal-footer');

        pRegId.textContent = record.regId;
        pName.textContent = record.fullname;

        const st = (record.paymentStatus || 'PENDING').toUpperCase();
        let screenshotHtml = '';
        if (record.screenshot) {
            screenshotHtml = `
                <div style="margin-top:16px;">
                    <strong style="display:block; color:#fff; font-size:0.85rem; margin-bottom:8px;">Payment Screenshot:</strong>
                    <img src="${record.screenshot}" alt="Payment Screenshot" style="max-width:100%; border-radius:8px; border:1px solid var(--border-glass);">
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
            <div style="margin:16px 0; background:rgba(0, 240, 255, 0.06); border:1px solid rgba(0, 240, 255, 0.25); padding:14px; border-radius:8px;">
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
                <a href="https://wa.me/${encodeURIComponent(String(record.phone).replace(/\D/g, ''))}?text=Hi%20${encodeURIComponent(record.fullname)},%20regarding%20your%20GRAVITON%202026%20registration%20(${encodeURIComponent(record.regId)})" target="_blank" class="btn btn-whatsapp btn-sm btn-block">
                    <i class="fa-brands fa-whatsapp"></i> Chat with Delegate on WhatsApp
                </a>
            </div>

            ${screenshotHtml}
        `;

        pFooter.innerHTML = `
            <button class="btn btn-outline-glow btn-sm" onclick="closeParticipantModal()">Close</button>
            ${st !== 'VERIFIED' ? `
                <button class="btn btn-sm" style="background:#00e676; color:#000;" onclick="verifyParticipant('${escapeHTML(record.regId)}'); closeParticipantModal();">
                    <i class="fa-solid fa-check"></i> Mark Verified
                </button>
            ` : ''}
            ${st !== 'REJECTED' ? `
                <button class="btn btn-sm" style="background:#ff334b; color:#fff;" onclick="rejectParticipant('${escapeHTML(record.regId)}'); closeParticipantModal();">
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

    // Verify Action
    window.verifyParticipant = async function(regId) {
        if (!confirm(`Are you sure you want to mark registration ${regId} as VERIFIED?`)) return;

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
                    // Update in local memory
                    const item = allRegistrations.find(r => r.regId === regId);
                    if (item) item.paymentStatus = 'VERIFIED';
                    updateStats();
                    renderTable();
                } else {
                    alert(data.error || 'Verification failed on server.');
                }
            } else {
                // Local Demo
                const existing = JSON.parse(localStorage.getItem('graviton_registrations') || '[]');
                const item = existing.find(r => r.regId === regId);
                if (item) item.paymentStatus = 'VERIFIED';
                localStorage.setItem('graviton_registrations', JSON.stringify(existing));

                const memoryItem = allRegistrations.find(r => r.regId === regId);
                if (memoryItem) memoryItem.paymentStatus = 'VERIFIED';

                updateStats();
                renderTable();
            }
        } catch (err) {
            console.error('Verify error:', err);
            alert('Verification request failed. Check network or server configuration.');
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
                    const item = allRegistrations.find(r => r.regId === regId);
                    if (item) item.paymentStatus = 'REJECTED';
                    updateStats();
                    renderTable();
                } else {
                    alert(data.error || 'Rejection failed on server.');
                }
            } else {
                // Local Demo
                const existing = JSON.parse(localStorage.getItem('graviton_registrations') || '[]');
                const item = existing.find(r => r.regId === regId);
                if (item) item.paymentStatus = 'REJECTED';
                localStorage.setItem('graviton_registrations', JSON.stringify(existing));

                const memoryItem = allRegistrations.find(r => r.regId === regId);
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

        let csv = '\uFEFF'; // UTF-8 BOM
        csv += 'Registration ID,Timestamp,Full Name,Email,Phone,College,Department,Year,Selected Events,Participation Type,Team Name,Team Members,Amount,Payment Status,UTR,Verification Time,Verified By\n';

        allRegistrations.forEach(r => {
            const events = Array.isArray(r.events) ? r.events.join('; ') : (r.events || '');
            const teamMembersStr = Array.isArray(r.teamMembers) ? r.teamMembers.join('; ') : (r.teamMembers || '');
            const row = [
                r.regId,
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

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `GRAVITON_2026_Delegates_${new Date().toISOString().slice(0, 10)}.csv`;
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
