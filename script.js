/* ==========================================================================
   GRAVITON 2026 - Main Interactive Script
   Jaya Sakthi Engineering College (CSE & Cyber Security Dept.)
   ========================================================================== */

// Detailed Data Store for All 12 Symposium Events (Preserved from Source of Truth)
const EVENTS_DATA = {
    "ppt": {
        title: "PPT Presentation",
        category: "Technical",
        teamSize: "1 - 3 Members",
        duration: "10 Mins Presentation + 10 Mins Q&A",
        desc: "Showcase your cutting-edge technical research, innovative engineering concepts, or project slides before an esteemed panel of judges.",
        rules: [
            "Topics must pertain to Computer Science, Cyber Security, AI/ML, Cloud, or Emerging Technologies.",
            "Maximum 12 slides per presentation.",
            "Abstract must be submitted in PDF format prior to the event start.",
            "Decision of the judging panel will be final and binding."
        ]
    },
    "tech-quiz": {
        title: "Tech Quiz",
        category: "Technical",
        teamSize: "1 - 2 Members",
        duration: "3 Rounds (Preliminary + Semi + Final Grid)",
        desc: "A rapid-fire technical trivia showdown testing your command over computer science concepts, cyber security lore, tech giants, and tech history.",
        rules: [
            "Round 1: MCQ paper-based preliminary round (20 Mins).",
            "Round 2: Rapid fire buzzer round for top 8 qualifying teams.",
            "No electronic gadgets or internet access permitted during quiz rounds.",
            "Negative marking applies for wrong answers in the buzzer round."
        ]
    },
    "ai-prompt": {
        title: "AI Prompt Battle",
        category: "Technical",
        teamSize: "Individual (1 Member)",
        duration: "30 Mins Arena",
        desc: "Battle in prompt engineering! Given a target output image or complex code blueprint, craft the precise prompt to generate matching results.",
        rules: [
            "Participants will be provided access to standard Generative AI sandboxes.",
            "Evaluation based on structural similarity, visual fidelity, and prompt efficiency.",
            "Direct editing or manual photo manipulation is strictly prohibited."
        ]
    },
    "reverse-coding": {
        title: "Reverse Coding",
        category: "Technical",
        teamSize: "Individual (1 Member)",
        duration: "45 Mins",
        desc: "An algorithmic challenge where source code is hidden! Analyze black-box inputs and outputs to deduce the underlying algorithm and code it.",
        rules: [
            "Languages allowed: C, C++, Java, or Python 3.",
            "Multiple testcases (including edge cases) must pass.",
            "Plagiarism or unauthorized external code assistance leads to immediate disqualification."
        ]
    },
    "ctf": {
        title: "CTF (Capture The Flag)",
        category: "Technical",
        teamSize: "1 - 2 Members",
        duration: "90 Mins Jeopardy Format",
        desc: "A hands-on cybersecurity competition involving Web Exploitation, Reverse Engineering, Cryptography, Steganography, and Forensics flags.",
        rules: [
            "Jeopardy style scoreboard system with dynamic flag point values.",
            "Brute forcing or attacking the CTF infrastructure is strictly forbidden.",
            "First team to submit valid hash flags wins bonus speed points."
        ]
    },
    "web-creation": {
        title: "Website Creation Without Using AI",
        category: "Technical",
        teamSize: "Individual (1 Member)",
        duration: "60 Mins",
        desc: "Unleash your raw web development craft! Build a responsive, aesthetic webpage on a given theme using pure HTML5, CSS3, and JavaScript.",
        rules: [
            "Strictly NO AI assistants (ChatGPT, Copilot, Gemini) allowed.",
            "Only standard local code editors (VS Code / Notepad++) will be provided.",
            "Judged on UI aesthetics, responsiveness, semantic HTML, and CSS creativity."
        ]
    },
    "data-grid": {
        title: "Data Grid",
        category: "Technical",
        teamSize: "Individual (1 Member)",
        duration: "45 Mins",
        desc: "Dive into data analytics and SQL query crafting. Clean messy datasets, formulate complex JOIN queries, and extract key insights under time constraints.",
        rules: [
            "Database engine provided: MySQL / PostgreSQL sandbox.",
            "Evaluation based on query execution time, correctness, and output format.",
            "Dataset schema will be revealed at the beginning of the round."
        ]
    },
    "meme-marketing": {
        title: "Meme Marketing",
        category: "Non-Technical",
        teamSize: "1 - 2 Members",
        duration: "40 Mins",
        desc: "Channel your internet culture mastery! Create humorous, viral tech memes to promote a given fictional brand or product line.",
        rules: [
            "Memes must be original and created during the event timeframe.",
            "No offensive, derogatory, or inappropriate content permitted.",
            "Judged on humor, viral appeal, brand alignment, and creativity."
        ]
    },
    "number-logic": {
        title: "Number Logic Battle",
        category: "Non-Technical",
        teamSize: "Individual (1 Member)",
        duration: "30 Mins",
        desc: "High-octane numerical face-off testing speed mental arithmetic, number sequence decoding, and quantitative logic grids.",
        rules: [
            "Calculators and mobile devices are strictly disallowed.",
            "Speed round format with elimination after preliminary grid.",
            "Highest score in shortest time wins."
        ]
    },
    "esports": {
        title: "E Sports Battle",
        category: "Non-Technical",
        teamSize: "Squad (4 Members)",
        duration: "Tournament Matches",
        desc: "Competitive multiplayer gaming tournament featuring custom rooms, tactical squad gameplay, and knockout final battles.",
        rules: [
            "Game titles & match settings announced prior to room creation.",
            "Emulators strictly prohibited; mobile devices only.",
            "Unsportsmanlike conduct or hacking results in immediate team ban."
        ]
    },
    "squid-game": {
        title: "Squid Game",
        category: "Non-Technical",
        teamSize: "Individual (1 Member)",
        duration: "4 Survival Rounds",
        desc: "Thrilling physical & mental agility survival challenges inspired by high-stakes games (Red Light Green Light, Memory Grid, Tug of Strategy).",
        rules: [
            "Players failing a round challenge are immediately eliminated.",
            "Strict adherence to event referee signals is mandatory.",
            "Final surviving player wins the GRAVITON Squid Champion title!"
        ]
    },
    "treasure-hunt": {
        title: "Treasure Hunt",
        category: "Non-Technical",
        teamSize: "2 - 3 Members",
        duration: "60 Mins Campus Hunt",
        desc: "Decode cryptic technical puzzles and riddles hidden across the Jaya Sakthi campus to locate the final physical treasure chest.",
        rules: [
            "Teams must solve each clue sequentially to receive the next location coordinate.",
            "Damaging college property or altering hidden clue cards leads to instant disqualification.",
            "First team to retrieve the final treasure chest wins."
        ]
    }
};

