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

    // Mobile nav toggle (fallback if script.js not loaded)
    if (mobileToggle && navLinks && !mobileToggle.dataset.navBound) {
        mobileToggle.dataset.navBound = 'true';
        mobileToggle.addEventListener('click', () => {
            navLinks.classList.toggle('mobile-active');
        });
    }

    // Base fee per head from config
    const feePerHead = (typeof CONFIG !== 'undefined' && CONFIG.REGISTRATION_FEE) ? CONFIG.REGISTRATION_FEE : 100;

    // Check if API_URL is set
    const hasAPI = Boolean(typeof CONFIG !== 'undefined' && CONFIG.API_URL && CONFIG.API_URL.trim().length > 10);
    if (!hasAPI && demoBanner) {
        demoBanner.style.display = 'block';
    }

    // Event Team Capabilities Configuration
    const EVENT_TEAM_CONFIG = {
        "PPT Presentation": {
            allowsTeam: true,
            allowsSolo: true,
            minMembers: 2,
            maxMembers: 3,
            ruleNote: 'Team Size: 1 to 3 Members (Solo or Team)',
            defaultType: 'Team'
        },
        "Tech Quiz": {
            allowsTeam: true,
            allowsSolo: true,
            minMembers: 2,
            maxMembers: 2,
            ruleNote: 'Team Size: 1 to 2 Members (Solo or Duo)',
            defaultType: 'Solo'
        },
        "AI Prompt Battle": {
            allowsTeam: false,
            ruleNote: 'Individual Event (Solo Only)'
        },
        "Reverse Coding": {
            allowsTeam: false,
            ruleNote: 'Individual Event (Solo Only)'
        },
        "CTF (Capture The Flag)": {
            allowsTeam: true,
            allowsSolo: true,
            minMembers: 2,
            maxMembers: 2,
            ruleNote: 'Team Size: 1 to 2 Members (Solo or Duo)',
            defaultType: 'Team'
        },
        "Website Creation Without Using AI": {
            allowsTeam: false,
            ruleNote: 'Individual Event (Solo Only)'
        },
        "Data Grid": {
            allowsTeam: false,
            ruleNote: 'Individual Event (Solo Only)'
        },
        "Meme Marketing": {
            allowsTeam: true,
            allowsSolo: true,
            minMembers: 2,
            maxMembers: 2,
            ruleNote: 'Team Size: 1 to 2 Members (Solo or Duo)',
            defaultType: 'Solo'
        },
        "Number Logic Battle": {
            allowsTeam: false,
            ruleNote: 'Individual Event (Solo Only)'
        },
        "E Sports": {
            allowsTeam: true,
            allowsSolo: false, // Squad event strictly
            minMembers: 4,
            maxMembers: 4,
            ruleNote: 'Squad Event: 4 Members Required',
            defaultType: 'Team'
        },
        "Squid Game": {
            allowsTeam: false,
            ruleNote: 'Individual Event (Solo Only)'
        },
        "Treasure Hunt": {
            allowsTeam: true,
            allowsSolo: false, // Strictly 2-3 members
            minMembers: 2,
            maxMembers: 3,
            ruleNote: 'Team Event: 2 to 3 Members Required',
            defaultType: 'Team'
        }
    };

    // DOM Elements for Participation & Team
    const participationSection = document.getElementById('participation-section');
    const soloOnlyCard = document.getElementById('solo-only-card');
    const teamChoiceContainer = document.getElementById('team-choice-container');
    const teamDetailsCard = document.getElementById('team-details-card');
    const teamNameInput = document.getElementById('team_name');
    const leaderNameDisplay = document.getElementById('leader-name-display');
    const teamRuleNote = document.getElementById('team-rule-note');
    const teamSizeBadge = document.getElementById('team-size-badge');
    const teamSizeNote = document.getElementById('team-size-note');
    const teamMembersContainer = document.getElementById('team-members-container');
    const addMemberBtn = document.getElementById('add-member-btn');
    const memberLimitMsg = document.getElementById('member-limit-msg');
    const choiceSoloCard = document.getElementById('choice-solo-card');
    const fullnameInput = document.getElementById('fullname');

    let currentEventConfig = null;

    // Live update leader name
    if (fullnameInput && leaderNameDisplay) {
        fullnameInput.addEventListener('input', () => {
            const val = fullnameInput.value.trim();
            leaderNameDisplay.textContent = val ? `${val} (You)` : 'Primary Delegate';
        });
    }

    // Dynamic Fee Calculation (₹100 per head)
    function getParticipantHeadCount() {
        const selectedRadio = document.querySelector('input[name="selected_events"]:checked');
        if (!selectedRadio) return 1;

        const eventName = selectedRadio.value;
        const config = EVENT_TEAM_CONFIG[eventName] || { allowsTeam: false };
        const participationTypeRadio = document.querySelector('input[name="participation_type"]:checked');
        const isTeam = Boolean(config.allowsTeam && participationTypeRadio && participationTypeRadio.value === 'Team');

        if (!isTeam) return 1;

        // 1 (Leader) + number of teammate rows in form
        const teammateRows = teamMembersContainer ? teamMembersContainer.querySelectorAll('.member-row').length : 0;
        return Math.max(1, 1 + teammateRows);
    }

    function updateFeeDisplay() {
        const headCount = getParticipantHeadCount();
        const totalAmount = headCount * feePerHead;
        const displayFeeEl = document.getElementById('display-fee');
        const feeBreakdownEl = document.getElementById('fee-breakdown');
        const submitBtnEl = document.getElementById('submit-btn');

        if (displayFeeEl) {
            displayFeeEl.textContent = `₹${totalAmount}`;
        }

        if (feeBreakdownEl) {
            if (headCount > 1) {
                feeBreakdownEl.innerHTML = `<i class="fa-solid fa-users text-cyan"></i> Team: ₹${feePerHead} per head × <strong>${headCount} Members</strong> = <strong>₹${totalAmount}</strong>`;
            } else {
                feeBreakdownEl.innerHTML = `<i class="fa-solid fa-user text-cyan"></i> Solo: ₹${feePerHead} per head × <strong>1 Delegate</strong> = <strong>₹${totalAmount}</strong>`;
            }
        }

        if (submitBtnEl && !submitBtnEl.disabled) {
            submitBtnEl.innerHTML = `<i class="fa-solid fa-arrow-right"></i> Proceed to UPI Payment (Step 2) • ₹${totalAmount}`;
        }

        return totalAmount;
    }

    // Radio buttons highlight handler for events
    const eventRadios = document.querySelectorAll('input[name="selected_events"]');
    function syncRadioCards() {
        eventRadios.forEach(radio => {
            const card = radio.closest('.custom-radio');
            if (card) {
                if (radio.checked) {
                    card.classList.add('is-selected');
                } else {
                    card.classList.remove('is-selected');
                }
            }
        });
    }

    function renderMemberSlot(slotNum, isRequired = false) {
        const row = document.createElement('div');
        row.className = 'member-row';
        row.id = `member-row-${slotNum}`;
        row.innerHTML = `
            <div class="input-with-icon">
                <i class="fa-solid fa-user-tag"></i>
                <input type="text" class="team-member-input" id="member-input-${slotNum}" placeholder="Teammate ${slotNum} Full Name ${isRequired ? '*' : '(Optional)'}" ${isRequired ? 'required' : ''}>
            </div>
            ${!isRequired ? `
                <button type="button" class="member-remove-btn" title="Remove Teammate">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            ` : ''}
        `;
        teamMembersContainer.appendChild(row);

        const removeBtn = row.querySelector('.member-remove-btn');
        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                row.remove();
                updateMemberAddState();
                updateFeeDisplay();
            });
        }
    }

    function updateMemberAddState() {
        if (!currentEventConfig) return;
        const currentCount = teamMembersContainer.querySelectorAll('.member-row').length;
        const maxTeammates = (currentEventConfig.maxMembers || 2) - 1; // excluding leader

        if (currentCount >= maxTeammates) {
            if (addMemberBtn) addMemberBtn.style.display = 'none';
            if (memberLimitMsg) memberLimitMsg.textContent = `Team capacity reached (${currentEventConfig.maxMembers} members total).`;
        } else {
            if (addMemberBtn) addMemberBtn.style.display = 'inline-flex';
            if (memberLimitMsg) memberLimitMsg.textContent = `Can add ${maxTeammates - currentCount} more teammate(s).`;
        }
    }

    if (addMemberBtn) {
        addMemberBtn.addEventListener('click', () => {
            if (!currentEventConfig) return;
            const currentCount = teamMembersContainer.querySelectorAll('.member-row').length;
            const maxTeammates = (currentEventConfig.maxMembers || 2) - 1;
            if (currentCount < maxTeammates) {
                renderMemberSlot(currentCount + 2, false);
                updateMemberAddState();
                updateFeeDisplay();
            }
        });
    }

    // Toggle Participation Format Card based on selected event
    function handleEventChange(eventName) {
        if (!eventName) return;
        const config = EVENT_TEAM_CONFIG[eventName] || { allowsTeam: false, ruleNote: 'Individual Event' };
        currentEventConfig = config;

        if (participationSection) participationSection.style.display = 'block';

        if (!config.allowsTeam) {
            // Strictly Individual Event
            if (soloOnlyCard) soloOnlyCard.style.display = 'flex';
            if (teamChoiceContainer) teamChoiceContainer.style.display = 'none';
            if (teamDetailsCard) teamDetailsCard.style.display = 'none';
            const soloRadio = document.querySelector('input[name="participation_type"][value="Solo"]');
            if (soloRadio) soloRadio.checked = true;
        } else {
            // Event Allows Teams
            if (soloOnlyCard) soloOnlyCard.style.display = 'none';
            if (teamChoiceContainer) teamChoiceContainer.style.display = 'block';

            if (teamRuleNote) teamRuleNote.textContent = config.ruleNote || '';
            if (teamSizeBadge) teamSizeBadge.innerHTML = `<i class="fa-solid fa-users"></i> ${config.ruleNote || 'Team'}`;
            if (teamSizeNote) teamSizeNote.textContent = config.ruleNote || 'Register with team';

            const soloRadio = document.querySelector('input[name="participation_type"][value="Solo"]');
            const teamRadio = document.querySelector('input[name="participation_type"][value="Team"]');

            if (config.allowsSolo === false) {
                // Strictly Team Event (e.g. E Sports or Treasure Hunt)
                if (choiceSoloCard) choiceSoloCard.style.display = 'none';
                if (teamRadio) teamRadio.checked = true;
                showTeamDetails(config);
            } else {
                // Solo or Team Allowed
                if (choiceSoloCard) choiceSoloCard.style.display = 'flex';
                if (config.defaultType === 'Team') {
                    if (teamRadio) teamRadio.checked = true;
                    showTeamDetails(config);
                } else {
                    if (soloRadio) soloRadio.checked = true;
                    if (teamDetailsCard) teamDetailsCard.style.display = 'none';
                }
            }
            syncParticipationCards();
        }
        updateFeeDisplay();
    }

    function showTeamDetails(config) {
        if (!config || !teamDetailsCard) return;
        teamDetailsCard.style.display = 'block';

        // Clear existing member rows
        if (teamMembersContainer) {
            teamMembersContainer.innerHTML = '';
            // Required teammates count = (minMembers - 1)
            const requiredTeammates = Math.max(1, (config.minMembers || 2) - 1);
            for (let i = 1; i <= requiredTeammates; i++) {
                renderMemberSlot(i + 1, true); // Member 2, Member 3, etc.
            }
            updateMemberAddState();
            updateFeeDisplay();
        }
    }

    // Participation radio buttons handler
    const participationRadios = document.querySelectorAll('input[name="participation_type"]');
    function syncParticipationCards() {
        participationRadios.forEach(radio => {
            const card = radio.closest('.custom-radio');
            if (card) {
                if (radio.checked) {
                    card.classList.add('is-selected');
                } else {
                    card.classList.remove('is-selected');
                }
            }
        });
    }

    participationRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            syncParticipationCards();
            if (radio.value === 'Team') {
                showTeamDetails(currentEventConfig);
            } else {
                if (teamDetailsCard) teamDetailsCard.style.display = 'none';
            }
            updateFeeDisplay();
        });
    });

    eventRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            syncRadioCards();
            handleEventChange(radio.value);
        });
    });

    // Pre-select event from URL query param if present
    const urlParams = new URLSearchParams(window.location.search);
    const preselectedEvent = urlParams.get('event');
    if (preselectedEvent) {
        const radio = document.querySelector(`input[name="selected_events"][value="${preselectedEvent}"]`);
        if (radio) {
            radio.checked = true;
            syncRadioCards();
            handleEventChange(radio.value);
        }
    }

    // Initial fee calculation
    updateFeeDisplay();

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

            // Selected event
            const selectedRadio = document.querySelector('input[name="selected_events"]:checked');

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
            if (!selectedRadio) {
                showError('Please select an event to participate in.');
                return;
            }

            const eventName = selectedRadio.value;
            const config = EVENT_TEAM_CONFIG[eventName] || { allowsTeam: false };
            const participationTypeRadio = document.querySelector('input[name="participation_type"]:checked');
            const isTeam = Boolean(config.allowsTeam && participationTypeRadio && participationTypeRadio.value === 'Team');

            let teamName = '';
            let teamMembers = [];

            if (isTeam) {
                teamName = (document.getElementById('team_name') ? document.getElementById('team_name').value.trim() : '');
                if (!teamName) {
                    showError('Please enter your Team Name.');
                    document.getElementById('team_name')?.focus();
                    return;
                }

                // Collect & validate member inputs
                const memberInputs = Array.from(document.querySelectorAll('.team-member-input'));
                for (let i = 0; i < memberInputs.length; i++) {
                    const inp = memberInputs[i];
                    const nameVal = inp.value.trim();
                    if (inp.hasAttribute('required') && !nameVal) {
                        showError(`Please enter the full name for Teammate ${i + 2}.`);
                        inp.focus();
                        return;
                    }
                    if (nameVal) {
                        teamMembers.push(nameVal);
                    }
                }

                if (teamMembers.length === 0) {
                    showError('Please enter at least one teammate full name.');
                    return;
                }
            }

            // Calculate dynamic total amount (₹100 per head)
            const totalAmount = updateFeeDisplay();

            const checkedEvents = [eventName];
            const eventSummary = isTeam
                ? `${eventName} [Team: ${teamName} (${fullname}, ${teamMembers.join(', ')})]`
                : `${eventName} [Solo]`;

            // Submit Payload
            const payload = {
                action: 'register',
                fullname: fullname,
                email: email,
                phone: phone,
                college: college,
                dept: dept,
                year: year,
                events: [eventName],
                participationType: isTeam ? 'Team' : 'Solo',
                teamName: isTeam ? teamName : '',
                teamMembers: isTeam ? teamMembers : [],
                amount: totalAmount
            };

            setLoading(true);

            try {
                if (hasAPI) {
                    // Google Apps Script API Call
                    const response = await fetch(CONFIG.API_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                        body: JSON.stringify(payload)
                    });

                    const data = await response.json();

                    if (data && data.success) {
                        sessionStorage.setItem('graviton_current_reg', JSON.stringify({
                            ...data,
                            participationType: isTeam ? 'Team' : 'Solo',
                            teamName: isTeam ? teamName : '',
                            teamMembers: isTeam ? teamMembers : [],
                            amount: totalAmount
                        }));
                        window.location.href = `payment.html?regId=${encodeURIComponent(data.regId)}&name=${encodeURIComponent(fullname)}&amount=${totalAmount}&events=${encodeURIComponent(eventName)}&team=${encodeURIComponent(teamName)}&type=${encodeURIComponent(isTeam ? 'Team' : 'Solo')}&members=${encodeURIComponent(teamMembers.join(', '))}`;
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
                        events: eventSummary,
                        participationType: isTeam ? 'Team' : 'Solo',
                        teamName: isTeam ? teamName : '',
                        teamMembers: isTeam ? teamMembers : [],
                        amount: totalAmount,
                        paymentStatus: 'PENDING',
                        utr: ''
                    };

                    const existing = JSON.parse(localStorage.getItem('graviton_registrations') || '[]');
                    existing.push(localRecord);
                    localStorage.setItem('graviton_registrations', JSON.stringify(existing));
                    sessionStorage.setItem('graviton_current_reg', JSON.stringify(localRecord));

                    setTimeout(() => {
                        window.location.href = `payment.html?regId=${encodeURIComponent(mockRegId)}&name=${encodeURIComponent(fullname)}&amount=${totalAmount}&events=${encodeURIComponent(eventName)}&team=${encodeURIComponent(teamName)}&type=${encodeURIComponent(isTeam ? 'Team' : 'Solo')}&members=${encodeURIComponent(teamMembers.join(', '))}`;
                    }, 500);
                }
            } catch (err) {
                console.error('Registration API Error:', err);
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
                    events: eventSummary,
                    participationType: isTeam ? 'Team' : 'Solo',
                    teamName: isTeam ? teamName : '',
                    teamMembers: isTeam ? teamMembers : [],
                    amount: totalAmount,
                    paymentStatus: 'PENDING',
                    utr: ''
                };

                const existing = JSON.parse(localStorage.getItem('graviton_registrations') || '[]');
                existing.push(localRecord);
                localStorage.setItem('graviton_registrations', JSON.stringify(existing));

                window.location.href = `payment.html?regId=${encodeURIComponent(mockRegId)}&name=${encodeURIComponent(fullname)}&amount=${totalAmount}&events=${encodeURIComponent(eventName)}&team=${encodeURIComponent(teamName)}&type=${encodeURIComponent(isTeam ? 'Team' : 'Solo')}&members=${encodeURIComponent(teamMembers.join(', '))}`;
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
            const currentTotal = updateFeeDisplay();
            submitBtn.innerHTML = isLoading
                ? '<i class="fa-solid fa-spinner fa-spin"></i> Processing Registration...'
                : `<i class="fa-solid fa-arrow-right"></i> Proceed to UPI Payment (Step 2) • ₹${currentTotal}`;
        }
    }
}
