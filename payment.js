/**
 * GRAVITON 2026 - Payment Proof & Screenshot Verification Logic
 * Jaya Sakthi Engineering College (CSE & Cyber Security Dept.)
 */

document.addEventListener('DOMContentLoaded', () => {
    initPaymentPage();
});

function initPaymentPage() {
    // 1. Extract parameters from URL or sessionStorage
    const urlParams = new URLSearchParams(window.location.search);
    let regId = urlParams.get('regId') || '';
    let name = urlParams.get('name') || '';
    let amount = urlParams.get('amount') || '';
    let events = urlParams.get('events') || '';
    let team = urlParams.get('team') || '';
    let type = urlParams.get('type') || '';
    let members = urlParams.get('members') || '';

    let eventRegistrations = [];
    try {
        const saved = JSON.parse(sessionStorage.getItem('graviton_current_reg') || '{}');
        if (saved.eventRegistrations && Array.isArray(saved.eventRegistrations)) {
            eventRegistrations = saved.eventRegistrations;
        }
        if (!regId && (saved.masterRegistrationId || saved.regId)) {
            regId = saved.masterRegistrationId || saved.regId;
            name = name || saved.fullname || saved.name || '';
            amount = amount || saved.amount || '';
            events = events || (Array.isArray(saved.events) ? saved.events.join(', ') : saved.events) || '';
            team = team || saved.teamName || '';
            type = type || saved.participationType || '';
            members = members || (Array.isArray(saved.teamMembers) ? saved.teamMembers.join(', ') : (saved.teamMembers || '')) || '';
        }
    } catch (e) {}

    const finalAmount = amount || (typeof CONFIG !== 'undefined' && CONFIG.REGISTRATION_FEE ? CONFIG.REGISTRATION_FEE : 100);

    // Update DOM Display Elements
    const displayRegId = document.getElementById('display-regid');
    const displayName = document.getElementById('display-name');
    const displayAmount = document.getElementById('display-amount');
    const displayEvent = document.getElementById('display-event');
    const displayEventIds = document.getElementById('display-event-ids');
    const displayTeamBox = document.getElementById('display-team-box');
    const displayTeamName = document.getElementById('display-team-name');
    const displayTeamMembers = document.getElementById('display-team-members');
    const regIdInput = document.getElementById('regId');
    const form = document.getElementById('payment-form');
    const paymentError = document.getElementById('payment-error');
    const submitBtn = document.getElementById('submit-payment-btn');
    const mobileToggle = document.getElementById('mobile-toggle');
    const navLinks = document.getElementById('nav-links');

    if (mobileToggle && navLinks && !mobileToggle.dataset.navBound) {
        mobileToggle.dataset.navBound = 'true';
        mobileToggle.addEventListener('click', () => {
            navLinks.classList.toggle('mobile-active');
        });
    }

    if (displayRegId) displayRegId.textContent = regId || 'GRAV-0001';
    if (displayName) displayName.textContent = name ? `Delegate: ${name}` : 'Symposium Delegate';
    if (displayAmount) displayAmount.textContent = `₹${finalAmount}`;
    if (regIdInput && regId) regIdInput.value = regId;

    // Display Event-Specific IDs and Details
    if (displayEventIds) {
        if (eventRegistrations && eventRegistrations.length > 0) {
            displayEventIds.innerHTML = `
                <span style="font-size:0.75rem; color:var(--text-muted); display:block; font-weight:600; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:4px;">
                    <i class="fa-solid fa-tags text-crimson"></i> Registered Event IDs:
                </span>
                <div style="display:flex; flex-direction:column; gap:6px;">
                    ${eventRegistrations.map(er => `
                        <div style="display:flex; align-items:center; justify-content:space-between; background:rgba(255, 30, 66, 0.08); border:1px solid rgba(255, 30, 66, 0.25); border-radius:6px; padding:5px 10px; font-size:0.82rem;">
                            <code style="color:var(--tech-cyan); font-weight:700; font-size:0.88rem;">${escapeHTML(er.eventId)}</code>
                            <span style="color:#fff; font-weight:500;">${escapeHTML(er.event || er.eventName || er.code)}</span>
                        </div>
                    `).join('')}
                </div>
            `;
        } else if (events) {
            displayEventIds.innerHTML = `
                <div style="font-size:0.82rem; color:var(--text-secondary); margin-top:2px;">
                    <i class="fa-solid fa-trophy text-crimson"></i> Event(s): <strong>${escapeHTML(events)}</strong> ${type ? `(${escapeHTML(type)})` : ''}
                </div>
            `;
        }
    }

    if (displayEvent && events && (!eventRegistrations || eventRegistrations.length === 0)) {
        displayEvent.style.display = 'block';
        displayEvent.innerHTML = `<i class="fa-solid fa-trophy text-crimson"></i> Event: <strong>${escapeHTML(events)}</strong> ${type ? `(${escapeHTML(type)})` : ''}`;
    }
    if (team && displayTeamBox) {
        displayTeamBox.style.display = 'block';
        if (displayTeamName) displayTeamName.textContent = team;
        if (displayTeamMembers && members) {
            displayTeamMembers.textContent = `Members: ${name} (Leader), ${members}`;
        }
    }

    const displayRateNote = document.getElementById('display-rate-note');
    if (displayRateNote) {
        if (team || type === 'Team') {
            const memberCount = members ? (1 + members.split(',').filter(m => m.trim().length > 0).length) : Math.max(1, Math.round(Number(finalAmount) / 100));
            displayRateNote.textContent = `₹100/HEAD × ${memberCount} MEMBERS`;
        } else {
            displayRateNote.textContent = `₹100 / SOLO DELEGATE`;
        }
    }

    // Screenshot Handling with Live Preview & Canvas Compression
    const screenshotInput = document.getElementById('screenshot');
    const screenshotDropzone = document.getElementById('payment-screenshot-dropzone');
    const previewCard = document.getElementById('payment-preview-card');
    const previewImg = document.getElementById('payment-preview-img');
    const fileNameEl = document.getElementById('payment-file-name');
    const fileSizeEl = document.getElementById('payment-file-size');
    const removeBtn = document.getElementById('payment-remove-btn');
    let screenshotBase64 = '';
    let screenshotBlob = null;
    let selectedScreenshotFile = null;

    function handleScreenshotFile(file) {
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            showError('Please upload an image file (JPG, PNG, WebP).');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            showError('Screenshot image size should be less than 10MB.');
            return;
        }

        selectedScreenshotFile = file;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const maxDim = 1200;
                let w = img.width;
                let h = img.height;
                if (w > maxDim || h > maxDim) {
                    if (w > h) {
                        h = Math.round((h * maxDim) / w);
                        w = maxDim;
                    } else {
                        w = Math.round((w * maxDim) / h);
                        h = maxDim;
                    }
                }
                canvas.width = w;
                canvas.height = h;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, w, h);
                screenshotBase64 = canvas.toDataURL('image/jpeg', 0.85);

                canvas.toBlob((blob) => {
                    screenshotBlob = blob;
                }, 'image/jpeg', 0.85);

                if (previewImg) previewImg.src = screenshotBase64;
                if (fileNameEl) fileNameEl.textContent = file.name;
                if (fileSizeEl) fileSizeEl.textContent = `${Math.round(file.size / 1024)} KB`;
                if (previewCard) previewCard.style.display = 'flex';
                if (screenshotDropzone) screenshotDropzone.style.display = 'none';
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }

    if (screenshotInput) {
        screenshotInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                handleScreenshotFile(e.target.files[0]);
            }
        });
    }

    if (screenshotDropzone) {
        ['dragenter', 'dragover'].forEach(eventName => {
            screenshotDropzone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                screenshotDropzone.classList.add('dragover');
            });
        });

        ['dragleave', 'drop'].forEach(eventName => {
            screenshotDropzone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                screenshotDropzone.classList.remove('dragover');
            });
        });

        screenshotDropzone.addEventListener('drop', (e) => {
            if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleScreenshotFile(e.dataTransfer.files[0]);
            }
        });
    }

    if (removeBtn) {
        removeBtn.addEventListener('click', () => {
            screenshotBase64 = '';
            screenshotBlob = null;
            selectedScreenshotFile = null;
            if (screenshotInput) screenshotInput.value = '';
            if (previewCard) previewCard.style.display = 'none';
            if (screenshotDropzone) screenshotDropzone.style.display = 'block';
        });
    }

    // Handle Payment Proof Form Submission
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (paymentError) paymentError.style.display = 'none';

            const enteredRegId = (regIdInput ? regIdInput.value.trim() : regId).toUpperCase();
            const utr = document.getElementById('utr').value.trim();

            if (!enteredRegId) {
                showError('Please enter your Registration ID.');
                return;
            }

            if (!utr || utr.length < 4) {
                showError('Please enter a valid Transaction ID / UTR Number.');
                return;
            }

            if (!screenshotBase64) {
                showError('Please attach your payment screenshot/receipt.');
                return;
            }

            setLoading(true, 'Uploading payment proof to Vercel Blob CDN...');

            // Upload payment screenshot to Vercel Blob and retrieve permanent public CDN URL
            let finalScreenshotUrl = screenshotBase64;
            try {
                const cleanReg = enteredRegId.replace(/[^a-zA-Z0-9]/g, '_');
                const cleanName = `${cleanReg}_payment_${Date.now()}.jpg`;
                const uploadSource = screenshotBlob || selectedScreenshotFile || screenshotBase64;
                const blobUrl = await uploadToVercelBlob(uploadSource, cleanName);
                if (blobUrl) {
                    finalScreenshotUrl = blobUrl;
                }
            } catch (blobErr) {
                console.warn('Vercel Blob upload fallback to base64:', blobErr);
            }

            setLoading(true, 'Recording payment proof in symposium database...');

            const payload = {
                action: 'submitPayment',
                regId: enteredRegId,
                utr: utr,
                screenshot: finalScreenshotUrl
            };

            const hasAPI = Boolean(typeof CONFIG !== 'undefined' && CONFIG.API_URL && CONFIG.API_URL.trim().length > 10);

            try {
                if (hasAPI) {
                    const res = await fetch(CONFIG.API_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                        body: JSON.stringify(payload)
                    });
                    const data = await res.json();

                    if (data && data.success) {
                        window.location.href = `status.html?regId=${encodeURIComponent(enteredRegId)}&submitted=true`;
                    } else {
                        showError(data.error || 'Failed to submit payment details. Please check your Registration ID.');
                        setLoading(false);
                    }
                } else {
                    // Offline / Local Demo mode
                    const existing = JSON.parse(localStorage.getItem('graviton_registrations') || '[]');
                    let found = false;
                    for (let i = 0; i < existing.length; i++) {
                        if (existing[i].regId.toUpperCase() === enteredRegId || (existing[i].masterRegistrationId && existing[i].masterRegistrationId.toUpperCase() === enteredRegId)) {
                            existing[i].utr = utr;
                            existing[i].screenshot = finalScreenshotUrl;
                            existing[i].paymentStatus = 'UNDER_VERIFICATION';
                            found = true;
                            break;
                        }
                    }

                    if (!found) {
                        existing.push({
                            regId: enteredRegId,
                            masterRegistrationId: enteredRegId,
                            fullname: name || 'Participant',
                            email: '',
                            phone: '',
                            college: 'Jaya Sakthi Engineering College',
                            dept: 'CSE',
                            year: 'III Year',
                            events: events || 'Registered Events',
                            amount: finalAmount,
                            paymentStatus: 'UNDER_VERIFICATION',
                            utr: utr,
                            screenshot: finalScreenshotUrl,
                            timestamp: new Date().toISOString()
                        });
                    }

                    localStorage.setItem('graviton_registrations', JSON.stringify(existing));

                    setTimeout(() => {
                        window.location.href = `status.html?regId=${encodeURIComponent(enteredRegId)}&submitted=true`;
                    }, 500);
                }
            } catch (err) {
                console.error('Payment Submission Error:', err);
                const existing = JSON.parse(localStorage.getItem('graviton_registrations') || '[]');
                for (let i = 0; i < existing.length; i++) {
                    if (existing[i].regId.toUpperCase() === enteredRegId || (existing[i].masterRegistrationId && existing[i].masterRegistrationId.toUpperCase() === enteredRegId)) {
                        existing[i].utr = utr;
                        existing[i].screenshot = finalScreenshotUrl;
                        existing[i].paymentStatus = 'UNDER_VERIFICATION';
                        break;
                    }
                }
                localStorage.setItem('graviton_registrations', JSON.stringify(existing));
                window.location.href = `status.html?regId=${encodeURIComponent(enteredRegId)}&submitted=true`;
            }
        });
    }

    function showError(msg) {
        if (paymentError) {
            paymentError.textContent = msg;
            paymentError.style.display = 'block';
            paymentError.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
            alert(msg);
        }
    }

    function setLoading(isLoading, customText) {
        if (submitBtn) {
            submitBtn.disabled = isLoading;
            const loadingMsg = customText || 'Submitting for Verification...';
            submitBtn.innerHTML = isLoading
                ? `<i class="fa-solid fa-spinner fa-spin"></i> ${loadingMsg}`
                : '<i class="fa-solid fa-paper-plane"></i> Submit Payment Proof for Verification';
        }
    }
}

function escapeHTML(str) {
    return String(str || '').replace(/[&<>"']/g, match => {
        const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
        return map[match];
    });
}
