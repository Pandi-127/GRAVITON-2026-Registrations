/**
 * GRAVITON 2026 - Registration Portal Logic
 * Jaya Sakthi Engineering College (CSE & Cyber Security Dept.)
 */

document.addEventListener('DOMContentLoaded', () => {
    initRegisterPage();
});

function initRegisterPage() {
    const form = document.getElementById('registration-form');
    const submitBtn = document.getElementById('submit-btn');
    const formError = document.getElementById('form-error');
    const demoBanner = document.getElementById('demo-banner');
    const displayFee = document.getElementById('display-fee');
    const mobileToggle = document.getElementById('mobile-toggle');
    const navLinks = document.getElementById('nav-links');

    // Mobile nav toggle
    if (mobileToggle && navLinks) {
        mobileToggle.addEventListener('click', () => {
            navLinks.classList.toggle('mobile-active');
        });
    }

    // Display fee from config
    const fee = (typeof CONFIG !== 'undefined' && CONFIG.REGISTRATION_FEE) ? CONFIG.REGISTRATION_FEE : 100;
    if (displayFee) displayFee.textContent = `₹${fee}`;

    // Check if API_URL is set
    const hasAPI = Boolean(typeof CONFIG !== 'undefined' && CONFIG.API_URL && CONFIG.API_URL.trim().length > 10);
    if (!hasAPI && demoBanner) {
        demoBanner.style.display = 'block';
    }

    // Pre-select event from URL query param if present
    const urlParams = new URLSearchParams(window.location.search);
    const preselectedEvent = urlParams.get('event');
    if (preselectedEvent) {
        const checkbox = document.querySelector(`input[name="selected_events"][value="${preselectedEvent}"]`);
        if (checkbox) {
            checkbox.checked = true;
            const parent = checkbox.closest('.custom-checkbox');
            if (parent) parent.style.borderColor = 'var(--primary-crimson)';
        }
    }

    // Form submit
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            formError.style.display = 'none';

            // Gather values
            const fullname = document.getElementById('fullname').value.trim();
            const email = document.getElementById('email').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const college = document.getElementById('college').value.trim();
            const dept = document.getElementById('dept').value;
            const year = document.getElementById('year').value;

            // Checked events
            const checkedEvents = Array.from(document.querySelectorAll('input[name="selected_events"]:checked'))
                .map(cb => cb.value);

            // Validation
            if (!fullname) {
                showError('Please enter your full name.');
                return;
            }
            if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                showError('Please enter a valid email address.');
                return;
            }
            if (!phone || !/^\d{10}$/.test(phone)) {
                showError('Please enter a valid 10-digit mobile number.');
                return;
            }
            if (!college) {
                showError('Please enter your college or institution name.');
                return;
            }
            if (!dept) {
                showError('Please select your department.');
                return;
            }
            if (!year) {
                showError('Please select your year of study.');
                return;
            }
            if (checkedEvents.length === 0) {
                showError('Please select at least one event (Technical or Non-Technical) to participate in.');
                return;
            }

            // Submit Payload
            const payload = {
                action: 'register',
                fullname: fullname,
                email: email,
                phone: phone,
                college: college,
                dept: dept,
                year: year,
                events: checkedEvents,
                amount: fee
            };

            setLoading(true);

            try {
                if (hasAPI) {
                    // Google Apps Script API Call
                    const response = await fetch(CONFIG.API_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // Use text/plain to avoid CORS preflight issues with GAS
                        body: JSON.stringify(payload)
                    });

                    const data = await response.json();

                    if (data && data.success) {
                        // Store last regId in sessionStorage for convenience
                        sessionStorage.setItem('graviton_current_reg', JSON.stringify(data));
                        // Redirect to payment page
                        window.location.href = `payment.html?regId=${encodeURIComponent(data.regId)}&name=${encodeURIComponent(fullname)}&amount=${fee}&events=${encodeURIComponent(checkedEvents.join(', '))}`;
                    } else {
                        showError(data.error || 'Registration failed. Please try again.');
                        setLoading(false);
                    }
                } else {
                    // Offline / Local Demo Fallback Mode
                    const mockRegId = `GRAV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
                    const localRecord = {
                        regId: mockRegId,
                        timestamp: new Date().toISOString(),
                        fullname: fullname,
                        email: email,
                        phone: phone,
                        college: college,
                        dept: dept,
                        year: year,
                        events: checkedEvents.join(', '),
                        amount: fee,
                        paymentStatus: 'PENDING',
                        utr: ''
                    };

                    const existing = JSON.parse(localStorage.getItem('graviton_registrations') || '[]');
                    existing.push(localRecord);
                    localStorage.setItem('graviton_registrations', JSON.stringify(existing));
                    sessionStorage.setItem('graviton_current_reg', JSON.stringify(localRecord));

                    // Small delay for realistic feel
                    setTimeout(() => {
                        window.location.href = `payment.html?regId=${encodeURIComponent(mockRegId)}&name=${encodeURIComponent(fullname)}&amount=${fee}&events=${encodeURIComponent(checkedEvents.join(', '))}`;
                    }, 600);
                }
            } catch (err) {
                console.error('Registration API Error:', err);
                // Fallback to offline storage if network fails
                const mockRegId = `GRAV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
                const localRecord = {
                    regId: mockRegId,
                    timestamp: new Date().toISOString(),
                    fullname: fullname,
                    email: email,
                    phone: phone,
                    college: college,
                    dept: dept,
                    year: year,
                    events: checkedEvents.join(', '),
                    amount: fee,
                    paymentStatus: 'PENDING',
                    utr: ''
                };

                const existing = JSON.parse(localStorage.getItem('graviton_registrations') || '[]');
                existing.push(localRecord);
                localStorage.setItem('graviton_registrations', JSON.stringify(existing));

                window.location.href = `payment.html?regId=${encodeURIComponent(mockRegId)}&name=${encodeURIComponent(fullname)}&amount=${fee}&events=${encodeURIComponent(checkedEvents.join(', '))}`;
            }
        });
    }

    function showError(msg) {
        if (formError) {
            formError.textContent = msg;
            formError.style.display = 'block';
            formError.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
            alert(msg);
        }
    }

    function setLoading(isLoading) {
        if (submitBtn) {
            submitBtn.disabled = isLoading;
            submitBtn.innerHTML = isLoading
                ? '<i class="fa-solid fa-spinner fa-spin"></i> Processing Registration...'
                : '<i class="fa-solid fa-arrow-right"></i> Proceed to UPI Payment (Step 2)';
        }
    }
}
