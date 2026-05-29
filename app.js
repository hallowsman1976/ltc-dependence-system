/**
 * ============================================================================
 * ระบบดูแลผู้มีภาวะพึ่งพิงในชุมชน (Community Long-Term Care System)
 * Frontend Logic สมบูรณ์แบบ (Final Version + Flatpickr BE)
 * ============================================================================
 */

// ----------------------------------------------------------------------------
// 1. CONFIGURATION & STATE
// ----------------------------------------------------------------------------
// ** สำคัญมาก: ใส่ Web App URL ของคุณที่นี่ (ต้องลงท้ายด้วย /exec) **
const API_URL = "https://script.google.com/macros/s/AKfycbwegFGFsmoOYVjXIcAim-Z6A6SL7NH3N0dO4jmsQVQzIY8a4J-FdQGncRCMhD9MUSplNg/exec"; 

let currentUser = null;
let globalCareGivers = [];
let globalPatients = [];
let currentReportData = [];

// ตัวแปรสำหรับ Visit Form
let olderImageBase64 = null;
let serviceImagesBase64 = [];
let map = null;
let marker = null;
let hasAlerted8Q = false;

// ----------------------------------------------------------------------------
// 2. SYSTEM INITIALIZATION
// ----------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    checkSession();
    
    // เริ่มต้นการทำงานของ Flatpickr (ปฏิทินปี พ.ศ.)
    initThaiFlatpickr("#report-date");
    initThaiFlatpickr("#pt-birthDate");
    initThaiFlatpickr("#vf-date");
});

// ----------------------------------------------------------------------------
// 3. CORE UTILITIES
// ----------------------------------------------------------------------------
function showLoading() {
    document.getElementById('loading-overlay').classList.remove('hidden');
    document.getElementById('loading-overlay').classList.add('flex');
}

function hideLoading() {
    document.getElementById('loading-overlay').classList.add('hidden');
    document.getElementById('loading-overlay').classList.remove('flex');
}

function showAlert(icon, title, text) {
    Swal.fire({
        icon: icon, 
        title: title,
        text: text,
        confirmButtonColor: '#2563EB',
        confirmButtonText: 'ตกลง',
        fontFamily: 'Mitr'
    });
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
}

async function apiRequest(action, data = {}) {
    showLoading();
    const payload = { action: action, ...data };
    if (currentUser) payload.currentUsername = currentUser.username;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' }, 
            body: JSON.stringify(payload)
        });
        const result = await response.json();
        hideLoading();
        return result;
    } catch (error) {
        hideLoading();
        console.error("API Error:", error);
        showAlert('error', 'ข้อผิดพลาดการเชื่อมต่อ', 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ ตรวจสอบ URL หรืออินเทอร์เน็ต');
        return { success: false, message: error.message };
    }
}

// ----------------------------------------------------------------------------
// 4. AUTHENTICATION (ระบบ Login)
// ----------------------------------------------------------------------------
function checkSession() {
    const userStr = localStorage.getItem('ltc_user');
    if (userStr) {
        try {
            currentUser = JSON.parse(userStr);
            document.getElementById('desktop-user-name').textContent = currentUser.fullName;
            document.getElementById('desktop-user-role').textContent = currentUser.role === 'admin' ? 'ผู้ดูแลระบบ' : 'ผู้ดูแล (CG)';
            
            renderLayoutByRole();
            
            document.getElementById('login-page').classList.add('hidden');
            document.getElementById('app-layout').classList.remove('hidden');
            
            if (currentUser.role === 'admin') showPage('dashboard');
            else showPage('member-dashboard');
            
        } catch (e) {
            logout();
        }
    } else {
        document.getElementById('login-page').classList.remove('hidden');
        document.getElementById('app-layout').classList.add('hidden');
    }
}

async function login() {
    const usernameInput = document.getElementById('login-username').value.trim();
    const passwordInput = document.getElementById('login-password').value;

    if (!usernameInput || !passwordInput) {
        return showAlert('warning', 'แจ้งเตือน', 'กรุณากรอกชื่อผู้ใช้งานและรหัสผ่าน');
    }

    const res = await apiRequest('login', { username: usernameInput, password: passwordInput });
    
    if (res.success) {
        localStorage.setItem('ltc_user', JSON.stringify(res.user));
        checkSession();
        document.getElementById('login-username').value = '';
        document.getElementById('login-password').value = '';
    } else {
        showAlert('error', 'เข้าสู่ระบบไม่สำเร็จ', res.message);
    }
}

function logout() {
    localStorage.removeItem('ltc_user');
    currentUser = null;
    checkSession();
}

// ----------------------------------------------------------------------------
// 5. NAVIGATION & LAYOUT
// ----------------------------------------------------------------------------
const MENUS = {
    admin: [
        { id: 'dashboard', label: 'ภาพรวม', icon: 'fa-chart-pie' },
        { id: 'caregivers', label: 'ผู้ดูแล (CG)', icon: 'fa-user-nurse' },
        { id: 'patients', label: 'ผู้มีภาวะพึ่งพิง', icon: 'fa-bed-pulse' },
        { id: 'reports', label: 'รายงาน', icon: 'fa-file-lines' }
    ],
    member: [
        { id: 'member-dashboard', label: 'หน้าแรก', icon: 'fa-house' },
        { id: 'my-patients', label: 'เคสของฉัน', icon: 'fa-bed-pulse' },
        { id: 'my-profile', label: 'โปรไฟล์', icon: 'fa-user' }
    ]
};

