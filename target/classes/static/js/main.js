/* =========================================
   PORTFOLIO MAIN.JS — Spring Boot + MySQL + NVIDIA AI
   ========================================= */

const API_BASE = '/api';

/* ===== UTILS ===== */
function escapeHtml(unsafe) {
    if (!unsafe) return "";
    return unsafe
         .toString()
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}

/* ===== AUTH STATE ===== */
let authToken = localStorage.getItem('portfolio_token') || null;
let currentUser = null;

/* ===== THEME TOGGLE ===== */
const themeToggle = document.getElementById('themeToggle');
const themeIcon   = document.getElementById('themeIcon');
const htmlEl      = document.documentElement;

function setTheme(theme) {
    htmlEl.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    themeIcon.className = theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
}

(function initTheme() {
    const saved = localStorage.getItem('theme') || 'dark';
    setTheme(saved);
})();

themeToggle?.addEventListener('click', () => {
    const current = htmlEl.getAttribute('data-theme');
    setTheme(current === 'dark' ? 'light' : 'dark');
});

/* ===== NAVBAR SCROLL ===== */
const navbar = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
    if (window.scrollY > 20) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
    updateActiveNav();
});

function updateActiveNav() {
    const scrollPos = window.scrollY + 100;
    sections.forEach(sec => {
        const top = sec.offsetTop;
        const height = sec.offsetHeight;
        const id = sec.getAttribute('id');
        if (scrollPos >= top && scrollPos < top + height) {
            navLinks.forEach(l => l.classList.remove('active'));
            const link = document.querySelector(`.nav-link[href="#${id}"]`);
            if (link) link.classList.add('active');
        }
    });
}

/* ===== HAMBURGER MENU ===== */
const hamburger = document.getElementById('hamburger');
const navLinksContainer = document.getElementById('navLinks');

hamburger?.addEventListener('click', () => {
    navLinksContainer.classList.toggle('open');
});

navLinks.forEach(link => {
    link.addEventListener('click', () => navLinksContainer.classList.remove('open'));
});

/* ===== TYPING EFFECT ===== */
const typedEl = document.getElementById('typedText');
const words = [
    'Java Developer',
    'Spring Boot Expert',
    'Full-Stack Engineer',
    'UI/UX Enthusiast',
    'Problem Solver',
    'NVIDIA AI Builder'
];
let wordIndex = 0, charIndex = 0, isDeleting = false;

function typeEffect() {
    if (!typedEl) return;
    const word = words[wordIndex];

    if (isDeleting) {
        typedEl.textContent = word.substring(0, charIndex--);
    } else {
        typedEl.textContent = word.substring(0, charIndex++);
    }

    let delay = isDeleting ? 60 : 110;

    if (!isDeleting && charIndex === word.length + 1) {
        isDeleting = true;
        delay = 1800;
    } else if (isDeleting && charIndex < 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        charIndex = 0;
        delay = 300;
    }

    setTimeout(typeEffect, delay);
}

setTimeout(typeEffect, 500);

/* ===== SCROLL REVEAL ===== */
const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
            setTimeout(() => entry.target.classList.add('active'), i * 80);
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

revealEls.forEach(el => revealObserver.observe(el));

/* ===== STAGGERED POINTS ENTRANCE ANIMATION ===== */
const allPoints = document.querySelectorAll('.timeline-content ul li, .detail-item, .achievement-item, .contact-item, .skill-item');
allPoints.forEach(point => {
    point.style.opacity = '0';
    point.style.transform = 'translateX(20px)';
});

const pointsObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const points = entry.target.querySelectorAll('.timeline-content ul li, .detail-item, .achievement-item, .contact-item, .skill-item');
            points.forEach((point, i) => {
                setTimeout(() => {
                    // Temporarily remove hover transition, run entrance, then restore
                    point.style.transition = 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                    point.style.opacity = '1';
                    point.style.transform = 'translateX(0)';
                    
                    // After entrance completes, clear inline styles so hover CSS takes over
                    setTimeout(() => {
                        point.style.transition = '';
                        point.style.transform = '';
                        point.style.opacity = '';
                    }, 500);

                }, i * 150 + 300); // 300ms base wait for parent reveal, 150ms stagger
            });
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.15 });

document.querySelectorAll('.section').forEach(sec => pointsObserver.observe(sec));


/* ===== COUNTER ANIMATION ===== */
const counters = document.querySelectorAll('.stat-number');
let countersStarted = false;

const counterObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !countersStarted) {
        countersStarted = true;
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'), 10);
            let count = 0;
            const step = Math.ceil(target / 40);
            const timer = setInterval(() => {
                count += step;
                if (count >= target) { count = target; clearInterval(timer); }
                counter.textContent = count;
            }, 50);
        });
        // Also fetch live stats from API
        fetchPortfolioStats();
    }
}, { threshold: 0.5 });

const statsBar = document.querySelector('.stats-bar');
if (statsBar) counterObserver.observe(statsBar);

async function fetchPortfolioStats() {
    try {
        const res = await apiFetch('/portfolio/stats');
        const data = await res.json();
        if (data.totalMessages !== undefined) {
            document.getElementById('dashMessages')?.textContent !== undefined &&
                (document.getElementById('dashMessages').textContent = data.totalMessages);
        }
    } catch {}
}

/* ===== SKILL BAR ANIMATION ===== */
const skillFills = document.querySelectorAll('.skill-fill');
let skillsAnimated = false;

const skillsObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !skillsAnimated) {
        skillsAnimated = true;
        skillFills.forEach((bar, i) => {
            setTimeout(() => {
                bar.style.width = bar.getAttribute('data-width') + '%';
            }, i * 100);
        });
    }
}, { threshold: 0.3 });

const skillsSection = document.getElementById('skills');
if (skillsSection) skillsObserver.observe(skillsSection);

/* ===== PROJECT FILTER ===== */
const filterBtns = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.getAttribute('data-filter');
        projectCards.forEach(card => {
            const cat = card.getAttribute('data-category');
            if (filter === 'all' || cat === filter) {
                card.classList.remove('hidden');
            } else {
                card.classList.add('hidden');
            }
        });
    });
});

/* ===== FOOTER YEAR ===== */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ===== TOAST NOTIFICATION ===== */
const toastEl = document.getElementById('toast');

function showToast(message, type = 'success') {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.className = `toast show ${type}`;
    setTimeout(() => { toastEl.className = 'toast'; }, 3000);
}

/* ===== API FETCH HELPER ===== */
async function apiFetch(endpoint, options = {}) {
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    if (authToken) headers['Authorization'] = 'Bearer ' + authToken;
    return fetch(API_BASE + endpoint, { ...options, headers });
}

/* ===== AUTH MODAL ===== */
const authModal    = document.getElementById('authModal');
const openLoginBtn = document.getElementById('openLoginBtn');
const closeModal   = document.getElementById('closeModal');
const modalTabs    = document.querySelectorAll('.modal-tab');
const loginTab     = document.getElementById('loginTab');
const registerTab  = document.getElementById('registerTab');

openLoginBtn?.addEventListener('click', () => authModal.classList.add('open'));
closeModal?.addEventListener('click', () => authModal.classList.remove('open'));
authModal?.addEventListener('click', (e) => { if (e.target === authModal) authModal.classList.remove('open'); });

modalTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        modalTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const tabName = tab.getAttribute('data-tab');
        loginTab.classList.remove('active');
        registerTab.classList.remove('active');
        document.getElementById(tabName + 'Tab').classList.add('active');
    });
});

/* ===== LOGIN FORM ===== */
const loginForm   = document.getElementById('loginForm');
const loginStatus = document.getElementById('loginStatus');

loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginStatus.textContent = 'Signing in...';
    loginStatus.className = 'auth-status';

    try {
        const res = await apiFetch('/auth/login', {
            method: 'POST',
            body: JSON.stringify({
                email: document.getElementById('loginEmail').value,
                password: document.getElementById('loginPassword').value
            })
        });
        const data = await res.json();

        if (res.ok) {
            authToken = data.token;
            localStorage.setItem('portfolio_token', authToken);
            currentUser = { username: data.username, email: data.email };
            loginStatus.textContent = 'Login successful!';
            loginStatus.className = 'auth-status success';
            setTimeout(() => {
                authModal.classList.remove('open');
                updateAuthUI();
                showToast('Welcome back, ' + data.username + '!');
            }, 1000);
        } else {
            loginStatus.textContent = data.error || 'Login failed';
            loginStatus.className = 'auth-status error';
        }
    } catch {
        loginStatus.textContent = 'Network error. Is the server running?';
        loginStatus.className = 'auth-status error';
    }
});

/* ===== REGISTER FORM ===== */
const registerForm   = document.getElementById('registerForm');
const registerStatus = document.getElementById('registerStatus');

registerForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    registerStatus.textContent = 'Creating account...';
    registerStatus.className = 'auth-status';

    try {
        const res = await apiFetch('/auth/register', {
            method: 'POST',
            body: JSON.stringify({
                username: document.getElementById('regUsername').value,
                email: document.getElementById('regEmail').value,
                password: document.getElementById('regPassword').value
            })
        });
        const data = await res.json();

        if (res.ok) {
            authToken = data.token;
            localStorage.setItem('portfolio_token', authToken);
            currentUser = { username: data.username, email: data.email };
            registerStatus.textContent = 'Account created!';
            registerStatus.className = 'auth-status success';
            setTimeout(() => {
                authModal.classList.remove('open');
                updateAuthUI();
                showToast('Welcome, ' + data.username + '!');
            }, 1000);
        } else {
            registerStatus.textContent = data.error || 'Registration failed';
            registerStatus.className = 'auth-status error';
        }
    } catch {
        registerStatus.textContent = 'Network error. Is the server running?';
        registerStatus.className = 'auth-status error';
    }
});

/* ===== CHECK EXISTING TOKEN ===== */
async function checkExistingAuth() {
    if (!authToken) return;
    try {
        const res = await apiFetch('/auth/me');
        if (res.ok) {
            const user = await res.json();
            currentUser = user;
            updateAuthUI();
        } else {
            authToken = null;
            localStorage.removeItem('portfolio_token');
        }
    } catch {}
}

function updateAuthUI() {
    const userDashboard = document.getElementById('userDashboard');
    if (currentUser) {
        openLoginBtn.textContent = currentUser.username;
        document.getElementById('dashUsername').textContent = currentUser.username;
        document.getElementById('dashEmail').textContent = currentUser.email;
        fetchPortfolioStats().then(() => {});
    } else {
        openLoginBtn.textContent = 'Login';
        if (userDashboard) userDashboard.style.display = 'none';
    }
}

openLoginBtn?.addEventListener('click', () => {
    if (currentUser) {
        const userDashboard = document.getElementById('userDashboard');
        if (userDashboard) {
            userDashboard.style.display = userDashboard.style.display === 'none' ? 'block' : 'none';
        }
    }
});

/* ===== LOGOUT ===== */
document.getElementById('logoutBtn')?.addEventListener('click', async () => {
    try { await apiFetch('/auth/logout', { method: 'POST' }); } catch {}
    authToken = null;
    currentUser = null;
    localStorage.removeItem('portfolio_token');
    document.getElementById('userDashboard').style.display = 'none';
    openLoginBtn.textContent = 'Login';
    showToast('Logged out successfully');
});

document.getElementById('closeDashboard')?.addEventListener('click', () => {
    document.getElementById('userDashboard').style.display = 'none';
});

/* ===== DASHBOARD STATS ===== */
async function loadDashboardStats() {
    try {
        const res = await apiFetch('/portfolio/stats');
        if (res.ok) {
            const data = await res.json();
            document.getElementById('dashProjects').textContent = data.totalProjects;
            document.getElementById('dashSkills').textContent = data.totalSkills;
            document.getElementById('dashMessages').textContent = data.totalMessages;
            document.getElementById('dashExp').textContent = data.yearsExperience;
        }
    } catch {}
}

/* ===== CONTACT FORM ===== */
const contactForm       = document.getElementById('contactForm');
const submitContactBtn  = document.getElementById('submitContactBtn');
const formStatus        = document.getElementById('formStatus');

contactForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitContactBtn.disabled = true;
    submitContactBtn.innerHTML = '<span>Sending...</span><i class="fas fa-spinner fa-spin"></i>';
    formStatus.textContent = '';
    formStatus.className = 'form-status';

    try {
        const res = await apiFetch('/contact', {
            method: 'POST',
            body: JSON.stringify({
                name: document.getElementById('contactName').value,
                email: document.getElementById('contactEmail').value,
                subject: document.getElementById('contactSubject').value,
                message: document.getElementById('contactMessage').value
            })
        });
        const data = await res.json();

        if (res.ok) {
            formStatus.textContent = 'Message sent successfully! I will get back to you soon.';
            formStatus.className = 'form-status success';
            contactForm.reset();
            showToast('Message sent successfully!');
        } else {
            formStatus.textContent = data.error || 'Failed to send message.';
            formStatus.className = 'form-status error';
        }
    } catch {
        formStatus.textContent = 'Network error. Please try again.';
        formStatus.className = 'form-status error';
    } finally {
        submitContactBtn.disabled = false;
        submitContactBtn.innerHTML = '<span>Send Message</span><i class="fas fa-paper-plane"></i>';
    }
});

/* ===== AI CHATBOT ===== */
const aiFab         = document.getElementById('aiFab');
const aiChatPanel   = document.getElementById('aiChatPanel');
const aiCloseBtn    = document.getElementById('aiCloseBtn');
const aiInput       = document.getElementById('aiInput');
const aiSendBtn     = document.getElementById('aiSendBtn');
const aiChatMessages = document.getElementById('aiChatMessages');

aiFab?.addEventListener('click', () => {
    aiChatPanel.classList.toggle('open');
    if (aiChatPanel.classList.contains('open')) aiInput?.focus();
});

aiCloseBtn?.addEventListener('click', () => aiChatPanel.classList.remove('open'));

function addAiMessage(content, role = 'bot') {
    const div = document.createElement('div');
    div.className = `ai-message ${role}`;
    if (role === 'bot') {
        div.innerHTML = `
            <i class="fas fa-robot ai-avatar"></i>
            <div class="ai-bubble">${escapeHtml(content)}</div>
        `;
    } else {
        div.innerHTML = `
            <div class="ai-bubble">${escapeHtml(content)}</div>
        `;
    }
    aiChatMessages.appendChild(div);
    aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
    return div;
}

