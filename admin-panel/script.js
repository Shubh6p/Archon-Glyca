const API_BASE = 'https://archon-glyca-backend.vercel.app/api';
let currentTab = 'feedback';
let pendingAction = null;

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    switchTab('feedback');
});

function checkAuth() {
    const token = localStorage.getItem('adminToken');
    const email = localStorage.getItem('adminEmail');

    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    document.getElementById('admin-display-email').textContent = email;
}

function logout() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminEmail');
    window.location.href = 'login.html';
}

// Reusable Fetch with Auth
async function authFetch(url, options = {}) {
    const token = localStorage.getItem('adminToken');
    const defaultHeaders = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };

    const response = await fetch(url, {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers
        }
    });

    if (response.status === 401 || response.status === 403) {
        logout();
        return;
    }

    return response;
}

// --- Tab Switching ---
function switchTab(tab) {
    currentTab = tab;

    // Update UI
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`tab-${tab}`).classList.add('active');

    document.querySelectorAll('.admin-section').forEach(sec => sec.classList.add('hidden'));
    document.getElementById(`section-${tab}`).classList.remove('hidden');

    fetchTabData();
}

async function fetchTabData() {
    const loader = document.getElementById('loader');
    if (loader) loader.style.display = 'flex';

    try {
        let endpoint = '';
        if (currentTab === 'feedback') endpoint = '/feedback/all';
        else if (currentTab === 'appointments') endpoint = '/booking/all';
        else if (currentTab === 'contacts') endpoint = '/contact/all';

        const response = await authFetch(`${API_BASE}${endpoint}`);
        if (!response) return; // authFetch handles 401/403

        const data = await response.json();

        renderData(data);
        updateStats(data);
    } catch (error) {
        console.error("Fetch Error:", error);
        showToast(`Error loading ${currentTab}`, true);
    } finally {
        if (loader) loader.style.display = 'none';
    }
}

// --- Rendering ---
function renderData(data) {
    const emptyState = document.getElementById('empty-state');
    if (data.length === 0) {
        emptyState.classList.remove('hidden');
        return;
    }
    emptyState.classList.add('hidden');

    if (currentTab === 'feedback') renderFeedback(data);
    else if (currentTab === 'appointments') renderAppointments(data);
    else if (currentTab === 'contacts') renderContacts(data);
}

function renderFeedback(feedback) {
    const tbody = document.getElementById('feedback-table-body');
    tbody.innerHTML = feedback.map(item => {
        const isLongFeedback = item.feedback.length > 150;
        const feedbackId = `fb-${item._id}`;

        return `
        <!-- Desktop Row -->
        <tr class="hidden sm:table-row border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
            <td class="p-6">
                <div class="flex flex-col">
                    <span class="font-bold uppercase text-xs tracking-wider text-white">${item.firstName} ${item.lastName}</span>
                    <span class="text-[10px] text-accent uppercase font-bold italic mt-1">${item.program}</span>
                    <span class="text-[10px] text-white/30 uppercase mt-1">${item.email}</span>
                </div>
            </td>
            <td class="p-6 max-w-md">
                <div id="${feedbackId}-text" class="text-xs text-white/60 italic leading-relaxed line-clamp-3">
                    "${item.feedback}"
                </div>
                ${isLongFeedback ? `
                    <button onclick="toggleReadMore('${feedbackId}')" id="${feedbackId}-btn" class="mt-2 text-accent text-[10px] uppercase font-bold tracking-widest hover:underline">
                        Read More
                    </button>
                ` : ''}
                <div class="mt-2 flex gap-1 text-[10px]">
                    ${'★'.repeat(item.rating)}${'☆'.repeat(5 - item.rating)}
                </div>
            </td>
            <td class="p-6">
                <div class="flex flex-col text-[10px] text-white/30 uppercase font-bold tracking-widest leading-loose">
                    <span>City: ${item.city}</span>
                    <span>Date: ${new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
            </td>
            <td class="p-6">
                <span class="status-badge status-${item.status}">${item.status}</span>
            </td>
            <td class="p-6 text-right">
                <div class="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    ${renderActionButtons(item)}
                </div>
            </td>
        </tr>

        <!-- Mobile Card -->
        <div class="sm:hidden admin-card">
            <div class="flex justify-between items-start mb-4">
                <div class="flex flex-col">
                    <span class="font-bold uppercase text-xs tracking-wider text-white">${item.firstName} ${item.lastName}</span>
                    <span class="text-[10px] text-accent uppercase font-bold italic mt-1">${item.program}</span>
                </div>
                <span class="status-badge status-${item.status}">${item.status}</span>
            </div>
            
            <div id="${feedbackId}-mobile-text" class="text-xs text-white/60 italic leading-relaxed line-clamp-3 mb-4">
                "${item.feedback}"
            </div>
            ${isLongFeedback ? `
                <button onclick="toggleReadMore('${feedbackId}', true)" id="${feedbackId}-mobile-btn" class="mb-4 text-accent text-[10px] uppercase font-bold tracking-widest">
                    Read More
                </button>
            ` : ''}

            <div class="flex items-center justify-between pt-4 border-t border-white/5">
                <div class="flex gap-1 text-[10px]">
                    ${'★'.repeat(item.rating)}${'☆'.repeat(5 - item.rating)}
                </div>
                <div class="flex gap-2">
                    ${renderActionButtons(item)}
                </div>
            </div>
        </div>
    `;
    }).join('');
}