function renderLayoutByRole() {
    if (!currentUser) return;
    const role = currentUser.role === 'admin' ? 'admin' : 'member';
    const menuItems = MENUS[role];
    
    const desktopNav = document.getElementById('desktop-nav');
    const mobileNav = document.getElementById('mobile-nav');
    
    desktopNav.innerHTML = '';
    mobileNav.innerHTML = '';
    
    menuItems.forEach(menu => {
        const dBtn = document.createElement('button');
        dBtn.className = `w-full flex items-center px-4 py-3 mb-1 rounded-xl text-gray-600 hover:bg-blue-50 hover:text-primary transition-colors focus:outline-none menu-btn menu-btn-${menu.id}`;
        dBtn.onclick = () => showPage(menu.id);
        dBtn.innerHTML = `<i class="fa-solid ${menu.icon} w-6"></i><span class="font-medium">${menu.label}</span>`;
        desktopNav.appendChild(dBtn);

        const mBtn = document.createElement('button');
        mBtn.className = `flex flex-col items-center justify-center w-full py-2 text-gray-400 hover:text-primary transition-colors focus:outline-none mobile-btn mobile-btn-${menu.id}`;
        mBtn.onclick = () => showPage(menu.id);
        mBtn.innerHTML = `<i class="fa-solid ${menu.icon} text-xl mb-1"></i><span class="text-[10px] font-medium">${menu.label}</span>`;
        mobileNav.appendChild(mBtn);
    });
}

function showPage(pageId) {
    document.querySelectorAll('.page-section').forEach(p => p.classList.add('hidden'));
    
    const targetPage = document.getElementById(`page-${pageId}`);
    if (targetPage) targetPage.classList.remove('hidden');

    document.querySelectorAll('.menu-btn').forEach(btn => {
        btn.classList.remove('bg-primary/10', 'text-primary');
        btn.classList.add('text-gray-600');
    });
    document.querySelectorAll('.mobile-btn').forEach(btn => {
        btn.classList.remove('text-primary');
        btn.classList.add('text-gray-400');
    });

    const activeDesktop = document.querySelector(`.menu-btn-${pageId}`);
    const activeMobile = document.querySelector(`.mobile-btn-${pageId}`);
    if (activeDesktop) activeDesktop.classList.add('bg-primary/10', 'text-primary');
    if (activeMobile) activeMobile.classList.add('text-primary');

    // เรียกฟังก์ชันตามหน้า
    if (pageId === 'dashboard') renderAdminDashboard();
    if (pageId === 'caregivers') renderCareGiverPage(true);
    if (pageId === 'patients') renderPatientPage(true);
    if (pageId === 'reports') fetchReport();
    
    if (pageId === 'member-dashboard') renderMemberDashboard();
    if (pageId === 'my-patients') renderMyPatients();
    if (pageId === 'my-profile') {
        document.getElementById('profile-name').innerText = currentUser.fullName;
        document.getElementById('profile-code').innerText = "รหัส: " + currentUser.caregiverCode;
    }
}

// ----------------------------------------------------------------------------
// 6. ADMIN DASHBOARD & CRUD
// ----------------------------------------------------------------------------
async function renderAdminDashboard() {
    if (currentUser?.role !== 'admin') return;
    const res = await apiRequest('getDashboardSummary');
    if (res.success) {
        document.getElementById('page-dashboard').innerHTML = `
            <h2 class="text-2xl font-bold mb-6">ภาพรวมระบบ (Dashboard)</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-blue-500">
                    <p class="text-gray-500 mb-1">ผู้ป่วยที่ดูแลทั้งหมด</p>
                    <h3 class="text-3xl font-bold text-gray-800">${res.data.totalPatients} <span class="text-sm font-normal text-gray-400">คน</span></h3>
                </div>
                <div class="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-green-500">
                    <p class="text-gray-500 mb-1">ผู้ดูแล (CG) ในระบบ</p>
                    <h3 class="text-3xl font-bold text-gray-800">${res.data.totalCareGivers} <span class="text-sm font-normal text-gray-400">คน</span></h3>
                </div>
                <div class="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-purple-500">
                    <p class="text-gray-500 mb-1">จำนวนการเยี่ยมบ้านรวม</p>
                    <h3 class="text-3xl font-bold text-gray-800">${res.data.totalVisits} <span class="text-sm font-normal text-gray-400">ครั้ง</span></h3>
                </div>
            </div>`;
    }
}

// --- Care Giver CRUD ---
async function renderCareGiverPage(forceFetch = false) {
    if (forceFetch || globalCareGivers.length === 0) {
        const res = await apiRequest('getCareGivers');
        if (res.success) globalCareGivers = res.data;
    }
    const keyword = document.getElementById('search-cg')?.value.toLowerCase() || '';
    const filteredData = globalCareGivers.filter(cg => cg.fullName.toLowerCase().includes(keyword) || cg.caregiverCode.toLowerCase().includes(keyword));

    document.getElementById('caregiver-list-container').innerHTML = renderResponsiveList(
        filteredData,
        ['รหัส', 'ชื่อ-สกุล', 'เบอร์โทร', 'สถานะ', 'จัดการ'],
        (cg) => `<div class="text-sm font-medium text-gray-900">${cg.caregiverCode}</div><div class="text-sm text-gray-900">${cg.fullName}</div><div class="text-sm text-gray-500">${cg.phone}</div><div><span class="px-2 py-1 text-xs rounded-full ${cg.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">${cg.status}</span></div>`,
        (cg) => `<div class="font-bold text-lg text-primary mb-1">${cg.fullName}</div><div class="text-sm text-gray-600 mb-2">รหัส: ${cg.caregiverCode} | โทร: ${cg.phone}</div>`,
        (cg) => `<button onclick="openCareGiverModal('${cg.caregiverCode}')" class="text-blue-500 hover:text-blue-700 bg-blue-50 p-2 rounded-lg"><i class="fa-solid fa-pen"></i></button> <button onclick="deleteCareGiver('${cg.caregiverCode}')" class="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-lg"><i class="fa-solid fa-trash"></i></button>`
    );
}

function openCareGiverModal(code = null) {
    document.getElementById('form-caregiver').reset();
    document.getElementById('cg-code').value = '';
    const authSection = document.getElementById('cg-auth-section');

    if (code) {
        document.getElementById('modal-cg-title').innerText = "แก้ไขข้อมูลผู้ดูแล";
        const cg = globalCareGivers.find(c => c.caregiverCode === code);
        if (cg) {
            document.getElementById('cg-code').value = cg.caregiverCode;
            document.getElementById('cg-fullName').value = cg.fullName;
            document.getElementById('cg-pid').value = cg.pid;
            document.getElementById('cg-phone').value = cg.phone;
            authSection.classList.add('hidden');
            document.getElementById('cg-username').required = false;
            document.getElementById('cg-password').required = false;
        }
    } else {
        document.getElementById('modal-cg-title').innerText = "เพิ่มผู้ดูแลใหม่";
        authSection.classList.remove('hidden');
        document.getElementById('cg-username').required = true;
        document.getElementById('cg-password').required = true;
    }
    document.getElementById('modal-caregiver').classList.remove('hidden');
}