document.addEventListener('DOMContentLoaded', () => {
    initParticleCanvas();
    initStickyNavbar();
    initCountdownTimer();
    initNumberCounters();
    initEventFilters();
    initModalHandlers();
});

/* --------------------------------------------------------------------------
   1. Atmospheric Cosmic Background Particles Canvas
   -------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------
   1. Atmospheric Cosmic Background Particles Canvas (Device Adaptive & High-DPI)
   -------------------------------------------------------------------------- */
function initParticleCanvas() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let isMobile = window.innerWidth <= 768;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = window.innerWidth;
    let height = window.innerHeight;

    function resizeCanvas() {
        width = window.innerWidth;
        height = window.innerHeight;
        isMobile = width <= 768;
        dpr = Math.min(window.devicePixelRatio || 1, 2);

        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
    }

    resizeCanvas();

    // Prevent resize flashing on mobile scroll when address bar toggles
    let lastWidth = window.innerWidth;
    window.addEventListener('resize', () => {
        if (Math.abs(window.innerWidth - lastWidth) > 30 || Math.abs(window.innerHeight - height) > 150) {
            lastWidth = window.innerWidth;
            resizeCanvas();
        }
    }, { passive: true });

    // Adaptive particle count based on device capability
    const maxParticles = isMobile ? 26 : Math.min(Math.floor((width * height) / 22000), 75);
    const particles = [];

    class CosmicParticle {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.radius = Math.random() * (isMobile ? 1.5 : 2.2) + 0.5;
            this.vx = (Math.random() - 0.5) * (isMobile ? 0.25 : 0.35);
            this.vy = (Math.random() - 0.5) * (isMobile ? 0.25 : 0.35) - 0.1;
            this.alpha = Math.random() * 0.65 + 0.2;
            const rand = Math.random();
            if (rand < 0.6) {
                this.color = '#ff1e42'; // Crimson
            } else if (rand < 0.85) {
                this.color = '#ff6b00'; // Fire orange
            } else {
                this.color = '#00f0ff'; // Cyan accent
            }
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            if (this.x < 0 || this.x > width || this.y < 0 || this.y > height) {
                this.reset();
            }
        }
        draw() {
            ctx.save();
            ctx.globalAlpha = this.alpha;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
            // Skip expensive shadowBlur on mobile devices to preserve battery and 60fps smoothness
            if (!isMobile && (this.color === '#ff1e42' || this.color === '#00f0ff')) {
                ctx.shadowBlur = 8;
                ctx.shadowColor = this.color;
            }
            ctx.restore();
        }
    }

    for (let i = 0; i < maxParticles; i++) {
        particles.push(new CosmicParticle());
    }

    if (prefersReducedMotion) {
        // Draw static starfield once for users requesting reduced motion
        ctx.clearRect(0, 0, width, height);
        particles.forEach(p => p.draw());
        return;
    }

    let animationFrameId;
    let isTabVisible = true;

    function animate() {
        if (!isTabVisible) return;
        ctx.clearRect(0, 0, width, height);
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
        }
        animationFrameId = requestAnimationFrame(animate);
    }

    // Energy saving: Pause animation when tab is not visible
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            isTabVisible = false;
            cancelAnimationFrame(animationFrameId);
        } else {
            isTabVisible = true;
            animationFrameId = requestAnimationFrame(animate);
        }
    });

    animate();
}