function renderActionButtons(item) {
    return `
        ${item.status !== 'approved' ? `
            <button onclick="requestAction('approve', '${item._id}')" class="w-8 h-8 rounded-full bg-accent/10 border border-accent/20 text-accent hover:bg-accent hover:text-black transition-all flex items-center justify-center" title="Approve">
                <i class="fas fa-check text-[10px]"></i>
            </button>
        ` : ''}
        ${item.status !== 'declined' ? `
            <button onclick="requestAction('decline', '${item._id}')" class="w-8 h-8 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center" title="Decline">
                <i class="fas fa-times text-[10px]"></i>
            </button>
        ` : ''}
        ${item.status !== 'pending' ? `
            <button onclick="requestAction('reset', '${item._id}')" class="w-8 h-8 rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all flex items-center justify-center" title="Reset to Pending">
                <i class="fas fa-undo text-[10px]"></i>
            </button>
        ` : ''}
    `;
}

function toggleReadMore(id, isMobile = false) {
    const suffix = isMobile ? '-mobile' : '';
    const textEl = document.getElementById(`${id}${suffix}-text`);
    const btnEl = document.getElementById(`${id}${suffix}-btn`);

    if (textEl.classList.contains('line-clamp-3')) {
        textEl.classList.remove('line-clamp-3');
        textEl.classList.add('line-clamp-none');
        btnEl.textContent = 'Read Less';
    } else {
        textEl.classList.add('line-clamp-3');
        textEl.classList.remove('line-clamp-none');
        btnEl.textContent = 'Read More';
    }
}

function renderAppointments(appointments) {
    const tbody = document.getElementById('appointments-table-body');
    tbody.innerHTML = appointments.map(item => `
        <tr class="hidden sm:table-row border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
            <td class="p-6">
                <div class="flex flex-col">
                    <span class="font-bold uppercase text-xs tracking-wider text-white">${item.fullName}</span>
                    <span class="text-[10px] text-accent uppercase font-bold italic mt-1">${item.whatsappNumber}</span>
                </div>
            </td>
            <td class="p-6">
                <p class="text-xs text-white/60 font-bold uppercase tracking-widest leading-relaxed">${item.appointmentRegarding}</p>
            </td>
            <td class="p-6">
                <span class="text-[10px] text-white/40 uppercase font-bold tracking-widest">${item.preferredLanguage}</span>
            </td>
            <td class="p-6">
                <span class="text-[10px] text-white/40 uppercase font-bold tracking-widest">${item.date}</span>
            </td>
            <td class="p-6 text-right">
                <span class="text-[10px] text-accent uppercase font-bold italic">${item.timeSlot || 'N/A'}</span>
            </td>
        </tr>

        <div class="sm:hidden admin-card">
            <div class="flex justify-between items-start mb-2">
                <span class="font-bold uppercase text-xs tracking-wider text-white">${item.fullName}</span>
                <span class="text-[10px] text-accent uppercase font-bold italic">${item.timeSlot || 'N/A'}</span>
            </div>
            <p class="text-[10px] text-white/30 uppercase font-bold mb-4 tracking-widest">${item.whatsappNumber}</p>
            <p class="text-xs text-white/60 font-bold uppercase tracking-widest mb-4">${item.appointmentRegarding}</p>
            <div class="flex justify-between text-[10px] text-white/30 uppercase font-bold pt-4 border-t border-white/5">
                <span>${item.date}</span>
                <span>${item.preferredLanguage}</span>
            </div>
        </div>
    `).join('');
}