async function saveCareGiver() {
    const code = document.getElementById('cg-code').value;
    const payload = { fullName: document.getElementById('cg-fullName').value, pid: document.getElementById('cg-pid').value, phone: document.getElementById('cg-phone').value };
    let action = 'updateCareGiver';
    
    if (!code) {
        action = 'createCareGiver';
        payload.username = document.getElementById('cg-username').value;
        payload.password = document.getElementById('cg-password').value;
    } else {
        payload.caregiverCode = code;
    }

    const res = await apiRequest(action, payload);
    if (res.success) {
        showAlert('success', 'สำเร็จ', res.message);
        closeModal('modal-caregiver');
        renderCareGiverPage(true);
    } else showAlert('error', 'ข้อผิดพลาด', res.message);
}

function deleteCareGiver(code) {
    Swal.fire({ title: 'ยืนยันการลบ?', text: `ลบผู้ดูแลรหัส ${code} ใช่หรือไม่?`, icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33' }).then(async (result) => {
        if (result.isConfirmed) {
            const res = await apiRequest('deleteCareGiver', { caregiverCode: code });
            if (res.success) { showAlert('success', 'สำเร็จ', res.message); renderCareGiverPage(true); }
        }
    });
}

// --- Patient CRUD ---
async function renderPatientPage(forceFetch = false) {
    if (forceFetch || globalPatients.length === 0) {
        const res = await apiRequest('getPatients');
        if (res.success) globalPatients = res.data;
        if (globalCareGivers.length === 0) {
            const cgRes = await apiRequest('getCareGivers');
            if (cgRes.success) globalCareGivers = cgRes.data;
        }
    }
    const keyword = document.getElementById('search-patient')?.value.toLowerCase() || '';
    const filteredData = globalPatients.filter(pt => pt.fullName.toLowerCase().includes(keyword) || pt.patientId.toLowerCase().includes(keyword));

    document.getElementById('patient-list-container').innerHTML = renderResponsiveList(
        filteredData,
        ['HN', 'ชื่อ-สกุล (อายุ)', 'ผู้ดูแลรับผิดชอบ', 'จัดการ'],
        (pt) => `<div class="text-sm font-medium text-gray-900">${pt.patientId}</div><div class="flex items-center gap-3"><img src="${pt.imageUrl}" class="w-10 h-10 rounded-full object-cover shadow-sm"><div><div class="text-sm font-medium text-gray-900">${pt.fullName}</div><div class="text-xs text-gray-500">อายุ ${pt.age} ปี</div></div></div><div class="text-sm text-gray-500">${pt.caregiverName !== '-' ? pt.caregiverName : '<span class="text-red-500">ยังไม่ระบุ</span>'}</div>`,
        (pt) => `<div class="flex items-center gap-4 mb-3"><img src="${pt.imageUrl}" class="w-14 h-14 rounded-full object-cover shadow"><div><div class="font-bold text-lg text-primary">${pt.fullName}</div><div class="text-sm text-gray-600">HN: ${pt.patientId} | อายุ ${pt.age} ปี</div></div></div><div class="text-sm text-gray-500 mb-2 bg-gray-50 p-2 rounded"><i class="fa-user-nurse fa-solid mr-1"></i> ผู้ดูแล: ${pt.caregiverName}</div>`,
        (pt) => `<div class="flex flex-wrap gap-2"><button onclick="renderPatientHistory('${pt.patientId}', '${pt.fullName}')" class="text-indigo-500 bg-indigo-50 px-3 py-1.5 rounded-lg text-sm"><i class="fa-solid fa-clock-rotate-left"></i></button> <button onclick="openAssignModal('${pt.patientId}', '${pt.fullName}')" class="text-orange-500 bg-orange-50 px-3 py-1.5 rounded-lg text-sm">มอบหมาย</button> <button onclick="openPatientModal('${pt.patientId}')" class="text-blue-500 bg-blue-50 px-3 py-1.5 rounded-lg"><i class="fa-solid fa-pen"></i></button> <button onclick="deletePatient('${pt.patientId}')" class="text-red-500 bg-red-50 px-3 py-1.5 rounded-lg"><i class="fa-solid fa-trash"></i></button></div>`
    );
}

function openPatientModal(id = null) {
    document.getElementById('form-patient').reset();
    document.getElementById('pt-id').value = '';
    
    if (id) {
        document.getElementById('modal-patient-title').innerText = "แก้ไขข้อมูลผู้ป่วย";
        const pt = globalPatients.find(p => p.patientId === id);
        if (pt) {
            document.getElementById('pt-id').value = pt.patientId;
            document.getElementById('pt-fullName').value = pt.fullName;
            document.getElementById('pt-pid').value = pt.pid;
            document.getElementById('pt-gender').value = pt.gender;
            document.getElementById('pt-houseNo').value = pt.houseNo;
            document.getElementById('pt-moo').value = pt.moo;
            
            // อัปเดต Flatpickr สำหรับวันเกิด
            if (pt.birthDate) {
                document.getElementById('pt-birthDate')._flatpickr.setDate(pt.birthDate.split('T')[0]);
            }
        }
    } else {
        document.getElementById('modal-patient-title').innerText = "เพิ่มผู้ป่วยใหม่";
        document.getElementById('pt-birthDate')._flatpickr.clear();
    }
    document.getElementById('modal-patient').classList.remove('hidden');
}

async function savePatient() {
    const id = document.getElementById('pt-id').value;
    const payload = { 
        fullName: document.getElementById('pt-fullName').value, 
        pid: document.getElementById('pt-pid').value, 
        birthDate: document.getElementById('pt-birthDate').value, // Flatpickr จะส่ง YYYY-MM-DD
        gender: document.getElementById('pt-gender').value, 
        houseNo: document.getElementById('pt-houseNo').value, 
        moo: document.getElementById('pt-moo').value 
    };
    let action = id ? 'updatePatient' : 'createPatient';
    if (id) payload.patientId = id;

    const res = await apiRequest(action, payload);
    if (res.success) { showAlert('success', 'สำเร็จ', res.message); closeModal('modal-patient'); renderPatientPage(true); }
    else showAlert('error', 'ข้อผิดพลาด', res.message);
}