/* --------------------------------------------------------------------------
   2. Sticky Navbar & Mobile Navigation
   -------------------------------------------------------------------------- */
function initStickyNavbar() {
    const navbar = document.querySelector('.navbar');
    const mobileToggle = document.getElementById('mobile-toggle');
    const navLinks = document.getElementById('nav-links');

    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 30) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }, { passive: true });
    }

    if (mobileToggle && navLinks && !mobileToggle.dataset.navBound) {
        mobileToggle.dataset.navBound = 'true';

        function closeNav() {
            navLinks.classList.remove('mobile-active');
            const icon = mobileToggle.querySelector('i');
            if (icon) {
                icon.classList.add('fa-bars');
                icon.classList.remove('fa-xmark');
            }
        }

        mobileToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = navLinks.classList.toggle('mobile-active');
            const icon = mobileToggle.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-bars', !isOpen);
                icon.classList.toggle('fa-xmark', isOpen);
            }
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', closeNav);
        });

        // Close on tap outside
        document.addEventListener('click', (e) => {
            if (navLinks.classList.contains('mobile-active') && !navbar.contains(e.target)) {
                closeNav();
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navLinks.classList.contains('mobile-active')) {
                closeNav();
            }
        });
    }

    // Highlight active link on scroll
    const sections = document.querySelectorAll('section[id]');
    if (sections.length && navLinks) {
        window.addEventListener('scroll', () => {
            const scrollY = window.pageYOffset;
            sections.forEach(current => {
                const sectionHeight = current.offsetHeight;
                const sectionTop = current.offsetTop - 140;
                const sectionId = current.getAttribute('id');
                const link = navLinks.querySelector(`a[href*="#${sectionId}"]`);
                if (link) {
                    if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                }
            });
        }, { passive: true });
    }
}

/* --------------------------------------------------------------------------
   3. Animated Countdown Timer
   -------------------------------------------------------------------------- */