function renderContacts(contacts) {
    const tbody = document.getElementById('contacts-table-body');
    tbody.innerHTML = contacts.map(item => `
        <tr class="hidden sm:table-row border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
            <td class="p-6">
                <div class="flex flex-col">
                    <span class="font-bold uppercase text-xs tracking-wider text-white">${item.firstName} ${item.lastName}</span>
                    <span class="text-[10px] text-white/30 uppercase font-bold mt-1">${item.email}</span>
                    <span class="text-[10px] text-accent uppercase font-bold italic mt-1">${item.phone || ''}</span>
                </div>
            </td>
            <td class="p-6">
                <p class="text-xs text-white/80 font-bold uppercase tracking-widest">${item.subject}</p>
            </td>
            <td class="p-6 max-w-sm">
                <p class="text-xs text-white/60 italic leading-relaxed">"${item.message}"</p>
            </td>
            <td class="p-6">
                <span class="status-badge bg-white/5 text-white/60 border border-white/10 uppercase">${item.contactMethod}</span>
            </td>
            <td class="p-6 text-right">
                <span class="text-[10px] text-white/30 uppercase tracking-widest">${new Date(item.createdAt).toLocaleDateString()}</span>
            </td>
        </tr>

        <div class="sm:hidden admin-card">
            <div class="flex justify-between items-start mb-2">
                <span class="font-bold uppercase text-xs tracking-wider text-white">${item.firstName} ${item.lastName}</span>
                <span class="text-[10px] text-white/30 uppercase tracking-widest">${new Date(item.createdAt).toLocaleDateString()}</span>
            </div>
            <p class="text-xs text-white/80 font-bold uppercase tracking-widest mb-4">${item.subject}</p>
            <p class="text-xs text-white/60 italic leading-relaxed mb-4">"${item.message}"</p>
            <div class="flex justify-between items-center pt-4 border-t border-white/5">
                <span class="text-[10px] text-accent uppercase font-bold italic">${item.phone || 'No Phone'}</span>
                <span class="status-badge bg-white/5 text-white/60 border border-white/10 uppercase text-[8px]">${item.contactMethod}</span>
            </div>
        </div>
    `).join('');
}

// --- Actions & Modal ---
function requestAction(type, id) {
    pendingAction = { type, id };
    const modal = document.getElementById('confirm-modal');
    const text = document.getElementById('confirm-text');

    if (type === 'approve') {
        text.textContent = "This will make the feedback visible on the public 'Our Results' page.";
    } else if (type === 'decline') {
        text.textContent = "This will hide the feedback from the public page.";
    } else if (type === 'reset') {
        text.textContent = "This will set the status back to pending.";
    }

    modal.classList.remove('hidden');
    document.getElementById('confirm-yes-btn').onclick = executeAction;
}

function closeConfirm() {
    document.getElementById('confirm-modal').classList.add('hidden');
    pendingAction = null;
}

async function updateStatus(id, status) { // Renamed from original updateStatus to be called by the 'reset to pending' button
    try {
        const response = await authFetch(`${API_BASE}/feedback/status/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ status })
        });

        if (response && response.ok) {
            showToast(`Feedback ${status}`);
            fetchTabData(); // Changed from fetchAllFeedback()
        } else if (response) {
            showToast("Update failed", true);
        }
    } catch (error) {
        console.error("Update Error:", error);
        showToast("Network error", true);
    }
}

async function executeAction() {
    if (!pendingAction) return;

    const { type, id } = pendingAction;
    let status = '';
    if (type === 'approve') status = 'approved';
    else if (type === 'decline') status = 'declined';
    else if (type === 'reset') status = 'pending';

    try {
        const response = await authFetch(`${API_BASE}/feedback/status/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ status })
        });

        if (response && response.ok) {
            showToast(`Task successfully executed: ${status}`);
            fetchTabData();
        } else if (response) {
            showToast("Action failed", true);
        }
    } catch (error) {
        console.error("Action Error:", error);
        showToast("Network error", true);
    } finally {
        closeConfirm();
    }
}

// --- Stats & Utilities ---
function updateStats(data) {
    document.getElementById('stat-main').textContent = data.length;
    // We could add more specific stats here if needed per tab
}

function showToast(message, isError = false) {
    const toast = document.getElementById('toast');
    const msgEl = document.getElementById('toast-message');

    msgEl.textContent = message;
    if (isError) {
        msgEl.classList.add('text-red-500');
        msgEl.classList.remove('text-accent');
    } else {
        msgEl.classList.remove('text-red-500');
        msgEl.classList.add('text-accent');
    }

    toast.classList.remove('translate-y-20', 'opacity-0');
    setTimeout(() => {
        toast.classList.add('translate-y-20', 'opacity-0');
    }, 3000);
}