function deletePatient(id) {
    Swal.fire({ title: 'ยืนยันการลบ?', text: `ลบ HN: ${id} ออกจากระบบ?`, icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33' }).then(async (result) => {
        if (result.isConfirmed) {
            const res = await apiRequest('deletePatient', { patientId: id });
            if (res.success) { showAlert('success', 'สำเร็จ', res.message); renderPatientPage(true); }
        }
    });
}

function openAssignModal(patientId, patientName) {
    document.getElementById('assign-patient-id').value = patientId;
    document.getElementById('assign-patient-name').innerText = patientName;
    const select = document.getElementById('assign-cg-code');
    select.innerHTML = '<option value="">-- เลือกผู้ดูแล --</option>';
    globalCareGivers.forEach(cg => select.innerHTML += `<option value="${cg.caregiverCode}">${cg.fullName} (${cg.caregiverCode})</option>`);
    document.getElementById('modal-assign').classList.remove('hidden');
}

async function saveAssignment() {
    const pId = document.getElementById('assign-patient-id').value;
    const cgCode = document.getElementById('assign-cg-code').value;
    
    // ดักจับกรณีไม่ได้เลือกผู้ดูแล
    if (!cgCode) {
        return showAlert('warning', 'แจ้งเตือน', 'กรุณาเลือกผู้ดูแล');
    }

    // ส่งข้อมูลไปหา Backend
    const res = await apiRequest('assignPatient', { patientId: pId, caregiverCode: cgCode });
    
    // ตรวจสอบผลลัพธ์
    if (res.success) { 
        showAlert('success', 'สำเร็จ', 'มอบหมายงานเรียบร้อย'); 
        closeModal('modal-assign'); 
        renderPatientPage(true); 
    } else {
        // เพิ่มส่วนนี้เพื่อแสดง Error ให้เราทราบสาเหตุที่แท้จริง
        showAlert('error', 'ข้อผิดพลาดในการมอบหมาย', res.message);
    }
}

// ----------------------------------------------------------------------------
// 7. ADMIN REPORTS & HISTORY
// ----------------------------------------------------------------------------
function toggleReportType() {
    const type = document.getElementById('report-type').value;
    document.getElementById('filter-daily').classList.toggle('hidden', type !== 'daily');
    document.getElementById('filter-monthly').classList.toggle('hidden', type === 'daily');
}

async function fetchReport() {
    const type = document.getElementById('report-type').value;
    const payload = {};
    if (type === 'daily') {
        payload.date = document.getElementById('report-date').value;
        const res = await apiRequest('getDailyReport', payload);
        if (res.success) renderReportTable(res.data);
    } else {
        const monthVal = document.getElementById('report-month').value;
        if (monthVal) { const parts = monthVal.split('-'); payload.year = parts[0]; payload.month = parts[1]; }
        const res = await apiRequest('getMonthlyReport', payload);
        if (res.success) renderReportTable(res.data);
    }
}

function renderReportTable(data) {
    currentReportData = data;
    const container = document.getElementById('report-list-container');
    if (data.length === 0) return container.innerHTML = `<div class="text-center p-10 bg-white rounded-2xl border text-gray-500">ไม่พบข้อมูล</div>`;
    
    let html = `<div class="overflow-x-auto bg-white rounded-2xl shadow-sm border border-gray-100"><table class="w-full whitespace-nowrap"><thead class="bg-gray-50 text-gray-600 text-sm"><tr><th class="px-6 py-4 text-left">วันที่เยี่ยม</th><th class="px-6 py-4 text-left">รหัสผู้ป่วย</th><th class="px-6 py-4 text-left">ชื่อผู้ป่วย</th><th class="px-6 py-4 text-left">ผู้เยี่ยม (CG)</th><th class="px-6 py-4 text-left">การประเมิน (ADL)</th></tr></thead><tbody class="divide-y divide-gray-100">`;
    data.forEach(r => { html += `<tr class="hover:bg-blue-50"><td class="px-6 py-4">${new Date(r.visitDate).toLocaleDateString('th-TH')}</td><td class="px-6 py-4 text-primary">${r.patientId}</td><td class="px-6 py-4">${r.patientName}</td><td class="px-6 py-4">${r.caregiverName}</td><td class="px-6 py-4 text-sm text-gray-600">${r.dailyActivities || '-'}</td></tr>`; });
    html += `</tbody></table></div>`;
    container.innerHTML = html;
}

function exportCSV(dataArray, filename = 'export') {
    if (!dataArray || !dataArray.length) return showAlert('warning', 'ไม่มีข้อมูล', 'ไม่มีข้อมูลสำหรับ Export');
    const headers = Object.keys(dataArray[0]);
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF" + headers.join(",") + "\r\n";
    dataArray.forEach(row => { csvContent += headers.map(header => `"${(row[header] ?? '').toString().replace(/"/g, '""')}"`).join(",") + "\r\n"; });
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `${filename}_${new Date().getTime()}.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
}

async function renderPatientHistory(patientId, patientName) {
    document.getElementById('history-patient-name').innerText = `(${patientName})`;
    showPage('patient-history');
    const container = document.getElementById('patient-history-container');
    container.innerHTML = `<div class="text-center p-8"><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div></div>`;

    const res = await apiRequest('getVisitReportByPatient', { patientId: patientId });
    if (res.success) {
        if (res.data.length === 0) return container.innerHTML = `<div class="text-center p-10 bg-white rounded-2xl border text-gray-500">ยังไม่มีประวัติการเยี่ยม</div>`;
        let html = '<div class="relative border-l-2 border-primary ml-4 space-y-6 pb-8 pt-4">';
        res.data.forEach((r) => {
            html += `<div class="relative pl-6"><div class="absolute w-4 h-4 bg-primary rounded-full -left-[9px] top-1 border-4 border-white shadow"></div><div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100"><div class="flex justify-between mb-2"><div><h4 class="font-bold text-gray-800 text-lg">ครั้งที่ ${r.visitNo}</h4><p class="text-sm text-primary">${new Date(r.visitDate).toLocaleDateString('th-TH')} (${r.startTime} - ${r.endTime})</p></div><span class="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-medium">CG: ${r.caregiverName}</span></div><div class="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-50 text-sm"><div><span class="text-gray-500 block">ความดัน:</span> ${r.systolic}/${r.diastolic} mmHg</div><div><span class="text-gray-500 block">อุณหภูมิ:</span> ${r.temperature}°C</div><div class="col-span-2"><span class="text-gray-500 block">ซึมเศร้า 9Q:</span> ${r.depression9QResult !== '-' ? r.depression9QResult : 'ไม่ได้ประเมิน'}</div><div class="col-span-2"><span class="text-gray-500 block">โน้ตเพิ่มเติม:</span> ${r.note !== '-' ? r.note : 'ไม่มีบันทึก'}</div></div></div></div>`;
        });
        container.innerHTML = html + '</div>';
    }
}

