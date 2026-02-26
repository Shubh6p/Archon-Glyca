// ============= 01: UI & ANIMATIONS =============
// Loader
window.addEventListener('load', () => {
    updateNavbarAuth();
    const loader = document.getElementById('loader');
    if (loader) {
        setTimeout(() => {
            loader.style.opacity = '0';
            setTimeout(() => loader.style.display = 'none', 700);
            document.body.classList.remove('preload');
        }, 1000);
    }
});

// Scroll Progress & Navbar
window.addEventListener('scroll', () => {
    const scrollProgress = document.getElementById('scrollProgress');
    const navbar = document.getElementById('navbar');
    const backToTop = document.getElementById('backToTop');

    // Progress Bar
    if (scrollProgress) {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        scrollProgress.style.width = scrolled + "%";
    }

    // Navbar
    if (navbar) {
        if (window.scrollY > 50) navbar.classList.add('nav-scrolled');
        else navbar.classList.remove('nav-scrolled');
    }

    // Back to Top
    if (backToTop) {
        if (window.scrollY > 500) backToTop.classList.add('visible');
        else backToTop.classList.remove('visible');
    }

    // Reveal Elements - REMOVED per user request
    // const reveals = document.querySelectorAll('.reveal');
    // reveals.forEach(reveal => { ... });
});

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Mobile Menu
function toggleMobileMenu() {
    document.getElementById('mobileMenu').classList.toggle('active'); // active class isn't in CSS for translation? Check CSS.
    // CSS uses translateX on .mobile-menu but ID is mobileMenu.
    // Wait, the template CSS has `.mobile-menu` class for transform? 
    // In contact-us/index.html: 
    /* .mobile-menu { transform: translateX(100%); ... } .mobile-menu.active { ... } */
    // But the HTML element is `<div id="mobileMenu" ... class="... -translate-x-full ...">`
    // The CSS logic in contact-us/index.html script seemed to toggle a class or style?
    // Let's stick to standard behavior.

    // Actually, in the HTML I wrote for feedback/index.html:
    // <div id="mobileMenu" class="fixed top-0 left-0 ... -translate-x-full ...">
    // So to open it, I should remove -translate-x-full or add translate-x-0.

    const menu = document.getElementById('mobileMenu');
    const hamburger = document.getElementById('hamburger');
    const backdrop = document.getElementById('menuBackdrop');

    if (menu.classList.contains('-translate-x-full')) {
        menu.classList.remove('-translate-x-full');
        // menu.classList.add('translate-x-0'); // Default is 0 if removed? No.
        menu.style.transform = 'translateX(0)';
        hamburger.classList.add('active');
        backdrop.classList.remove('hidden');
    } else {
        menu.classList.add('-translate-x-full');
        menu.style.transform = 'translateX(-100%)';
        hamburger.classList.remove('active');
        backdrop.classList.add('hidden');
    }
}


// ============= 02: RATING LOGIC =============
const ratingStars = document.querySelectorAll('.rating-stars i');
const ratingInput = document.getElementById('rating-input');

ratingStars.forEach(star => {
    star.addEventListener('click', () => {
        const value = star.getAttribute('data-value');
        ratingInput.value = value;
        updateStars(value);
    });
});

function updateStars(value) {
    ratingStars.forEach(star => {
        const starValue = star.getAttribute('data-value');
        if (starValue <= value) {
            star.classList.remove('far');
            star.classList.add('fas');
            star.classList.add('active');
            star.style.color = '#D4FF00';
        } else {
            star.classList.remove('fas');
            star.classList.add('far');
            star.classList.remove('active');
            star.style.color = '#333';
        }
    });
}


// ============= 03: FORM SUBMISSION =============
const feedbackForm = document.getElementById('feedback-form');
if (feedbackForm) {
    feedbackForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById('submit-btn');
        const btnText = document.getElementById('btn-text');
        const btnSpinner = document.getElementById('btn-spinner');
        const successMessage = document.getElementById('success-message');
        const btnIcon = document.getElementById('btn-icon');

        // Reset UI
        successMessage.classList.add('hidden');
        submitBtn.disabled = true;
        btnText.textContent = 'Sending...';
        btnSpinner.classList.remove('hidden');
        btnIcon.classList.add('hidden');
        submitBtn.classList.remove('glow-hover');

        // Collect Data
        const formData = new FormData(feedbackForm);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch('https://archon-glyca-backend.vercel.app/api/feedback/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                successMessage.classList.remove('hidden');
                feedbackForm.reset();
                updateStars(0); // Reset stars
                // Optional: Scroll to success message
                successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                alert('Error: ' + result.message);
            }
        } catch (error) {
            console.error('Error submitting feedback:', error);
            alert('Something went wrong. Please try again later.');
        } finally {
            // Restore Button
            submitBtn.disabled = false;
            btnText.textContent = 'Submit Feedback';
            btnSpinner.classList.add('hidden');
            btnIcon.classList.remove('hidden');
            submitBtn.classList.add('glow-hover');
        }
    });
}

// ============= 04: AUTH CHECK (Shared) =============
function updateNavbarAuth() {
    const desktopAuth = document.getElementById('nav-auth-section');
    const mobileDropdownAuth = document.getElementById('mobile-profile-options');
    const sidebarAuth = document.getElementById('sidebar-auth-section');
    const userId = localStorage.getItem('userId');

    const dropdownMenuHTML = `
        <a href="/profile" class="flex items-center gap-3 px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-accent hover:text-black transition-all">
            <i class="fas fa-user text-[8px]"></i> My Profile
        </a>
        <button onclick="handleLogout()" class="w-full flex items-center gap-3 px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-red-500 hover:bg-white/5 transition-all border-t border-white/5">
            <i class="fas fa-sign-out-alt text-[8px]"></i> Logout
        </button>
    `;

    const profileIconTriggerHTML = `
        <div class="relative group cursor-pointer py-2">
            <div class="w-10 h-10 rounded-full border border-accent/30 flex items-center justify-center bg-accent/5 text-accent hover:border-accent transition-all">
                <i class="fas fa-user-circle text-xl"></i>
            </div>
            <div class="hidden lg:block absolute top-full right-0 mt-2 w-48 bg-card border border-white/10 rounded-2xl shadow-2xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right z-[150]">
                ${dropdownMenuHTML}
            </div>
        </div>
    `;

    if (userId) {
        if (desktopAuth) desktopAuth.innerHTML = profileIconTriggerHTML;
        if (mobileDropdownAuth) mobileDropdownAuth.innerHTML = dropdownMenuHTML;
        if (sidebarAuth) sidebarAuth.innerHTML = '';
    } else {
        const loginBtnHTML = `<a href="/login" class="px-8 py-3 border border-accent/30 rounded-full hover:bg-accent hover:text-black text-[10px] font-bold uppercase tracking-widest transition-all">Login</a>`;
        const sidebarLoginHTML = `<a href="/login" class="block w-full py-4 text-center border border-accent/20 rounded-full text-accent font-black uppercase text-xs tracking-widest">Sign In</a>`;

        if (desktopAuth) desktopAuth.innerHTML = loginBtnHTML;
        if (mobileDropdownAuth) mobileDropdownAuth.innerHTML = `<a href="/login" class="flex items-center gap-3 px-6 py-4 text-xs font-bold uppercase tracking-widest text-white hover:bg-accent hover:text-black transition-all">Login</a>`;
        if (sidebarAuth) sidebarAuth.innerHTML = sidebarLoginHTML;
    }
}

function handleLogout() {
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    window.location.href = '/login';
}