function addTypingIndicator() {
    const div = document.createElement('div');
    div.className = 'ai-message bot typing-indicator';
    div.innerHTML = `
        <i class="fas fa-robot ai-avatar"></i>
        <div class="ai-bubble">
            <div class="ai-typing"><span></span><span></span><span></span></div>
        </div>
    `;
    aiChatMessages.appendChild(div);
    aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
    return div;
}

async function sendAiMessage() {
    const message = aiInput?.value.trim();
    if (!message) return;

    addAiMessage(message, 'user');
    aiInput.value = '';
    aiSendBtn.disabled = true;

    const indicator = addTypingIndicator();

    try {
        const res = await apiFetch('/ai/chat', {
            method: 'POST',
            body: JSON.stringify({ message, context: 'Portfolio website showcasing Java Spring Boot, MySQL, and NVIDIA AI skills' })
        });
        const data = await res.json();
        indicator.remove();

        if (res.ok) {
            addAiMessage(data.reply, 'bot');
            if (data.suggestions && data.suggestions.length > 0) {
                const suggestDiv = document.createElement('div');
                suggestDiv.className = 'ai-message bot';
                suggestDiv.innerHTML = `
                    <i class="fas fa-lightbulb ai-avatar" style="color:var(--secondary)"></i>
                    <div class="ai-bubble">
                        <strong>Suggestions:</strong><br/>
                        ${data.suggestions.map(s => `• ${escapeHtml(s)}`).join('<br/>')}
                    </div>
                `;
                aiChatMessages.appendChild(suggestDiv);
                aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
            }
        } else {
            addAiMessage('Sorry, I encountered an error. Please check your NVIDIA API key in application.properties.', 'bot');
        }
    } catch {
        indicator.remove();
        addAiMessage('Network error. Make sure the Spring Boot server is running.', 'bot');
    } finally {
        aiSendBtn.disabled = false;
    }
}

aiSendBtn?.addEventListener('click', sendAiMessage);
aiInput?.addEventListener('keydown', (e) => { if (e.key === 'Enter') sendAiMessage(); });

/* ===== AI ANALYZE ===== */
const aiAnalyzeBtn = document.getElementById('aiAnalyzeBtn');
const analyzePanel = document.getElementById('analyzePanel');
const closeAnalyze = document.getElementById('closeAnalyze');
const runAnalyzeBtn = document.getElementById('runAnalyzeBtn');

aiAnalyzeBtn?.addEventListener('click', () => {
    aiChatPanel.classList.remove('open');
    analyzePanel.style.display = analyzePanel.style.display === 'none' ? 'block' : 'none';
});

closeAnalyze?.addEventListener('click', () => { analyzePanel.style.display = 'none'; });

runAnalyzeBtn?.addEventListener('click', async () => {
    const section = document.getElementById('analyzeSection').value;
    const analyzeResult = document.getElementById('analyzeResult');
    const analyzeText = document.getElementById('analyzeText');
    const improvementsList = document.getElementById('improvementsList');
    const scoreCircle = document.getElementById('scoreCircle');
    const scoreValue = document.getElementById('scoreValue');

    runAnalyzeBtn.disabled = true;
    runAnalyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
    analyzeResult.style.display = 'none';

    try {
        let contentToAnalyze = '';
        if (section === 'overall') {
            contentToAnalyze = document.body.innerText.substring(0, 6000);
        } else {
            const secEl = document.getElementById(section);
            contentToAnalyze = secEl ? secEl.innerText.substring(0, 3000) : `Portfolio section: ${section}`;
        }

        const res = await apiFetch('/ai/analyze', {
            method: 'POST',
            body: JSON.stringify({ section, content: contentToAnalyze })
        });
        const data = await res.json();

        if (res.ok) {
            analyzeResult.style.display = 'flex';
            const score = data.score || 0;
            scoreValue.textContent = score;

            const circumference = 314;
            const offset = circumference - (score / 100) * circumference;
            scoreCircle.style.transition = 'stroke-dashoffset 1.5s ease';
            setTimeout(() => { scoreCircle.style.strokeDashoffset = offset; }, 50);

            analyzeText.textContent = data.analysis;
            improvementsList.innerHTML = '';

            (data.improvements || []).forEach(imp => {
                const div = document.createElement('div');
                div.className = `improvement-item ${imp.priority || 'medium'}`;
                div.innerHTML = `
                    <div>
                        <div class="imp-area">${escapeHtml(imp.area)} — ${escapeHtml(imp.priority)}</div>
                        <div class="imp-suggestion">${escapeHtml(imp.suggestion)}</div>
                    </div>
                `;
                improvementsList.appendChild(div);
            });
        }
    } catch {
        analyzeText.textContent = 'Error: Make sure the server is running and NVIDIA API key is set.';
        analyzeResult.style.display = 'flex';
    } finally {
        runAnalyzeBtn.disabled = false;
        runAnalyzeBtn.innerHTML = '<i class="fas fa-magic"></i> Run Analysis';
    }
});

/* ===== SMOOTH SCROLL FOR NAV LINKS ===== */
document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
        const target = document.querySelector(link.getAttribute('href'));
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