function renderResponsiveList(data, tableHeaders, tableRowFn, cardBodyFn, actionFn) {
    if (!data || data.length === 0) return `<div class="text-center p-10 bg-white rounded-2xl border border-dashed border-gray-300 text-gray-500">ไม่พบข้อมูล</div>`;
    let mobileHtml = '<div class="md:hidden space-y-4">' + data.map(item => `<div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 relative">${cardBodyFn(item)}<div class="mt-4 pt-4 border-t border-gray-50 flex justify-end">${actionFn(item)}</div></div>`).join('') + '</div>';
    let desktopHtml = `<div class="hidden md:block overflow-x-auto bg-white rounded-2xl shadow-sm border border-gray-100"><table class="w-full text-left border-collapse"><thead class="bg-slate-50 text-gray-600 text-sm border-b border-gray-100"><tr>${tableHeaders.map(th => `<th class="px-6 py-4 font-medium">${th}</th>`).join('')}</tr></thead><tbody class="divide-y divide-gray-100">${data.map(item => `<tr class="hover:bg-blue-50/50">${tableRowFn(item).split('</div>\n').filter(c => c.trim()).map(c => `<td class="px-6 py-4">${c}</div></td>`).join('')}<td class="px-6 py-4"><div class="flex justify-end gap-2">${actionFn(item)}</div></td></tr>`).join('')}</tbody></table></div>`;
    return mobileHtml + desktopHtml;
}

// ----------------------------------------------------------------------------
// 8. MEMBER PAGES & VISIT FORM
// ----------------------------------------------------------------------------
async function renderMemberDashboard() {
    if (currentUser?.role !== 'member') return;
    const resPatients = await apiRequest('getAssignedPatients');
    const resReports = await apiRequest('getVisitReports');
    if (resPatients.success) document.getElementById('member-total-patients').innerText = resPatients.data.length;
    if (resReports.success) document.getElementById('member-total-visits').innerText = resReports.data.length;
}

async function renderMyPatients() {
    const res = await apiRequest('getAssignedPatients');
    const container = document.getElementById('my-patient-list-container');
    if (res.success && res.data.length > 0) {
        container.innerHTML = res.data.map(pt => `<div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col"><div class="flex items-center gap-4 mb-4 border-b border-gray-50 pb-4"><div class="w-14 h-14 bg-blue-100 text-primary rounded-full flex items-center justify-center text-2xl"><i class="fa-solid fa-user"></i></div><div><div class="font-bold text-lg text-gray-800">${pt.fullName}</div><div class="text-sm text-gray-500">HN: ${pt.patientId}</div></div></div><div class="grid grid-cols-2 gap-3 mt-auto"><button onclick="renderPatientHistory('${pt.patientId}', '${pt.fullName}')" class="bg-indigo-50 text-indigo-600 py-2 rounded-xl text-sm font-bold"><i class="fa-solid fa-clock-rotate-left"></i> ประวัติ</button> <button onclick="openVisitForm('${pt.patientId}', '${pt.fullName}')" class="bg-primary text-white py-2 rounded-xl text-sm font-bold shadow-md shadow-blue-500/20"><i class="fa-solid fa-clipboard-user"></i> เยี่ยม</button></div></div>`).join('');
    } else container.innerHTML = `<div class="text-center p-10 bg-white rounded-2xl border text-gray-500">คุณยังไม่มีเคสที่ได้รับมอบหมาย</div>`;
}

function toggleSection(boxId, isChecked) {
    document.getElementById(boxId).classList.toggle('hidden', !isChecked);
}

async function openVisitForm(patientId, patientName) {
    document.getElementById('visit-form').reset();
    document.getElementById('vf-patient-id').value = patientId;
    document.getElementById('vf-patient-name').innerText = `(${patientName})`;
    document.getElementById('vf-cg-name').value = currentUser.fullName;
    
    // ตั้งค่าเวลาเริ่มต้นและ Flatpickr Date
    document.getElementById('vf-date')._flatpickr.setDate(new Date().toISOString().split('T')[0]);
    document.getElementById('vf-start-time').value = new Date().toTimeString().substring(0, 5);
    
    ['vital-box', 'mental-box', 'older-img-box', 'loc-box'].forEach(id => document.getElementById(id).classList.add('hidden'));
    showPage('page-visit-form');

    const res = await apiRequest('getVisitReportByPatient', { patientId: patientId });
    const nextNo = (res.success && res.data.length > 0) ? parseInt(res.data[0].visitNo) + 1 : 1;
    document.getElementById('vf-visit-no').value = nextNo;
    document.getElementById('vf-visit-no-display').value = nextNo;
}