function initCountdownTimer() {
    // Set symposium date: 14 days from current date
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 14);
    targetDate.setHours(9, 0, 0, 0);

    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');

    if (!daysEl) return;

    function update() {
        const now = new Date().getTime();
        const diff = targetDate.getTime() - now;

        if (diff <= 0) {
            daysEl.textContent = '00';
            hoursEl.textContent = '00';
            minutesEl.textContent = '00';
            secondsEl.textContent = '00';
            return;
        }

        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);

        daysEl.textContent = String(d).padStart(2, '0');
        hoursEl.textContent = String(h).padStart(2, '0');
        minutesEl.textContent = String(m).padStart(2, '0');
        secondsEl.textContent = String(s).padStart(2, '0');
    }

    update();
    setInterval(update, 1000);
}

/* --------------------------------------------------------------------------
   4. Animated Statistics Counters
   -------------------------------------------------------------------------- */
function initNumberCounters() {
    const statCounters = document.querySelectorAll('.stat-count');
    if (!statCounters.length) return;

    let started = false;
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !started) {
                started = true;
                statCounters.forEach(counter => {
                    const target = parseInt(counter.getAttribute('data-target'), 10) || 0;
                    const suffix = counter.getAttribute('data-suffix') || '';
                    let count = 0;
                    const speed = 25;
                    const step = Math.max(1, Math.floor(target / 40));

                    const interval = setInterval(() => {
                        count += step;
                        if (count >= target) {
                            counter.textContent = target + suffix;
                            clearInterval(interval);
                        } else {
                            counter.textContent = count + suffix;
                        }
                    }, speed);
                });
            }
        });
    }, { threshold: 0.3 });

    const statsSection = document.querySelector('.hero-stats');
    if (statsSection) observer.observe(statsSection);
}

/* --------------------------------------------------------------------------
   5. Event Category Filter & Search
   -------------------------------------------------------------------------- */
function initEventFilters() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const searchInput = document.getElementById('event-search');
    const eventCards = document.querySelectorAll('.event-card');

    if (!eventCards.length && !searchInput) return;

    let currentCategory = 'all';
    let searchQuery = '';

    function applyFilter() {
        eventCards.forEach(card => {
            const category = card.getAttribute('data-category');
            const title = (card.getAttribute('data-title') || '').toLowerCase();
            const matchesCategory = (currentCategory === 'all' || category === currentCategory);
            const matchesSearch = title.includes(searchQuery.toLowerCase());

            if (matchesCategory && matchesSearch) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    }

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.getAttribute('data-filter');
            applyFilter();
        });
    });

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.trim();
            applyFilter();
        });
    }
}

/* --------------------------------------------------------------------------
   6. Event Rules & Details Modal
   -------------------------------------------------------------------------- */
function initModalHandlers() {
    const modal = document.getElementById('event-modal');
    if (!modal) return;

    const closeBtn = document.getElementById('modal-close');
    const modalCloseBtn = document.getElementById('m-close-btn');
    const modalSelectBtn = document.getElementById('m-register-btn');

    const mTitle = document.getElementById('m-title');
    const mCategory = document.getElementById('m-category');
    const mDesc = document.getElementById('m-desc');
    const mTeamSize = document.getElementById('m-teamsize');
    const mDuration = document.getElementById('m-duration');
    const mRules = document.getElementById('m-rules');

    let selectedEventTitle = '';

    document.querySelectorAll('.btn-details').forEach(btn => {
        btn.addEventListener('click', () => {
            const eventId = btn.getAttribute('data-id');
            const data = EVENTS_DATA[eventId];
            if (!data) return;

            selectedEventTitle = data.title;
            mTitle.textContent = data.title;
            mCategory.textContent = data.category;
            mCategory.className = `modal-badge ${data.category === 'Technical' ? 'text-cyan' : 'text-amber'}`;
            mDesc.textContent = data.desc;
            mTeamSize.textContent = data.teamSize;
            mDuration.textContent = data.duration;

            mRules.innerHTML = data.rules.map(rule => `
                <li><i class="fa-solid fa-chevron-right text-crimson"></i> <span>${rule}</span></li>
            `).join('');

            modal.classList.add('active');
            modal.setAttribute('aria-hidden', 'false');
        });
    });

    function closeModal() {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
    }

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);

    if (modalSelectBtn) {
        modalSelectBtn.addEventListener('click', () => {
            closeModal();
            // Redirect to registration page with pre-selected event
            window.location.href = `register.html?event=${encodeURIComponent(selectedEventTitle)}`;
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
}