/* ===== UTILITY: Escape HTML ===== */
function escapeHtml(text) {
    if (!text) return '';
    return text.toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/* ===== INITIALIZE ===== */
document.addEventListener('DOMContentLoaded', () => {
    checkExistingAuth();
});

/* ===== AI CANVAS NETWORK ===== */
const canvas = document.getElementById('aiCanvas');
if (canvas) {
    const ctx = canvas.getContext('2d');
    let width, height, particles = [];
    
    // Track mouse position
    let mouse = { x: null, y: null };
    document.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        
        // 3D HUD mouse parallax
        const core = document.querySelector('.ai-core');
        if(core) {
            const xAxis = (window.innerWidth / 2 - e.clientX) / 40;
            const yAxis = (window.innerHeight / 2 - e.clientY) / 40;
            core.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
        }
    });

    document.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });
    
    // Neural Network logic
    function initCanvas() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        particles = [];
        const nodeCount = window.innerWidth < 768 ? 40 : 80; // responsive nodes
        for(let i = 0; i < nodeCount; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.8, // slower, organic movement
                vy: (Math.random() - 0.5) * 0.8,
                radius: Math.random() * 2.5 + 1.5,
                baseRadius: Math.random() * 2.5 + 1.5
            });
        }
    }

    function drawNetwork() {
        // Deep fade effect to create glowing trails
        ctx.fillStyle = 'rgba(5, 5, 8, 0.2)'; 
        ctx.fillRect(0, 0, width, height);
        
        // Hex to RGB parser for CSS variables
        const primaryHex = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#6c63ff';
        const secHex = getComputedStyle(document.documentElement).getPropertyValue('--secondary').trim() || '#00d4aa';
        
        const parseHex = (hex) => {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : [108, 99, 255];
        };
        const rgbMain = parseHex(primaryHex);
        const rgbSec = parseHex(secHex);

        for(let i=0; i<particles.length; i++) {
            let p = particles[i];
            p.x += p.vx;
            p.y += p.vy;

            // Bounce off edges smoothly
            if(p.x < 0 || p.x > width) p.vx *= -1;
            if(p.y < 0 || p.y > height) p.vy *= -1;
            
            // Mouse Repulsion & Magnetic Interaction
            let distMouse = 9999;
            if(mouse.x != null && mouse.y != null) {
                let mouseYAdjusted = mouse.y + window.scrollY;
                let dx = p.x - mouse.x;
                let dy = p.y - mouseYAdjusted;
                distMouse = Math.hypot(dx, dy);
                
                // Repel nodes if too close
                if(distMouse < 150) {
                    let angle = Math.atan2(dy, dx);
                    let force = (150 - distMouse) / 150;
                    p.x += Math.cos(angle) * force * 2;
                    p.y += Math.sin(angle) * force * 2;
                    p.radius = p.baseRadius + (force * 3); // pulse larger
                } else {
                    p.radius = p.baseRadius;
                }
            } else {
                p.radius = p.baseRadius;
            }

            // Draw Neural Node
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = distMouse < 200 ? `rgba(${rgbSec[0]}, ${rgbSec[1]}, ${rgbSec[2]}, 0.9)` : `rgba(${rgbMain[0]}, ${rgbMain[1]}, ${rgbMain[2]}, 0.6)`;
            ctx.shadowBlur = distMouse < 200 ? 15 : 5;
            ctx.shadowColor = ctx.fillStyle;
            ctx.fill();
            ctx.shadowBlur = 0; // reset

            // Connect Synapses
            for(let j=i+1; j<particles.length; j++) {
                let p2 = particles[j];
                let dist = Math.hypot(p.x - p2.x, p.y - p2.y);
                if(dist < 180) { // Connect nodes closer together
                    let opacity = 1 - (dist/180);
                    // Nodes near mouse get secondary color synapses
                    let color = (distMouse < 200) ? rgbSec : rgbMain;
                    ctx.strokeStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${opacity * 0.5})`;
                    ctx.lineWidth = opacity * 1.5;
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                }
            }
            
            // Connect to mouse with intense laser beam
            if(mouse.x != null && mouse.y != null && distMouse < 250) {
                 let mouseYAdjusted = mouse.y + window.scrollY;
                 let opacity = 1 - (distMouse / 250);
                 ctx.strokeStyle = `rgba(${rgbSec[0]}, ${rgbSec[1]}, ${rgbSec[2]}, ${opacity * 0.8})`; 
                 ctx.lineWidth = opacity * 2;
                 ctx.beginPath();
                 ctx.moveTo(p.x, p.y);
                 ctx.lineTo(mouse.x, mouseYAdjusted);
                 ctx.stroke();
            }
        }
        requestAnimationFrame(drawNetwork);
    }
    
    window.addEventListener('resize', initCanvas);
    initCanvas();
    drawNetwork();
}

/* ===== SATELLITE NETWORK ===== */
const satCanvases = [document.getElementById('satelliteCanvasLeft'), document.getElementById('satelliteCanvasRight')];

satCanvases.forEach(satCanvas => {
    if (!satCanvas) return;
    const ctx = satCanvas.getContext('2d');
    let width, height, radius;
    let satellites = [];
    
    function initSatellites() {
        width = satCanvas.clientWidth;
        height = satCanvas.clientHeight;
        satCanvas.width = width;
        satCanvas.height = height;
        radius = Math.min(width, height) / 2;
        
        satellites = [];
        const numSats = 60;
        for(let i=0; i<numSats; i++) {
            satellites.push({
                lat: Math.random() * Math.PI - Math.PI/2,
                lon: Math.random() * Math.PI * 2,
                speed: (Math.random() - 0.5) * 0.005 + 0.005,
                color: Math.random() > 0.5 ? '#00d4aa' : '#ffffff'
            });
        }
    }

    function drawSatellites() {
        ctx.clearRect(0, 0, width, height);
        const projected = [];
        
        for(let i=0; i<satellites.length; i++) {
            let sat = satellites[i];
            sat.lon -= sat.speed; 
            
            // Spherical 3D to 2D projection
            let x3d = Math.cos(sat.lat) * Math.cos(sat.lon);
            let y3d = Math.sin(sat.lat);
            let z3d = Math.cos(sat.lat) * Math.sin(sat.lon);
            
            if (z3d > 0) { 
                let x2d = width/2 + x3d * radius * 0.98;
                let y2d = height/2 - y3d * radius * 0.98;
                projected.push({x: x2d, y: y2d});
                
                ctx.beginPath();
                ctx.arc(x2d, y2d, 2.5, 0, Math.PI*2);
                ctx.fillStyle = sat.color;
                ctx.shadowBlur = 10;
                ctx.shadowColor = sat.color;
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        }
        
        for(let i=0; i<projected.length; i++) {
            for(let j=i+1; j<projected.length; j++) {
                let p1 = projected[i];
                let p2 = projected[j];
                let dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
                
                if (dist < radius * 0.4) {
                    let opacity = 1 - (dist / (radius * 0.4));
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = `rgba(108, 99, 255, ${opacity * 0.6})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(drawSatellites);
    }
    
    initSatellites();
    drawSatellites();
    window.addEventListener('resize', initSatellites);
});

/* ===== CUSTOM CURSOR LOGIC ===== */
const cursor = document.getElementById('aiCursor');
const cursorTrail = document.getElementById('aiCursorTrail');
if (cursor && cursorTrail) {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let trailX = window.innerWidth / 2;
    let trailY = window.innerHeight / 2;
    
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        cursor.style.transform = `translate(calc(${mouseX}px - 50%), calc(${mouseY}px - 50%))`;
    });

    function animateTrail() {
        trailX += (mouseX - trailX) * 0.2;
        trailY += (mouseY - trailY) * 0.2;
        cursorTrail.style.transform = `translate(calc(${trailX}px - 50%), calc(${trailY}px - 50%))`;
        requestAnimationFrame(animateTrail);
    }
    animateTrail();

    // Add hover effect to clickable items
    const clickables = document.querySelectorAll('a, button, input, textarea, .project-card, .nav-link, .filter-btn, .ai-fab, .timeline-content ul li, .detail-item, .achievement-item, .contact-item, .skill-item, #btnInitAI');
    clickables.forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
    });
}

/* ===== 3D CARD TILT EFFECT & SPOTLIGHT ===== */
const tiltElements = document.querySelectorAll('.project-card, .skill-category, .cert-card, .achievements');