function calculateBMI() {
    const w = parseFloat(document.getElementById('vf-weight').value);
    const h = parseFloat(document.getElementById('vf-height').value) / 100;
    const resInput = document.getElementById('vf-bmi-result');
    if (w > 0 && h > 0) {
        const bmi = (w / (h * h)).toFixed(2);
        document.getElementById('vf-bmi').value = bmi;
        if (bmi < 18.5) resInput.value = "ผอม";
        else if (bmi < 23) resInput.value = "ปกติ";
        else if (bmi < 25) resInput.value = "ท้วม";
        else if (bmi < 30) resInput.value = "อ้วน";
        else resInput.value = "อ้วนมาก";
    } else { document.getElementById('vf-bmi').value = ""; resInput.value = ""; }
}

function getCheckedValues(className) {
    const vals = Array.from(document.querySelectorAll(`.${className}:checked`)).map(cb => cb.value);
    return vals.length > 0 ? vals.join(', ') : '-';
}

// ----------------------------------------------------------------------------
// 9. MENTAL HEALTH LOGIC (2Q, 9Q, 8Q)
// ----------------------------------------------------------------------------
function toggleMentalSection(isChecked) {
    toggleSection('mental-box', isChecked);
    if (isChecked) {
        document.querySelectorAll('input[name^="q2_"]').forEach(el => el.checked = false);
        document.getElementById('display-2q-result').innerText = '-';
        document.getElementById('container-9q').classList.add('hidden');
        document.getElementById('container-8q').classList.add('hidden');
    }
}

function calculate2QResult() {
    const q1 = document.querySelector('input[name="q2_1"]:checked')?.value;
    const q2 = document.querySelector('input[name="q2_2"]:checked')?.value;
    if (q1 === undefined || q2 === undefined) return; 

    const total = parseInt(q1) + parseInt(q2);
    const resDisp = document.getElementById('display-2q-result');
    if (total === 0) {
        resDisp.innerText = "ปกติ (ไม่มีภาวะซึมเศร้า)"; resDisp.className = "font-bold text-green-600";
        document.getElementById('vf-2q-result').value = "ปกติ";
        document.getElementById('container-9q').classList.add('hidden');
        document.getElementById('container-8q').classList.add('hidden');
    } else {
        resDisp.innerText = "มีความเสี่ยง (ต้องประเมิน 9Q ต่อ)"; resDisp.className = "font-bold text-orange-500";
        document.getElementById('vf-2q-result').value = "มีความเสี่ยง";
        document.getElementById('container-9q').classList.remove('hidden');
        render9QQuestions();
    }
}

function render9QQuestions() {
    const c = document.getElementById('questions-9q');
    if (c.innerHTML) { calculate9QTotal(); return; }
    const q9 = ["เบื่อ ไม่สนใจอยากทำอะไร", "ไม่สบายใจ ซึมเศร้า ท้อแท้", "หลับยาก หรือหลับ ๆ ตื่น ๆ", "เหนื่อยง่าย หรือไม่ค่อยมีแรง", "เบื่ออาหาร หรือกินมากเกินไป", "รู้สึกไม่ดีกับตัวเอง", "สมาธิไม่ดี", "พูดช้า ทำอะไรช้าลงจนคนอื่นสังเกตเห็นได้", "คิดทำร้ายตนเอง"];
    c.innerHTML = q9.map((q, i) => `<div class="border-b border-indigo-100 pb-3"><p class="mb-2">${i+1}. ${q}</p><div class="flex gap-4"><label><input type="radio" name="q9_${i+1}" value="0" onchange="calculate9QTotal()"> ไม่มีเลย</label><label><input type="radio" name="q9_${i+1}" value="1" onchange="calculate9QTotal()"> บางวัน</label><label><input type="radio" name="q9_${i+1}" value="2" onchange="calculate9QTotal()"> บ่อย</label><label><input type="radio" name="q9_${i+1}" value="3" onchange="calculate9QTotal()"> ทุกวัน</label></div></div>`).join('');
}

function calculate9QTotal() {
    let score = 0;
    for (let i = 1; i <= 9; i++) score += parseInt(document.querySelector(`input[name="q9_${i}"]:checked`)?.value || 0);
    document.getElementById('display-9q-total').innerText = score;
    document.getElementById('vf-9q-total').value = score;
    const inter = score <= 6 ? "ไม่มีภาวะซึมเศร้า" : score <= 12 ? "ซึมเศร้าระดับน้อย" : score <= 18 ? "ซึมเศร้าระดับปานกลาง" : "ซึมเศร้าระดับรุนแรง";
    document.getElementById('display-9q-result').innerText = inter; document.getElementById('vf-9q-result').value = inter;
    if (score >= 7) { document.getElementById('container-8q').classList.remove('hidden'); render8QQuestions(); } 
    else document.getElementById('container-8q').classList.add('hidden');
}

function render8QQuestions() {
    const c = document.getElementById('questions-8q');
    if (c.innerHTML) { calculate8QTotal(); return; }
    const q8 = [{t:"คิดอยากตาย",w:1},{t:"อยากทำร้ายตัวเอง",w:2},{t:"คิดเกี่ยวกับการฆ่าตัวตาย",w:6,sub:true},{t:"มีแผนการที่จะฆ่าตัวตาย",w:8},{t:"เตรียมการทำร้ายตนเอง/ฆ่าตัวตาย",w:9},{t:"ทำให้ตนเองบาดเจ็บ แต่ไม่ตั้งใจตาย",w:4},{t:"พยายามฆ่าตัวตาย",w:10},{t:"เคยพยายามฆ่าตัวตาย",w:4}];
    c.innerHTML = q8.map((q, i) => `<div class="border-b border-rose-100 pb-3"><p class="mb-2">${i+1}. ${q.t}</p><div class="flex gap-4"><label><input type="radio" name="q8_${i+1}" value="0" onchange="calculate8QTotal()"> ไม่มี</label><label><input type="radio" name="q8_${i+1}" value="${q.w}" onchange="calculate8QTotal()"> มี</label></div>${q.sub ? `<div id="q8_3_sub" class="hidden mt-3 p-3 bg-white border border-rose-200 rounded-lg ml-4"><p class="mb-2 text-sm">คุมความอยากฆ่าตัวตายได้หรือไม่?</p><label><input type="radio" name="q8_3_control" value="ได้"> ได้</label> <label><input type="radio" name="q8_3_control" value="ไม่ได้"> ไม่ได้</label></div>` : ''}</div>`).join('');
}

