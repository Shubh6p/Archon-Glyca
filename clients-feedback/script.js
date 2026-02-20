let allFeedback = [];
let currentPage = 1;
const cardsPerPage = 12;

window.addEventListener('load', () => {
    // Hide Loader
    const loader = document.getElementById('loader');
    if (loader) {
        setTimeout(() => {
            loader.style.opacity = '0';
            setTimeout(() => loader.style.display = 'none', 500);
        }, 800);
    }

    fetchApprovedFeedback();
});

// Navbar Scroll Effect
window.addEventListener('scroll', () => {
    const nav = document.getElementById('navbar');
    if (nav) {
        if (window.scrollY > 50) {
            nav.classList.add('nav-scrolled');
        } else {
            nav.classList.remove('nav-scrolled');
        }
    }
});

async function fetchApprovedFeedback() {
    const grid = document.getElementById('feedback-grid');
    const noFeedback = document.getElementById('no-feedback');

    try {
        const response = await fetch('https://archon-glyca-backend.vercel.app/api/feedback/approved');
        allFeedback = await response.json();

        if (allFeedback.length === 0) {
            noFeedback.classList.remove('hidden');
            return;
        }

        renderPage(1);
    } catch (error) {
        console.error("Fetch Error:", error);
        grid.innerHTML = `<p class="col-span-full text-center text-red-500/50 uppercase tracking-widest text-xs">Failed to load feedback. Is the server running?</p>`;
    }
}

function renderPage(page) {
    currentPage = page;
    const grid = document.getElementById('feedback-grid');
    const startIndex = (page - 1) * cardsPerPage;
    const endIndex = startIndex + cardsPerPage;
    const pageData = allFeedback.slice(startIndex, endIndex);

    grid.innerHTML = pageData.map((item, index) => `
            <div class="glass-card rounded-[2.5rem] overflow-hidden flex flex-col h-full animate-fade-in group" style="animation-delay: ${index * 100}ms">
                <div class="p-8 sm:p-10 flex-grow">
                    <!-- Top Info -->
                    <div class="flex justify-between items-start mb-2">
                        <h4 class="font-display font-bold text-2xl uppercase tracking-tighter text-white/90">${item.firstName} ${item.lastName}</h4>
                        <p class="text-[9px] text-white/20 uppercase tracking-[0.2em] mt-2 font-bold">
                            ${new Date(item.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                    </div>

                    <!-- Meta Tags -->
                    <div class="flex items-center gap-3 mb-8 flex-wrap">
                        <div class="star-rating text-sm">
                            ${'★'.repeat(item.rating)}${'☆'.repeat(5 - item.rating)}
                        </div>
                        <div class="w-1 h-1 rounded-full bg-white/10"></div>
                        <p class="text-[10px] font-bold text-accent/80 uppercase tracking-widest italic">${item.program}</p>
                        <div class="w-1 h-1 rounded-full bg-white/10 font-normal"></div>
                        <p class="text-[10px] text-white/30 uppercase tracking-widest">${item.city}</p>
                    </div>

                    <!-- Divider -->
                    <div class="h-[1px] w-full bg-white/5 mb-8"></div>

                    <!-- Content -->
                    <div class="relative">
                        <i class="fas fa-quote-left text-accent/10 text-4xl absolute -top-4 -left-2 -z-10"></i>
                        <p class="text-white/90 text-base leading-relaxed font-light">
                            ${item.feedback}
                        </p>
                    </div>
                </div>

                <!-- Bottom Accent Bar -->
                <div class="h-[6px] w-full bg-gradient-to-r from-accent/0 via-accent/40 to-accent/0 group-hover:via-accent group-hover:h-3 transition-all duration-700"></div>
            </div>
        `).join('');

    renderPagination();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderPagination() {
    const container = document.getElementById('pagination-container');
    const totalPages = Math.ceil(allFeedback.length / cardsPerPage);

    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    let buttons = `
        <button onclick="changePage(${currentPage - 1})" class="page-btn nav-btn" ${currentPage === 1 ? 'disabled' : ''}>
            <i class="fas fa-chevron-left mr-2"></i> Prev
        </button>
    `;

    for (let i = 1; i <= totalPages; i++) {
        buttons += `
            <button onclick="changePage(${i})" class="page-btn ${currentPage === i ? 'active' : ''}">
                ${i}
            </button>
        `;
    }

    buttons += `
        <button onclick="changePage(${currentPage + 1})" class="page-btn nav-btn" ${currentPage === totalPages ? 'disabled' : ''}>
            Next <i class="fas fa-chevron-right ml-2"></i>
        </button>
    `;

    container.innerHTML = buttons;
}

function changePage(page) {
    const totalPages = Math.ceil(allFeedback.length / cardsPerPage);
    if (page < 1 || page > totalPages) return;
    renderPage(page);
}