tiltElements.forEach(el => {
    // Inject spotlight element
    const spotlight = document.createElement('div');
    spotlight.className = 'card-spotlight';
    el.insertBefore(spotlight, el.firstChild);

    el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const tiltX = -(y - centerY) / 15;
        const tiltY = (x - centerX) / 15;
        
        el.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`;
        el.style.boxShadow = `0 15px 30px rgba(108, 99, 255, 0.4), inset 0 0 15px rgba(0, 212, 170, 0.2)`;
        el.style.borderColor = 'var(--secondary)';
        
        // Spotlight follow
        spotlight.style.left = `${x}px`;
        spotlight.style.top = `${y}px`;
    });
    
    el.addEventListener('mouseleave', () => {
        el.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
        el.style.boxShadow = '';
        el.style.borderColor = '';
    });
});

/* ===== AI VOICE PROTOCOL ===== */
const btnInitAI = document.getElementById('btnInitAI');
const aiOverlay = document.getElementById('aiEntranceOverlay');

if (btnInitAI && aiOverlay) {
    // Load voices proactively
    window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();

    // Fire effect on avatar click
    const avatarFace = document.getElementById('avatarFace');
    if (avatarFace) {
        avatarFace.addEventListener('click', (e) => {
            e.stopPropagation();
            const svgMask = document.querySelector('.hacker-svg-mask');
            if (svgMask) {
                svgMask.classList.remove('ignite-fire');
                void svgMask.offsetWidth; // trigger DOM reflow
                svgMask.classList.add('ignite-fire');
            }
        });
    }

    btnInitAI.addEventListener('click', () => {
        // Fade out earth and text content
        const entranceWrap = document.querySelector('.ai-entrance-content');
        if (entranceWrap) {
            entranceWrap.classList.add('fade-out');
            entranceWrap.style.pointerEvents = 'none';
        }
        
        // Trigger the falling star
        const fallingStar = document.getElementById('fallingStar');
        if (fallingStar) {
            fallingStar.classList.add('animate');
        }
        
        // Delay overlay fade out to allow the 2.5s star drop animation to complete
        setTimeout(() => {
            aiOverlay.classList.add('hidden');
        }, 2200);
        setTimeout(() => aiOverlay.remove(), 3500);
        
        // Block consecutive multiple clicks
        if (btnInitAI.tagName === 'BUTTON') btnInitAI.disabled = true;
        btnInitAI.style.pointerEvents = 'none';

        if ('speechSynthesis' in window) {
            const msg = new SpeechSynthesisUtterance();
            msg.text = "System initialized. Welcome to the neural portfolio of Kartikey Sharma. He is a highly passionate software engineer specializing in Java, Spring Boot, React, and Artificial Intelligence integrations. Please scroll down to explore his projects and skills. You can also interact with the AI assistant in the bottom right corner for any queries. Enjoy your experience.";
            msg.rate = 0.95;
            msg.pitch = 1.1;

            let voices = window.speechSynthesis.getVoices();
            // Aim for a robotic / female english voice
            let techVoice = voices.find(v => v.name.includes('Google UK English Female') || v.name.includes('Samantha') || (v.name.includes('Female') && v.lang.includes('en')));
            if(!techVoice) techVoice = voices.find(v => v.lang === 'en-US' || v.lang === 'en-GB');
            if(techVoice) msg.voice = techVoice;

            // Make hero core pulse very fast while speaking
            const coreCenter = document.querySelector('.core-center');
            if(coreCenter) {
                coreCenter.style.animation = 'pulse-core 0.2s infinite alternate';
                coreCenter.style.boxShadow = '0 0 50px var(--secondary), 0 0 100px var(--primary)';
            }
            
            const aiAvatarPopup = document.getElementById('aiAvatarPopup');
            if(aiAvatarPopup) {
                aiAvatarPopup.classList.remove('hidden');
                setTimeout(() => aiAvatarPopup.classList.add('speaking'), 100);
            }

            msg.onend = () => {
                if(coreCenter) {
                    coreCenter.style.animation = 'pulse-core 2s ease-in-out infinite alternate';
                    coreCenter.style.boxShadow = '';
                }
                if(aiAvatarPopup) {
                    aiAvatarPopup.classList.remove('speaking');
                    setTimeout(() => aiAvatarPopup.classList.add('hidden'), 2000);
                }
            };
            
            window.speechSynthesis.speak(msg);
        }
    });
}

/* ===== PERSONALITY ASSESSMENT LOGIC ===== */
const persFab = document.getElementById('personalityFab');
const persPanel = document.getElementById('personalityPanel');
const persCloseBtn = document.getElementById('persCloseBtn');
const persStartBtn = document.getElementById('persStartBtn');
const persWelcome = document.getElementById('persWelcome');
const persQuestionArea = document.getElementById('persQuestionArea');
const persResultArea = document.getElementById('persResultArea');
const persLoader = document.getElementById('persLoader');
const persQuestionGroup = document.getElementById('persQuestionGroup');
const persQuestionText = document.getElementById('persQuestionText');
const persOptions = document.getElementById('persOptions');
const persResultText = document.getElementById('persResultText');
const persChatBtn = document.getElementById('persChatBtn');

const persProgressText = document.getElementById('persProgressText');
const persProgressFill = document.getElementById('persProgressFill');

let currentQuestionIndex = 0;
let userAnswers = [];

const personalityQuestions = [
    { q: "When faced with an impossible deadline and buggy legacy code, what is your approach?", opts: ["Rewrite it completely (The Architect)", "Patch it quickly to survive (The Hacker)", "Discuss prioritization with the team (The Collaborator)", "Read docs deeply to find the root cause (The Analyst)"] },
    { q: "How do you prefer to learn a completely new tech stack?", opts: ["Build a full side-project instantly", "Read the official documentation front-to-back", "Watch a robust 10-hour tutorial course", "Read existing repositories and reverse-engineer"] },
    { q: "You discover a major bug in production caused by your teammate. What do you do?", opts: ["Fix it secretly to save their face", "Call them directly to fix it together", "Revert the commit and alert the team channel", "Log a high-priority Jira ticket and move on"] },
    { q: "What is your philosophy on code comments?", opts: ["Code should be self-documenting; zero comments.", "Comment the 'why', not the 'how'.", "Everything must have a Javadoc/Docstring.", "I add comments only when things get hacky."] },
    { q: "When architecting a new microservice, you prioritize:", opts: ["Extreme scalability and performance", "Rapid time-to-market and simplicity", "100% test coverage and absolute security", "Seamless integration with existing systems"] },
    { q: "A Junior Dev asks for help on an issue you can fix in 2 minutes. You:", opts: ["Fix it for them so they can move on", "Give them documentation links to figure it out", "Pair program and walk them through the solution", "Tell them to try for one more hour then come back"] },
    { q: "Your reaction to 'We are migrating from React to Angular':", opts: ["Excited to learn a new paradigm", "Frustrated by the unnecessary overhead", "Indifferent; UI is UI", "Concerned about the migration strategy"] },
    { q: "How do you handle scope creep during a sprint?", opts: ["Accept all changes and work weekends", "Strictly push back and protect the sprint boundary", "Negotiate trading out other low-priority tasks", "Silently ignore requests outside the ticket"] },
    { q: "Which work environment describes your ideal state?", opts: ["Deep focus in complete silence with headphones", "Lively office with constant whiteboard discussions", "Remote work from a different café every day", "Structured office hours with clear boundaries"] },
    { q: "When a library you depend on releases a major breaking change:", opts: ["Refactor your code immediately to use the latest features", "Wait 6 months until it's perfectly stable", "Ignore it until security forces an upgrade", "Create an abstraction layer to swap it safely"] },
    { q: "What drives you the most in your development career?", opts: ["Building things millions of people use", "Solving complex, intellectually hard algorithms", "Earning high compensation and financial freedom", "Mentoring others and leading a great team"] },
    { q: "How much time do you spend planning before coding?", opts: ["Days of drawing UML diagrams and flowcharts", "A brief mental outline, then straight to code", "I write tests first, the plan is the tests (TDD)", "I code a sloppy prototype, then rewrite it properly"] },
    { q: "Your opinion on Artificial Intelligence (like GitHub Copilot) writing code:", opts: ["It's the future, I use it for everything", "Helpful for boilerplate, but I write the core logic", "A security risk that writes bad unoptimized code", "It's just another autocomplete tool"] },
    { q: "If your code fails code review 3 times in a row, you feel:", opts: ["Furious at the reviewer's nitpicking", "Embarrassed that I'm underperforming", "Pumped that the reviewer is teaching me so much", "Apathetic, I just make the changes like a robot"] },
    { q: "What is your stance on Technical Debt?", opts: ["Avoid changing it if it works; don't break production", "Refactor aggressively every time I touch bad code", "Log it in a backlog that we will eventually fix", "Tech debt is normal, ship fast and break things"] },
    { q: "During daily standup, you usually:", opts: ["Give extreme technical details about my bugs", "Keep it strictly to 3 sentences (Done, Doing, Blocked)", "Use it as a time to socialize and joke", "Zone out until it's my turn to speak"] },
    { q: "When you get stuck on a bug for 4 hours, your next move is:", opts: ["Keep banging my head against the wall until 2 AM", "Take a walk outside and drink coffee", "Ask for help from a Senior Dev or StackOverflow", "Delete everything and start from scratch"] },
    { q: "How do you view Open Source contributions?", opts: ["A moral obligation for all developers", "A great way to boost my resume", "Too intimidating and complex right now", "I prefer building my personal proprietary products"] },
    { q: "Which part of the stack gives you the most anxiety?", opts: ["Centering divs and complex CSS animations", "Managing global state and React hooks", "Writing complex SQL joins and database migrations", "Configuring CI/CD pipelines and Docker clusters"] },
    { q: "Ultimately, what legacy do you want to leave?", opts: ["The creator of the cleanest architecture ever seen", "A rapid prototype hacker who built 100 startups", "A respected CTO who grew amazing engineering teams", "Someone who maintained critical systems quietly"] }
];

if(persFab && persPanel) {
    persFab.addEventListener('click', () => {
        persPanel.classList.toggle('active');
        const aiChatPanel = document.getElementById('aiChatPanel');
        if(aiChatPanel) aiChatPanel.classList.remove('active');
    });
    
    persCloseBtn.addEventListener('click', () => {
        persPanel.classList.remove('active');
    });

    persStartBtn.addEventListener('click', () => {
        persWelcome.classList.add('hidden');
        persQuestionArea.classList.remove('hidden');
        persResultArea.classList.add('hidden');
        
        currentQuestionIndex = 0;
        userAnswers = [];
        
        loadQuestion();
    });

    function loadQuestion() {
        if(currentQuestionIndex >= personalityQuestions.length) {
            finishAssessment();
            return;
        }

        const qData = personalityQuestions[currentQuestionIndex];
        
        persProgressText.innerText = `Question ${currentQuestionIndex + 1} of ${personalityQuestions.length}`;
        persProgressFill.style.width = `${((currentQuestionIndex) / personalityQuestions.length) * 100}%`;
        
        persQuestionText.innerText = qData.q;
        persOptions.innerHTML = '';
        
        const colors = ['color-red', 'color-green', 'color-blue', 'color-yellow'];
        colors.sort(() => Math.random() - 0.5);

        qData.opts.forEach((opt, idx) => {
            const btn = document.createElement('button');
            btn.className = `pers-btn ${colors[idx % 4]}`;
            btn.innerText = opt;
            btn.addEventListener('click', () => {
                userAnswers.push(`${qData.q} -> ${opt}`);
                currentQuestionIndex++;
                loadQuestion();
            });
            
            if(typeof cursor !== 'undefined') {
                btn.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
                btn.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
            }
            persOptions.appendChild(btn);
        });
    }

    function finishAssessment() {
        persProgressFill.style.width = '100%';
        persQuestionGroup.classList.add('hidden');
        runEvaluation('English');
    }

    async function runEvaluation(language) {
        persLoader.style.display = 'block';

        const joinedAnswers = userAnswers.map((a, i) => `${i+1}. ${a}`).join('\n');
        
        let languageInstruction = language === 'Hindi' 
            ? "written completely in Hindi using the Devanagari script (हिंदी भाषा). Explain clearly in Hindi." 
            : "written in English.";

        try {
            const req = await fetch('/api/ai/chat', {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify({
                     message: `I have completed a 20-question tech personality test. Here are my answers:\n${joinedAnswers}\n\nPlease analyze my developer personality type. Provide 3 specific technical/soft skills I need to improve. Ensure your ENTIRE response is ${languageInstruction} Be conversational, as if speaking back to me.`,
                     context: "Comprehensive Personality Result"
                 })
            });
            const data = await req.json();
            
            persLoader.style.display = 'none';
            persQuestionArea.classList.add('hidden');
            persResultArea.classList.remove('hidden');
            persResultText.innerText = data.reply;
            
            speakAvatar(data.reply, language);
        } catch(e) {
            persLoader.style.display = 'none';
            persQuestionArea.classList.add('hidden');
            persResultArea.classList.remove('hidden');
            persResultText.innerText = "Error completing evaluation. Please try again later.";
        }
    }

    function speakAvatar(text, language) {
        if (!('speechSynthesis' in window)) return;
        
        window.speechSynthesis.cancel();
        
        const msg = new SpeechSynthesisUtterance();
        msg.text = text;
        msg.rate = 0.95;
        
        let voices = window.speechSynthesis.getVoices();
        
        if (language === 'Hindi') {
            msg.lang = 'hi-IN';
            let hiVoice = voices.find(v => v.lang === 'hi-IN' || v.lang.includes('hi') || v.name.toLowerCase().includes('hindi') || v.name.includes('Swara') || v.name.includes('Neerja'));
            if(hiVoice) {
                msg.voice = hiVoice;
            } else {
                let indVoice = voices.find(v => v.lang === 'en-IN' || v.name.includes('India'));
                if(indVoice) msg.voice = indVoice;
            }
        } else {
            msg.lang = 'en-US';
            let enVoice = voices.find(v => v.name.includes('Google UK English Female') || v.name.includes('Samantha') || (v.name.includes('Female') && v.lang.includes('en')));
            if(enVoice) msg.voice = enVoice;
        }

        const aiAvatarPopup = document.getElementById('aiAvatarPopup');
        if(aiAvatarPopup) {
            aiAvatarPopup.classList.remove('hidden');
            setTimeout(() => aiAvatarPopup.classList.add('speaking'), 100);
        }
        
        // Stop Button Logic
        const stopBtn = document.getElementById('stopAvatarBtn');
        if(stopBtn) {
             // Reset listeners to prevent duplicates
             const newStopBtn = stopBtn.cloneNode(true);
             stopBtn.parentNode.replaceChild(newStopBtn, stopBtn);
             
             newStopBtn.addEventListener('click', () => {
                 window.speechSynthesis.cancel();
                 if(aiAvatarPopup) {
                     aiAvatarPopup.classList.remove('speaking');
                     setTimeout(() => aiAvatarPopup.classList.add('hidden'), 300);
                 }
             });
             if(typeof cursor !== 'undefined') {
                 newStopBtn.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
                 newStopBtn.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
             }
        }

        msg.onend = () => {
            if(aiAvatarPopup) {
                aiAvatarPopup.classList.remove('speaking');
                setTimeout(() => aiAvatarPopup.classList.add('hidden'), 2000);
            }
        };

        window.speechSynthesis.speak(msg);
    }

    persChatBtn.addEventListener('click', () => {
        persPanel.classList.remove('active');
        const mainChat = document.getElementById('aiChatPanel');
        if(mainChat) {
            mainChat.classList.add('active');
            const chatMessages = document.getElementById('aiChatMessages');
            if(chatMessages) {
                const div = document.createElement('div');
                div.className = 'ai-message bot';
                div.innerHTML = `<i class="fas fa-robot ai-avatar"></i><div class="ai-bubble"><strong>20-Question Profile Transfer Complete!</strong><br><br>${persResultText.innerText}<br><br>Let's discuss how you can systematically develop these recommendations. Where would you like to start?</div>`;
                chatMessages.appendChild(div);
                chatMessages.scrollTop = chatMessages.scrollHeight;
                
                const chatInput = document.getElementById('aiInput');
                if(chatInput) chatInput.focus();
            }
        }
    });
}

