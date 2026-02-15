// ============= OPEN PORTAL (PLACEHOLDER) =============
function openPortal() { 
    alert("Authorization Vault: Access Pending."); 
}

// ============= UPDATE NAVBAR AUTH =============
function updateNavbarAuth() {
    const authSection = document.getElementById('nav-auth-section');
    if (!authSection) return; // Guard clause for pages without nav
    
    const userId = localStorage.getItem('userId');

    if (userId) {
        authSection.innerHTML = `
            <a href="/profile" class="group relative px-8 py-3 border border-accent/30 rounded-full transition-all hover:border-accent overflow-hidden">
                <span class="relative z-10 text-[10px] font-bold uppercase tracking-widest group-hover:text-black">My Profile</span>
                <div class="absolute inset-0 bg-accent translate-y-[101%] group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
            </a>
            <button onclick="handleLogout()" class="text-[10px] font-bold uppercase tracking-widest text-white/30 hover:text-red-500 transition-all ml-2">
                Logout
            </button>
        `;
    } else {
        authSection.innerHTML = `
            <a href="/login" class="px-8 py-3 border border-accent/30 rounded-full hover:bg-accent hover:text-black transition-all text-[10px] font-bold uppercase tracking-widest">
                Login
            </a>
        `;
    }
}

// ============= HANDLE LOGOUT =============
function handleLogout() {
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    window.location.reload(); 
}

// ============= STORY MODAL FUNCTIONS =============
function openStory(name, detail, category) {
    const modal = document.getElementById('storyModal');
    const card = document.getElementById('storyCard');
    
    if (!modal || !card) return;
    
    // Update modal content
    const modalName = document.getElementById('modalName');
    const modalDetail = document.getElementById('modalDetail');
    const modalCategory = document.getElementById('modalCategory');
    
    if (modalName) modalName.innerText = `Case Study: ${name}`;
    if (modalDetail) modalDetail.innerText = detail;
    if (modalCategory) modalCategory.innerText = `Protocol: ${category}`;

    // Show modal with animation
    modal.classList.remove('opacity-0', 'pointer-events-none');
    card.classList.replace('scale-90', 'scale-100');
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
}

function closeStory() {
    const modal = document.getElementById('storyModal');
    const card = document.getElementById('storyCard');
    
    if (!modal || !card) return;
    
    // Hide modal with animation
    modal.classList.add('opacity-0', 'pointer-events-none');
    card.classList.replace('scale-100', 'scale-90');
    
    // Restore body scroll
    document.body.style.overflow = '';
}

// ============= INITIALIZE ON DOM LOAD =============
window.addEventListener('DOMContentLoaded', () => {
    // Update navbar authentication
    updateNavbarAuth();
    
    // Observe all reveal elements
    const reveals = document.querySelectorAll('.reveal');
    reveals.forEach(el => revealObserver.observe(el));
});

// ============= KEYBOARD SHORTCUTS =============
document.addEventListener('keydown', (e) => {
    // Close modals on Escape
    if (e.key === 'Escape') {
        const modal = document.getElementById('storyModal');
        if (modal && !modal.classList.contains('pointer-events-none')) {
            closeStory();
        }
        
        const mobileMenu = document.getElementById('mobileMenu');
        if (mobileMenu && mobileMenu.classList.contains('active')) {
            if (typeof toggleMobileMenu === 'function') {
                toggleMobileMenu();
            }
        }
    }
});

// ============= EXPORT FOR USE IN OTHER SCRIPTS =============
// Make functions globally available
window.renderBlogs = renderBlogs;
window.openArticle = openArticle;
window.backToHome = backToHome;
window.openPortal = openPortal;
window.updateNavbarAuth = updateNavbarAuth;
window.handleLogout = handleLogout;
window.openStory = openStory;
window.closeStory = closeStory;
window.revealObserver = revealObserver;

// Log initialization
console.log('✅ Archon Glyca - Script Loaded');
console.log('📊 Blog Articles Available:', BLOGS.length);
