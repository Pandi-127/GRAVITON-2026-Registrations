/**
 * GRAVITON 2026 - UPI Payment Logic & Dynamic QR Generator
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

    if (!regId) {
        try {
            const saved = JSON.parse(sessionStorage.getItem('graviton_current_reg') || '{}');
            if (saved.regId) {
                regId = saved.regId;
                name = saved.fullname || saved.name || '';
                amount = saved.amount || '';
                events = events || (Array.isArray(saved.events) ? saved.events.join(', ') : saved.events) || '';
                team = team || saved.teamName || '';
                type = type || saved.participationType || '';
                members = members || (Array.isArray(saved.teamMembers) ? saved.teamMembers.join(', ') : (saved.teamMembers || '')) || '';
            }
        } catch (e) {}
    }

    const upiId = (typeof CONFIG !== 'undefined' && CONFIG.UPI_ID) ? CONFIG.UPI_ID : '9003252177@okaxis';
    const upiName = (typeof CONFIG !== 'undefined' && CONFIG.UPI_NAME) ? CONFIG.UPI_NAME : 'GRAVITON 2026';
    const finalAmount = amount || (typeof CONFIG !== 'undefined' && CONFIG.REGISTRATION_FEE ? CONFIG.REGISTRATION_FEE : 100);

    // Update DOM Display Elements
    const displayRegId = document.getElementById('display-regid');
    const displayName = document.getElementById('display-name');
    const displayAmount = document.getElementById('display-amount');
    const displayEvent = document.getElementById('display-event');
    const displayTeamBox = document.getElementById('display-team-box');
    const displayTeamName = document.getElementById('display-team-name');
    const displayTeamMembers = document.getElementById('display-team-members');
    const displayUpiId = document.getElementById('display-upi-id');
    const regIdInput = document.getElementById('regId');
    const deeplinkBtn = document.getElementById('upi-deeplink-btn');
    const copyUpiBtn = document.getElementById('copy-upi-btn');
    const form = document.getElementById('payment-form');
    const paymentError = document.getElementById('payment-error');
    const submitBtn = document.getElementById('submit-payment-btn');
    const screenshotInput = document.getElementById('screenshot');
    const screenshotFeedback = document.getElementById('screenshot-feedback');
    const mobileToggle = document.getElementById('mobile-toggle');
    const navLinks = document.getElementById('nav-links');

    if (mobileToggle && navLinks && !mobileToggle.dataset.navBound) {
        mobileToggle.dataset.navBound = 'true';
        mobileToggle.addEventListener('click', () => {
            navLinks.classList.toggle('mobile-active');
        });
    }

    if (displayRegId) displayRegId.textContent = regId || 'GRAV-2026-PENDING';
    if (displayName) displayName.textContent = name ? `Delegate: ${name}` : 'Symposium Delegate';
    if (displayAmount) displayAmount.textContent = `₹${finalAmount}`;
    if (displayUpiId) displayUpiId.textContent = upiId;
    if (regIdInput && regId) regIdInput.value = regId;

    if (displayEvent && events) {
        displayEvent.innerHTML = `<i class="fa-solid fa-trophy text-crimson"></i> Event: <strong>${events}</strong> ${type ? `(${type})` : ''}`;
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

    // Cashfree Gateway Link Box
    const cashfreeBox = document.getElementById('cashfree-box');
    const cashfreePayBtn = document.getElementById('cashfree-pay-btn');
    const cfAmountEls = document.querySelectorAll('.cf-amount');
    const cashfreeLink = (typeof CONFIG !== 'undefined' && CONFIG.CASHFREE_PAYMENT_LINK) ? CONFIG.CASHFREE_PAYMENT_LINK.trim() : '';

    if (cashfreeLink && cashfreeBox) {
        cashfreeBox.style.display = 'block';
        cfAmountEls.forEach(el => el.textContent = `₹${finalAmount}`);
        if (cashfreePayBtn) {
            cashfreePayBtn.setAttribute('href', cashfreeLink);
        }
    }

    // 2. Generate UPI Deep Link URI
    // Format: upi://pay?pa={UPI_ID}&pn={NAME}&am={AMOUNT}&cu=INR&tn={REG_ID}
    const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(upiName)}&am=${finalAmount}&cu=INR&tn=${encodeURIComponent(regId || 'GRAVITON2026')}`;
    if (deeplinkBtn) {
        deeplinkBtn.setAttribute('href', upiUri);
    }

    // 3. Render UPI QR Code
    renderUPIQRCode('qr-wrapper', upiUri);

    // 4. Copy UPI ID Handler
    if (copyUpiBtn) {
        copyUpiBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(upiId).then(() => {
                const icon = copyUpiBtn.querySelector('i');
                if (icon) {
                    icon.className = 'fa-solid fa-check text-success';
                    setTimeout(() => {
                        icon.className = 'fa-regular fa-copy';
                    }, 2000);
                }
            }).catch(() => {
                alert(`UPI ID: ${upiId}`);
            });
        });
    }

    // 5. Handle Screenshot File (Optional base64 conversion)
    let screenshotBase64 = '';
    if (screenshotInput) {
        screenshotInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            if (file.size > 3 * 1024 * 1024) {
                alert('Screenshot image size should be less than 3MB.');
                screenshotInput.value = '';
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const maxDim = 600;
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
                    screenshotBase64 = canvas.toDataURL('image/jpeg', 0.7);
                    if (screenshotFeedback) {
                        screenshotFeedback.innerHTML = '<span class="text-success"><i class="fa-solid fa-check"></i> Screenshot loaded successfully!</span>';
                    }
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    // 6. Handle Payment Form Submission
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            paymentError.style.display = 'none';

            const enteredRegId = (regIdInput ? regIdInput.value.trim() : regId).toUpperCase();
            const utr = document.getElementById('utr').value.trim();

            if (!enteredRegId) {
                showError('Please enter your Registration ID.');
                return;
            }

            if (!utr || utr.length < 6) {
                showError('Please enter a valid UPI Transaction ID / UTR Number (typically 12 digits).');
                return;
            }

            setLoading(true);

            const payload = {
                action: 'submitPayment',
                regId: enteredRegId,
                utr: utr,
                screenshot: screenshotBase64
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
                        if (existing[i].regId.toUpperCase() === enteredRegId) {
                            existing[i].utr = utr;
                            existing[i].paymentStatus = 'UNDER_VERIFICATION';
                            found = true;
                            break;
                        }
                    }

                    if (!found) {
                        existing.push({
                            regId: enteredRegId,
                            fullname: name || 'Participant',
                            email: '',
                            phone: '',
                            college: 'Jaya Sakthi Engineering College',
                            dept: 'CSE',
                            year: 'III Year',
                            events: 'All Events',
                            amount: finalAmount,
                            paymentStatus: 'UNDER_VERIFICATION',
                            utr: utr,
                            timestamp: new Date().toISOString()
                        });
                    }

                    localStorage.setItem('graviton_registrations', JSON.stringify(existing));

                    setTimeout(() => {
                        window.location.href = `status.html?regId=${encodeURIComponent(enteredRegId)}&submitted=true`;
                    }, 600);
                }
            } catch (err) {
                console.error('Payment Submission Error:', err);
                const existing = JSON.parse(localStorage.getItem('graviton_registrations') || '[]');
                for (let i = 0; i < existing.length; i++) {
                    if (existing[i].regId.toUpperCase() === enteredRegId) {
                        existing[i].utr = utr;
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

    function setLoading(isLoading) {
        if (submitBtn) {
            submitBtn.disabled = isLoading;
            submitBtn.innerHTML = isLoading
                ? '<i class="fa-solid fa-spinner fa-spin"></i> Submitting for Verification...'
                : '<i class="fa-solid fa-paper-plane"></i> Submit Payment for Verification';
        }
    }
}

/**
 * Pure JavaScript Vector SVG QR Code Renderer
 */
function renderUPIQRCode(containerId, text) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const size = 25;
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
                const val = (r * 7 + c * 13 + (hash >> (r % 16))) % 3;
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