/* ===== GOD MODE ADMIN SYSTEM ===== */
const godModeOverlay = document.getElementById('godModeOverlay');
const godModeStatus = document.getElementById('godModeStatus');
const godModeTranscript = document.getElementById('godModeTranscript');
const godModeLoader = document.getElementById('godModeLoader');
const godModeHideBtn = document.getElementById('godModeHideBtn');

const cheatCode = "kartik@2005";
let keyBuffer = "";

document.addEventListener('keydown', (e) => {
    // Ignore keys if typing in an input or textarea
    if(e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    
    // Ignore modifier keys like Shift, Control, Alt
    if(e.key.length > 1) return;
    
    keyBuffer += e.key.toLowerCase();
    if(keyBuffer.length > cheatCode.length) {
        keyBuffer = keyBuffer.slice(keyBuffer.length - cheatCode.length);
    }
    
    console.log("God Mode Buffer: ", keyBuffer); // Debugging
    
    if(keyBuffer === cheatCode) {
        keyBuffer = "";
        activateGodMode();
    }
});

let godModeRecognition;
function activateGodMode() {
    if(godModeOverlay) godModeOverlay.classList.remove('hidden');
    godModeStatus.innerText = "Initializing audio link...";
    godModeTranscript.innerText = "Say something like: 'Change background to black' or 'Change text color to blue'";
    
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if(!SpeechRecognitionAPI) {
        godModeStatus.innerText = "Speech Recognition not supported in this browser. Please use Chrome/Edge.";
        return;
    }
    
    godModeRecognition = new SpeechRecognitionAPI();
    godModeRecognition.lang = 'en-IN'; // Works well for Hinglish/English with accent
    godModeRecognition.interimResults = false;
    godModeRecognition.maxAlternatives = 1;

    godModeRecognition.onstart = function() {
        godModeStatus.innerText = "Listening... Speak your command now.";
    };

    godModeRecognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        godModeTranscript.innerText = `"${transcript}"`;
        godModeStatus.innerText = "Target acquired. Generating DOM execution payload...";
        executeAdminCommand(transcript);
    };

    godModeRecognition.onerror = function(event) {
        godModeStatus.innerText = `Microphone Error: ${event.error}. Try again.`;
    };

    godModeRecognition.start();
}

