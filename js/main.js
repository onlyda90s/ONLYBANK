import { auth, provider, signInWithPopup, signOut, onAuthStateChanged } from "./firebase.js";

// DOM 요소 식별
const loginScreen = document.getElementById("loginScreen");
const dashboardScreen = document.getElementById("dashboardScreen");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const userName = document.getElementById("userName");
const userAvatar = document.getElementById("userAvatar");
const inviteCodeInput = document.getElementById("inviteCodeInput");
const enterCodeBtn = document.getElementById("enterCodeBtn");

// 1. Google 로그인 & 로그아웃
if (loginBtn) {
    loginBtn.addEventListener("click", async () => {
        try { await signInWithPopup(auth, provider); } 
        catch (error) { alert("로그인 에러: " + error.message); }
    });
}
if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
        try { await signOut(auth); } catch (error) { console.error("로그아웃 실패"); }
    });
}

// 2. 초대 코드
if (enterCodeBtn) {
    enterCodeBtn.addEventListener("click", () => {
        const code = inviteCodeInput ? inviteCodeInput.value.trim() : "";
        if (!code) { alert("초대 코드를 입력해 주세요."); return; }
        alert(`[${code}] 코드로 모임 대시보드 진입을 시도합니다.`);
    });
}

// 3. 로그인 상태 감시
onAuthStateChanged(auth, (user) => {
    if (user) {
        loginScreen.style.setProperty("display", "none", "important");
        dashboardScreen.style.setProperty("display", "flex", "important");
        if (userName) userName.textContent = user.displayName || "사용자";
        if (userAvatar) userAvatar.src = user.photoURL || "https://via.placeholder.com/80";
    } else {
        loginScreen.style.setProperty("display", "flex", "important");
        dashboardScreen.style.setProperty("display", "none", "important");
    }
});

// 4. 사이드바 접기/펼치기 (Collapse) 개선
const sidebar = document.getElementById("sidebar");
const sidebarHeader = document.getElementById("sidebarHeader");
const sidebarToggleBtn = document.getElementById("sidebarToggleBtn");
const sidebarTexts = document.querySelectorAll(".sidebar-text");

if (sidebarToggleBtn && sidebar) {
    sidebarToggleBtn.addEventListener("click", () => {
        const isCollapsed = sidebar.classList.contains("w-20");
        
        if (isCollapsed) {
            // 사이드바 펼치기 (w-64)
            sidebar.classList.remove("w-20");
            sidebar.classList.add("w-64");
            if (sidebarHeader) {
                sidebarHeader.classList.remove("px-2.5");
                sidebarHeader.classList.add("px-4");
            }
            sidebarTexts.forEach(el => el.style.display = "");
            sidebarToggleBtn.textContent = "◀";
        } else {
            // 사이드바 접기 (w-20)
            sidebar.classList.remove("w-64");
            sidebar.classList.add("w-20");
            if (sidebarHeader) {
                sidebarHeader.classList.remove("px-4");
                sidebarHeader.classList.add("px-2.5");
            }
            sidebarTexts.forEach(el => el.style.display = "none");
            sidebarToggleBtn.textContent = "▶";
        }
    });
}

// 5. 메뉴 라우팅 (화면 전환)
const menuBtns = document.querySelectorAll('.menu-btn');
const viewSections = document.querySelectorAll('.view-section');
const placeholderTitle = document.getElementById('placeholder-title');

menuBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        
        menuBtns.forEach(b => {
            b.className = "menu-btn flex items-center px-3 py-2.5 rounded-xl text-brand-sub hover:bg-black/5 transition";
        });
        
        if (btn.id.includes('group')) {
            btn.className = "menu-btn flex items-center px-3 py-2.5 rounded-xl bg-brand-group text-white shadow-sm";
        } else if (btn.id === 'nav-settings') {
            btn.className = "menu-btn flex items-center px-3 py-2 mb-2 rounded-xl text-xs font-bold bg-slate-200 text-brand-ink shadow-sm";
        } else {
            btn.className = "menu-btn flex items-center px-3 py-2.5 rounded-xl bg-brand-personal text-white shadow-sm";
        }

        viewSections.forEach(section => { section.style.display = 'none'; });
        const targetViewId = btn.id.replace('nav-', 'view-');
        const targetView = document.getElementById(targetViewId);
        
        if (targetView) {
            targetView.style.display = 'block';
        } else {
            const placeholder = document.getElementById('view-placeholder');
            if (placeholderTitle) placeholderTitle.textContent = btn.textContent.trim();
            if (placeholder) placeholder.style.display = 'block';
        }
    });
});

// 6. 설정 화면 메뉴 ON/OFF 토글
const toggleConfigs = [
    { checkboxId: 'toggle-cards', liId: 'li-cards', key: 'onlybank_cfg_cards' },
    { checkboxId: 'toggle-income', liId: 'li-income', key: 'onlybank_cfg_income' },
    { checkboxId: 'toggle-vehicle', liId: 'li-vehicle', key: 'onlybank_cfg_vehicle' },
    { checkboxId: 'toggle-tax', liId: 'li-tax', key: 'onlybank_cfg_tax' }
];

toggleConfigs.forEach(item => {
    const checkbox = document.getElementById(item.checkboxId);
    const liElement = document.getElementById(item.liId);

    const savedState = localStorage.getItem(item.key);
    if (savedState !== null && checkbox) {
        checkbox.checked = (savedState === 'true');
    }

    const updateVisibility = () => {
        if (!liElement || !checkbox) return;
        if (checkbox.checked) {
            liElement.style.setProperty("display", "block", "important");
        } else {
            liElement.style.setProperty("display", "none", "important");
        }
    };

    updateVisibility();

    if (checkbox) {
        checkbox.addEventListener('change', () => {
            localStorage.setItem(item.key, checkbox.checked);
            updateVisibility();
        });
    }
});

// 7. 엑셀 다운로드 (기본 형태 유지)
const exportCsvBtn = document.getElementById('exportCsvBtn');
if (exportCsvBtn) {
    exportCsvBtn.addEventListener('click', () => {
        const csvContent = "data:text/csv;charset=utf-8,\uFEFF날짜,구분,카테고리,결제수단,금액,메모\n"
            + "2026-11-01,수입,급여,우리은행,3000000,11월 급여\n"
            + "2026-11-02,지출,식비,신한카드,15000,점심식사";
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "onlybank_backup.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
}