function calculate8QTotal() {
    let score = 0;
    const q3 = document.querySelector('input[name="q8_3"]:checked');
    const subC = document.getElementById('q8_3_sub');
    if (q3 && q3.value !== "0") { if (subC) subC.classList.remove('hidden'); } 
    else { if (subC) subC.classList.add('hidden'); document.querySelectorAll('input[name="q8_3_control"]').forEach(el => el.checked = false); }

    for (let i = 1; i <= 8; i++) score += parseInt(document.querySelector(`input[name="q8_${i}"]:checked`)?.value || 0);
    document.getElementById('display-8q-total').innerText = score; document.getElementById('vf-8q-total').value = score;
    const inter = score === 0 ? "ไม่มีแนวโน้ม" : score <= 8 ? "แนวโน้มระดับน้อย" : score <= 16 ? "แนวโน้มระดับกลาง" : "แนวโน้มระดับรุนแรง";
    document.getElementById('display-8q-result').innerText = inter; document.getElementById('vf-8q-result').value = inter;
    
    if (score >= 9 && !hasAlerted8Q) { showAlert('warning', 'แจ้งเตือนความเสี่ยง', 'เสี่ยงต่อการฆ่าตัวตาย กรุณาประสาน จนท.'); hasAlerted8Q = true; }
    else if (score < 9) hasAlerted8Q = false;
}

function validateMentalHealthForm() {
    if (!document.getElementById('vf-mental-enable').checked) return { valid: true };
    const q1 = document.querySelector('input[name="q2_1"]:checked'); const q2 = document.querySelector('input[name="q2_2"]:checked');
    if (!q1 || !q2) return { valid: false, message: "กรุณาตอบ 2Q ให้ครบ" };
    if (parseInt(q1.value) + parseInt(q2.value) > 0) {
        for (let i = 1; i <= 9; i++) if (!document.querySelector(`input[name="q9_${i}"]:checked`)) return { valid: false, message: "ตอบ 9Q ให้ครบ" };
        if (parseInt(document.getElementById('vf-9q-total').value) >= 7) {
            for (let i = 1; i <= 8; i++) if (!document.querySelector(`input[name="q8_${i}"]:checked`)) return { valid: false, message: "ตอบ 8Q ให้ครบ" };
            if (document.querySelector('input[name="q8_3"]:checked')?.value !== "0" && !document.querySelector('input[name="q8_3_control"]:checked')) return { valid: false, message: "ตอบคำถามย่อยข้อ 3" };
        }
    }
    return { valid: true };
}

function collectMentalHealthData() {
    if (!document.getElementById('vf-mental-enable').checked) return { mentalEnabled: false, depression2QResult: '-', depression9QTotal: 0, depression9QResult: '-', suicide8QTotal: 0, suicide8QResult: '-' };
    const getVal = (name) => parseInt(document.querySelector(`input[name="${name}"]:checked`)?.value || 0);
    return {
        mentalEnabled: true,
        depression2Q1: getVal("q2_1"), depression2Q2: getVal("q2_2"), depression2QResult: document.getElementById('vf-2q-result').value || '-',
        depression9Q1: getVal("q9_1"), depression9Q2: getVal("q9_2"), depression9Q3: getVal("q9_3"), depression9Q4: getVal("q9_4"), depression9Q5: getVal("q9_5"), depression9Q6: getVal("q9_6"), depression9Q7: getVal("q9_7"), depression9Q8: getVal("q9_8"), depression9Q9: getVal("q9_9"), depression9QTotal: document.getElementById('vf-9q-total').value || 0, depression9QResult: document.getElementById('vf-9q-result').value || '-',
        suicide8Q1: getVal("q8_1"), suicide8Q2: getVal("q8_2"), suicide8Q3: getVal("q8_3"), suicide8Q3Control: document.querySelector('input[name="q8_3_control"]:checked')?.value || '-', suicide8Q4: getVal("q8_4"), suicide8Q5: getVal("q8_5"), suicide8Q6: getVal("q8_6"), suicide8Q7: getVal("q8_7"), suicide8Q8: getVal("q8_8"), suicide8QTotal: document.getElementById('vf-8q-total').value || 0, suicide8QResult: document.getElementById('vf-8q-result').value || '-'
    };
}

// ----------------------------------------------------------------------------
// 10. IMAGE UPLOAD & MAP LOGIC
// ----------------------------------------------------------------------------
async function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (e) => {
            const img = new Image(); img.src = e.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas'); const scale = Math.min(800 / img.width, 1);
                canvas.width = img.width * scale; canvas.height = img.height * scale;
                canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL('image/jpeg', 0.7));
            };
        }; reader.onerror = reject;
    });
}

async function uploadImageToServer(base64Str, prefix) {
    const res = await apiRequest('uploadImage', { base64Data: base64Str, filename: `${prefix}_${new Date().getTime()}.jpg` });
    return res.success ? res.url : null;
}

async function handleOlderImageUpload(input) {
    if (input.files && input.files[0]) {
        showLoading(); olderImageBase64 = await fileToBase64(input.files[0]);
        document.getElementById('older-img-preview').innerHTML = `<div class="relative inline-block"><img src="${olderImageBase64}" class="w-32 h-32 object-cover rounded-lg border"><button type="button" onclick="olderImageBase64=null; document.getElementById('older-img-preview').innerHTML=''; document.getElementById('input-older-img').value='';" class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6"><i class="fa-solid fa-times"></i></button></div>`;
        hideLoading();
    }
}

async function handleServiceImagesUpload(input) {
    if (input.files) {
        showLoading();
        for (let i = 0; i < input.files.length; i++) serviceImagesBase64.push(await fileToBase64(input.files[i]));
        renderServiceImagesPreview(); input.value = ""; hideLoading();
    }
}

function renderServiceImagesPreview() {
    document.getElementById('service-img-preview').innerHTML = serviceImagesBase64.map((b64, i) => `<div class="relative inline-block"><img src="${b64}" class="w-full h-24 object-cover rounded-lg border"><button type="button" onclick="serviceImagesBase64.splice(${i}, 1); renderServiceImagesPreview();" class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6"><i class="fa-solid fa-times"></i></button></div>`).join('');
}