if (godModeHideBtn) {
    godModeHideBtn.addEventListener('click', () => {
        if(godModeRecognition) {
             try { godModeRecognition.stop(); } catch(e){}
        }
        godModeOverlay.classList.add('hidden');
    });
}

async function executeAdminCommand(transcript) {
    if(godModeLoader) godModeLoader.classList.remove('hidden');
    
    try {
        const req = await fetch('/api/ai/chat', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({
                 message: `Admin command: "${transcript}". Generate pure, raw, valid JavaScript to achieve this visually. Rules:\n1. If changing text (like name), DO NOT guess IDs. Use: document.body.innerHTML = document.body.innerHTML.replace(/Kartikey Sharma/gi, 'New Name');\n2. If changing colors (background, text), use document.documentElement.style.setProperty('--bg', 'red') or document.body.style.backgroundColor.\n3. Output ONLY raw javascript code. NEVER use markdown ticks. No explanations.`,
                 context: "Admin God Mode Control"
             })
        });
        const data = await req.json();
        
        let rawReply = data.reply;
        console.log("God Mode AI Output: ", rawReply);
        
        let jsCode = rawReply;
        // Ensure we strictly extract just the JS if the AI included markdown blocks
        if (rawReply.includes('```')) {
            const match = rawReply.match(/```(?:javascript|js)?\s*([\s\S]*?)\s*```/i);
            if (match && match[1]) {
                jsCode = match[1];
            } else {
                jsCode = rawReply.replace(/```[a-z]*\n/gi, '').replace(/```/g, '');
            }
        }
        
        // Strip any residual conversational text if it starts with "Here" or similar (fallback)
        if(jsCode.toLowerCase().startsWith('here ')) {
            jsCode = jsCode.substring(jsCode.indexOf('\n') + 1);
        }

        // Dynamic Execution!
        const executeMutation = new Function(jsCode);
        executeMutation();

        godModeStatus.innerText = "Admin Protocol executed successfully.";
        
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const msg = new SpeechSynthesisUtterance("Admin protocol executed successfully.");
            msg.rate = 1.1; 
            msg.pitch = 0.8; // Matrix style lower pitch
            
            let enVoice = window.speechSynthesis.getVoices().find(v => v.name.includes('Google UK English') || v.name.includes('Female'));
            if(enVoice) msg.voice = enVoice;
            window.speechSynthesis.speak(msg);
        }

    } catch (e) {
        console.error("God Mode Exec Error: ", e);
        godModeStatus.innerText = `Execution failed: ${e.message}`;
    } finally {
        if(godModeLoader) godModeLoader.classList.add('hidden');
        setTimeout(() => {
            if(godModeOverlay && !godModeOverlay.classList.contains('hidden')) {
                godModeOverlay.classList.add('hidden');
            }
        }, 6000);
    }
}

/* ===== VOICE CHAT PROTOCOL ===== */
const voiceFab = document.getElementById('voiceFab');
let voiceChatRecognition = null;
let voiceChatHistory = []; // maintain memory for contextual chat

if (voiceFab) {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognitionAPI) {
        voiceChatRecognition = new SpeechRecognitionAPI();
        // Allow Hindi / Hinglish since user might speak in Hindi
        voiceChatRecognition.lang = 'hi-IN';
        voiceChatRecognition.interimResults = false;
        voiceChatRecognition.maxAlternatives = 1;

        voiceFab.addEventListener('click', () => {
            if (voiceFab.classList.contains('listening')) {
                voiceChatRecognition.stop();
                voiceFab.classList.remove('listening');
                voiceFab.innerHTML = '<i class="fas fa-microphone"></i> Talk to AI Avatar (Voice Connect)';
                return;
            }

            voiceFab.classList.add('listening');
            voiceFab.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Listening... Speak now';

            
            const aiAvatarPopup = document.getElementById('aiAvatarPopup');
            if (aiAvatarPopup) {
                aiAvatarPopup.classList.remove('hidden');
                const subtitle = document.querySelector('.ai-subtitle');
                if(subtitle) subtitle.innerText = "Listening... Speak now";
            }
            
            try {
                window.speechSynthesis.cancel();
                voiceChatRecognition.start();
            } catch (e) {}
        });

        voiceChatRecognition.onresult = async function(event) {
            voiceFab.classList.remove('listening');
            voiceFab.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Processing...';
            const transcript = event.results[0][0].transcript;

            
            const aiAvatarPopup = document.getElementById('aiAvatarPopup');
            if (aiAvatarPopup) {
                const subtitle = document.querySelector('.ai-subtitle');
                if(subtitle) subtitle.innerHTML = `Processing...`;
            }

            // Build dynamic context with conversation history
            let historyStr = voiceChatHistory.map(m => (m.role === 'user' ? 'User: ' : 'Avatar: ') + m.text).join('\n');
            let fullContext = "You are the smart 3D voice avatar of Kartikey Sharma's portfolio. Respond concisely and conversationally in the same language the user spoke (Hindi or English). Do NOT output markdown code, output pure spoken language text. Be friendly and conversational.\n\nConversation History:\n" + historyStr;
            
            voiceChatHistory.push({role: 'user', text: transcript});
            if(voiceChatHistory.length > 8) voiceChatHistory.shift(); // Keep last 8 interactions

            try {
                const req = await apiFetch('/ai/chat', {
                     method: 'POST',
                     body: JSON.stringify({
                         message: transcript,
                         context: fullContext
                     })
                });
                const data = await req.json();

                if (req.ok && data.reply) {
                    voiceChatHistory.push({role: 'avatar', text: data.reply});
                    if(voiceChatHistory.length > 8) voiceChatHistory.shift();

                    if (aiAvatarPopup) {
                        const subtitle = document.querySelector('.ai-subtitle');
                        if(subtitle) subtitle.innerText = "AI Protocol Active...";
                    }
                    voiceFab.innerHTML = '<i class="fas fa-microphone"></i> Talk to AI Avatar (Voice Connect)';
                    speakVoiceAvatar(data.reply);
                } else {
                    throw new Error(data.error || "Failed to get AI response");
                }
            } catch (e) {

                voiceFab.innerHTML = '<i class="fas fa-exclamation-triangle"></i> AI Offline';
                setTimeout(() => { voiceFab.innerHTML = '<i class="fas fa-microphone"></i> Talk to AI Avatar (Voice Connect)'; }, 3000);
                if (aiAvatarPopup) {
                    const subtitle = document.querySelector('.ai-subtitle');
                    if(subtitle) subtitle.innerText = "Connection error...";
                    setTimeout(() => aiAvatarPopup.classList.add('hidden'), 2000);
                }
            }
        };

        voiceChatRecognition.onerror = function(event) {
            voiceFab.classList.remove('listening');
            voiceFab.innerHTML = '<i class="fas fa-microphone-slash"></i> Microphone Error';
            setTimeout(() => { voiceFab.innerHTML = '<i class="fas fa-microphone"></i> Talk to AI Avatar (Voice Connect)'; }, 3000);
            const aiAvatarPopup = document.getElementById('aiAvatarPopup');
            if (aiAvatarPopup) {
                const subtitle = document.querySelector('.ai-subtitle');
                if(subtitle) subtitle.innerText = "Microphone error";
                setTimeout(() => aiAvatarPopup.classList.add('hidden'), 2000);
            }
        };
        
        if(typeof cursor !== 'undefined' && cursor) {
            voiceFab.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
            voiceFab.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
        }

    } else {
        voiceFab.addEventListener('click', () => {
             alert('Speech Recognition not supported in this browser. Please use Chrome/Edge.');
        });
    }
}

function speakVoiceAvatar(text) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    
    const msg = new SpeechSynthesisUtterance();
    msg.text = text;
    msg.rate = 0.95;
    
    // Determine language by checking Hindi characters
    const isHindi = /[\u0900-\u097F]/.test(text);
    let voices = window.speechSynthesis.getVoices();
    
    if (isHindi) {
        msg.lang = 'hi-IN';
        let hiVoice = voices.find(v => v.lang === 'hi-IN' || v.lang.includes('hi') || v.name.toLowerCase().includes('hindi') || v.name.includes('Swara') || v.name.includes('Neerja'));
        if(hiVoice) {
            msg.voice = hiVoice;
        } else {
            let indVoice = voices.find(v => v.lang === 'en-IN' || v.name.includes('India'));
            if(indVoice) msg.voice = indVoice;
        }
    } else {
        msg.lang = 'en-US';
        let enVoice = voices.find(v => v.name.includes('Google UK English Male') || v.name.includes('Alex') || v.name.includes('David') || v.name.includes('Daniel') || (v.name.includes('Male') && v.lang.includes('en')));
        if(enVoice) msg.voice = enVoice;
    }

    const aiAvatarPopup = document.getElementById('aiAvatarPopup');
    if(aiAvatarPopup) {
        aiAvatarPopup.classList.remove('hidden');
        setTimeout(() => aiAvatarPopup.classList.add('speaking'), 100);
    }
    
    msg.onend = () => {
        if(aiAvatarPopup) {
            aiAvatarPopup.classList.remove('speaking');
            setTimeout(() => aiAvatarPopup.classList.add('hidden'), 2000);
        }
    };

    window.speechSynthesis.speak(msg);
}

/* ===== MANUAL AI EXPLAINER ===== */
const detailedSpeeches = {
    'about': "Hello! I am Kartikey Sharma, an aspiring Java Backend Developer from Singrauli, Madhya Pradesh. I am deeply passionate about architecting scalable, database-driven web applications. My core expertise lies in Java, Spring Boot, Servlets, and MySQL. I have a strong foundation in MVC Architecture, REST API design, and Object-Oriented Programming. Additionally, I am proficient in Frontend technologies like React. I am constantly learning, building, and seeking exciting new opportunities to grow as a software engineer.",
    
    'skills': "Let's dive into my technical arsenal! I possess advanced mastery over Core Java and Object-Oriented Principles. For backend development, I harness the power of Spring Boot, JDBC, and Servlets to build resilient REST APIs. On the database side, I am highly skilled in SQL and MySQL database management. For the frontend, I create dynamic User Interfaces using HTML, CSS, JavaScript, and React.js. My development environment is powered by tools like Git, GitHub, Eclipse, and VS Code.",
    
    'projects': "These are my proudest creations. I have engineered complex systems such as the Smart Hostel Management System and the Smart Education System using robust MVC architectures. A major highlight is my Kartik Terminal platform, a sandboxed code execution environment built with Spring Boot and Google OAuth! I have also integrated cutting-edge AI into my projects, creating a Personality Analysis Engine and a dynamic AI Assistant application. Feel free to explore the source code directly on my GitHub!",
    
    'contact': "I would absolutely love to hear from you! Whether you have a job opportunity, a collaboration idea, or just want to chat about code—use this contact form to drop me a message. My backend system will instantly notify me via email, and I will get back to you as soon as possible. Let's build something amazing together!"
};

window.explainSection = function(id) {
    if (detailedSpeeches[id]) {
        // Ensuring avatar popup is visible
        const popup = document.getElementById('aiAvatarPopup');
        if (popup) popup.classList.remove('hidden');
        
        // Let the avatar speak!
        speakVoiceAvatar(detailedSpeeches[id]);
    }
};