function toggleLocationSection(isChecked) {
    toggleSection('loc-box', isChecked);
    if (isChecked) setTimeout(initLeafletMap, 300);
}

function initLeafletMap() {
    if (!document.getElementById('vf-loc-enable').checked) return;
    if (!map) {
        map = L.map('map-container').setView([13.7563, 100.5018], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
        marker = L.marker([13.7563, 100.5018], { draggable: true }).addTo(map);
        marker.on('dragend', () => { const pos = marker.getLatLng(); document.getElementById('vf-lat').value = pos.lat.toFixed(6); document.getElementById('vf-lng').value = pos.lng.toFixed(6); });
    } else setTimeout(() => { map.invalidateSize(); }, 200);
}

function getCurrentLocation() {
    if (navigator.geolocation) {
        document.getElementById('vf-lat').value = "ค้นหา...";
        navigator.geolocation.getCurrentPosition(pos => {
            const lat = pos.coords.latitude, lng = pos.coords.longitude;
            document.getElementById('vf-lat').value = lat.toFixed(6); document.getElementById('vf-lng').value = lng.toFixed(6);
            if (map && marker) { map.setView([lat, lng], 16); marker.setLatLng([lat, lng]); }
        }, () => { showAlert('warning', 'ผิดพลาด', 'ไม่สามารถดึงพิกัดได้'); document.getElementById('vf-lat').value = ""; });
    }
}

// ----------------------------------------------------------------------------
// 11. FINAL SAVE (รวบรวมส่ง Backend)
// ----------------------------------------------------------------------------
async function saveVisitReport() {
    const mentalVal = validateMentalHealthForm();
    if (!mentalVal.valid) return showAlert('warning', 'ข้อมูลไม่ครบ', mentalVal.message);
    if (serviceImagesBase64.length < 3) return showAlert('warning', 'รูปภาพไม่พอ', 'อัปโหลดรูปขณะให้บริการอย่างน้อย 3 ภาพ');
    if (document.getElementById('vf-older-img-enable').checked && !olderImageBase64) return showAlert('warning', 'แจ้งเตือน', 'กรุณาเลือกรูปผู้ป่วย หรือปิดการอัปเดตรูป');

    showLoading();
    let uploadedOlderImgUrl = "-", uploadedServiceImgUrls = [];
    try {
        if (document.getElementById('vf-older-img-enable').checked && olderImageBase64) uploadedOlderImgUrl = await uploadImageToServer(olderImageBase64, 'OLDER');
        const uploadPromises = serviceImagesBase64.map((b64, i) => uploadImageToServer(b64, `SRV_${i}`));
        uploadedServiceImgUrls = (await Promise.all(uploadPromises)).filter(url => url !== null);
    } catch (e) { hideLoading(); return showAlert('error', 'ล้มเหลว', 'ส่งรูปภาพไม่สำเร็จ'); }

    const payload = {
        patientId: document.getElementById('vf-patient-id').value, visitDate: document.getElementById('vf-date').value,
        startTime: document.getElementById('vf-start-time').value, endTime: document.getElementById('vf-end-time').value,
        caregiverCode: currentUser.caregiverCode, personName: document.getElementById('vf-person-name').value, relationship: document.getElementById('vf-relationship').value,
        weight: document.getElementById('vf-weight').value || 0, height: document.getElementById('vf-height').value || 0,
        bmi: document.getElementById('vf-bmi').value || 0, bmiResult: document.getElementById('vf-bmi-result').value || '-',
        vitalEnabled: document.getElementById('vf-vital-enable').checked, temperature: document.getElementById('vf-temp').value || 0,
        pulse: document.getElementById('vf-pulse').value || 0, respiration: document.getElementById('vf-resp').value || 0,
        systolic: document.getElementById('vf-sys').value || 0, diastolic: document.getElementById('vf-dia').value || 0,
        ...collectMentalHealthData(),
        dailyActivities: getCheckedValues('cb-adl'), healthActivities: getCheckedValues('cb-health'), note: document.getElementById('vf-note').value || '-',
        olderImageEnabled: document.getElementById('vf-older-img-enable').checked, olderImageUrl: uploadedOlderImgUrl || "-", serviceImageUrls: uploadedServiceImgUrls.join(','),
        locationEnabled: document.getElementById('vf-loc-enable').checked, latitude: document.getElementById('vf-lat').value || 0, longitude: document.getElementById('vf-lng').value || 0
    };

    const res = await apiRequest('createVisitReport', payload);
    hideLoading();
    if (res.success) {
        showAlert('success', 'สำเร็จ', 'บันทึกเยี่ยมบ้านเรียบร้อย');
        olderImageBase64 = null; serviceImagesBase64 = [];
        document.getElementById('older-img-preview').innerHTML = ''; document.getElementById('service-img-preview').innerHTML = '';
        showPage('my-patients'); 
    } else showAlert('error', 'ข้อผิดพลาด', res.message);
}

// ----------------------------------------------------------------------------
// 12. FLATPICKR (รองรับปี พ.ศ.)
// ----------------------------------------------------------------------------
function initThaiFlatpickr(selector) {
    flatpickr(selector, {
        locale: "th",
        dateFormat: "Y-m-d", // ส่งข้อมูลแบบ ค.ศ. ไปยังเซิร์ฟเวอร์
        altInput: true,
        altInputClass: "w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none bg-white",
        altFormat: "d/m/Y", // แสดงผล
        formatDate: (date, formatStr, locale) => {
            const year = date.getFullYear() + 543; // แปลงเป็น พ.ศ.
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${day}/${month}/${year}`;
        },
        onReady: function(selectedDates, dateStr, instance) { convertCalendarYearToBE(instance); },
        onYearChange: function(selectedDates, dateStr, instance) { convertCalendarYearToBE(instance); },
        onMonthChange: function(selectedDates, dateStr, instance) { convertCalendarYearToBE(instance); }
    });
}

function convertCalendarYearToBE(instance) {
    const yearElement = instance.currentYearElement;
    if (yearElement) {
        const currentYear = parseInt(yearElement.value);
        if (currentYear < 2500) { yearElement.value = currentYear + 543; }
    }
}
