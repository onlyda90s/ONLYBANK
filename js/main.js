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

// 1. Google 로그인
if (loginBtn) {
    loginBtn.addEventListener("click", async () => {
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Google 로그인 실패:", error);
            alert(`로그인 오류: ${error.message}`);
        }
    });
}

// 2. 로그아웃
if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("로그아웃 실패:", error);
        }
    });
}

// 3. 초대 코드
if (enterCodeBtn) {
    enterCodeBtn.addEventListener("click", () => {
        const code = inviteCodeInput ? inviteCodeInput.value.trim() : "";
        if (!code) {
            alert("초대 코드를 입력해 주세요.");
            return;
        }
        alert(`[${code}] 코드로 모임 권한을 확인합니다.`);
    });
}

// 4. 인증 상태 감시
onAuthStateChanged(auth, (user) => {
    if (user) {
        if (loginScreen) loginScreen.style.setProperty("display", "none", "important");
        if (dashboardScreen) dashboardScreen.style.setProperty("display", "flex", "important");
        if (userName) userName.textContent = user.displayName || "사용자";
        if (userAvatar && user.photoURL) userAvatar.src = user.photoURL;
    } else {
        if (loginScreen) loginScreen.style.setProperty("display", "flex", "important");
        if (dashboardScreen) dashboardScreen.style.setProperty("display", "none", "important");
    }
});

// 5. 사이드바 접기/펼치기
const sidebar = document.getElementById("sidebar");
const sidebarToggleBtn = document.getElementById("sidebarToggleBtn");
const sidebarTexts = document.querySelectorAll(".sidebar-text");

if (sidebarToggleBtn && sidebar) {
    sidebarToggleBtn.addEventListener("click", () => {
        const isCollapsed = sidebar.classList.contains("w-20");
        if (isCollapsed) {
            sidebar.classList.remove("w-20");
            sidebar.classList.add("w-64");
            sidebarTexts.forEach(el => el.style.setProperty("display", "", ""));
            sidebarToggleBtn.textContent = "◀";
        } else {
            sidebar.classList.remove("w-64");
            sidebar.classList.add("w-20");
            sidebarTexts.forEach(el => el.style.setProperty("display", "none", "important"));
            sidebarToggleBtn.textContent = "▶";
        }
    });
}

// 6. 메뉴 라우팅
const menuBtns = document.querySelectorAll('.menu-btn');
const viewSections = document.querySelectorAll('.view-section');
const placeholderTitle = document.getElementById('placeholder-title');

menuBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        
        menuBtns.forEach(b => {
            if (b.id === 'nav-settings') {
                b.className = "menu-btn flex items-center px-3 py-2 mb-2 rounded-xl text-xs font-medium text-brand-sub hover:text-brand-ink hover:bg-black/[0.03] transition-colors";
            } else if (b.id === 'nav-add-group') {
                b.className = "menu-btn flex items-center px-3 py-2.5 rounded-xl text-brand-group hover:bg-brand-group/5 transition-colors text-[13px]";
            } else {
                b.className = "menu-btn flex items-center px-3 py-2.5 rounded-xl text-brand-sub hover:text-brand-ink hover:bg-black/[0.03] transition-colors text-[13px]";
            }
        });
        
        if (btn.id.includes('group')) {
            btn.className = "menu-btn flex items-center px-3 py-2.5 rounded-xl bg-brand-group text-white shadow-sm font-semibold text-[13px]";
        } else if (btn.id === 'nav-settings') {
            btn.className = "menu-btn flex items-center px-3 py-2 mb-2 rounded-xl text-xs bg-slate-200 text-brand-ink shadow-sm font-semibold";
        } else {
            btn.className = "menu-btn flex items-center px-3 py-2.5 rounded-xl bg-brand-personal text-white shadow-sm font-semibold text-[13px]";
        }

        viewSections.forEach(section => { section.style.display = 'none'; });
        const targetViewId = btn.id.replace('nav-', 'view-');
        const targetView = document.getElementById(targetViewId);
        
        if (targetView) {
            targetView.style.display = 'block';
        } else {
            const placeholder = document.getElementById('view-placeholder');
            const menuName = btn.querySelector('.sidebar-text') ? btn.querySelector('.sidebar-text').textContent.trim() : btn.textContent.trim();
            if (placeholderTitle) placeholderTitle.textContent = menuName;
            if (placeholder) placeholder.style.display = 'block';
        }
    });
});

// ==========================================
// ★ 7. 연간 리포트 상단 연도 컨트롤러
// ==========================================
let currentYear = 2026;
const currentYearDisplay = document.getElementById("currentYearDisplay");
const accumYearDisplay = document.getElementById("accumYearDisplay");
const prevYearBtn = document.getElementById("prevYearBtn");
const nextYearBtn = document.getElementById("nextYearBtn");

const updateYearDisplay = () => {
    if (currentYearDisplay) currentYearDisplay.textContent = `${currentYear}년`;
    if (accumYearDisplay) accumYearDisplay.textContent = `(${currentYear}년)`;
};

if (prevYearBtn) {
    prevYearBtn.addEventListener("click", () => {
        currentYear--;
        updateYearDisplay();
    });
}

if (nextYearBtn) {
    nextYearBtn.addEventListener("click", () => {
        currentYear++;
        updateYearDisplay();
    });
}

// ==========================================
// ★ 8. 하단 위젯 바로가기 라우팅
// ==========================================
// D-Day 항목 클릭 시 해당 페이지로 전환
const ddayItems = document.querySelectorAll(".dday-item");
ddayItems.forEach(item => {
    item.addEventListener("click", () => {
        const targetNavId = item.getAttribute("data-goto");
        const targetBtn = document.getElementById(targetNavId);
        if (targetBtn) targetBtn.click();
    });
});

// 내 모임 요약 타일 클릭 시 대학 동기계 화면으로 전환
const summaryMoimTile = document.getElementById("summary-moimTile" || "summary-moim-tile");
if (summaryMoimTile) {
    summaryMoimTile.addEventListener("click", () => {
        const groupBtn = document.getElementById("nav-group1");
        if (groupBtn) groupBtn.click();
    });
}

// 9. 설정 화면 메뉴 ON/OFF 토글
const toggleConfigs = [
    { checkboxId: 'toggle-cards', liId: 'li-cards', key: 'onlybank_cfg_cards' },
    { checkboxId: 'toggle-vehicle', liId: 'li-vehicle', key: 'onlybank_cfg_vehicle' },
    { checkboxId: 'toggle-tax', liId: 'li-tax', key: 'onlybank_cfg_tax' },
    { checkboxId: 'toggle-ipo', liId: 'li-ipo', key: 'onlybank_cfg_ipo' },
    { checkboxId: 'toggle-reward', liId: 'li-reward', key: 'onlybank_cfg_reward' },
    { checkboxId: 'toggle-extra', liId: 'li-extra', key: 'onlybank_cfg_extra' },
    { checkboxId: 'toggle-moim', liId: 'group-moim', key: 'onlybank_cfg_moim' }
];

const checkIncomeDivider = () => {
    const ipo = document.getElementById('toggle-ipo');
    const reward = document.getElementById('toggle-reward');
    const extra = document.getElementById('toggle-extra');
    const divider = document.getElementById('divider-income');
    
    if (divider && ipo && reward && extra) {
        if (!ipo.checked && !reward.checked && !extra.checked) {
            divider.style.setProperty("display", "none", "important");
        } else {
            divider.style.setProperty("display", "block", "important");
        }
    }
};

toggleConfigs.forEach(item => {
    const checkbox = document.getElementById(item.checkboxId);
    const liElement = document.getElementById(item.liId);
    if (!checkbox || !liElement) return;

    try {
        const savedState = localStorage.getItem(item.key);
        if (savedState !== null) {
            checkbox.checked = (savedState === 'true');
        }
    } catch (e) {}

    const updateVisibility = () => {
        if (checkbox.checked) {
            liElement.style.setProperty("display", "block", "important");
        } else {
            liElement.style.setProperty("display", "none", "important");
        }
        checkIncomeDivider();
    };

    updateVisibility();

    checkbox.addEventListener('change', () => {
        try { localStorage.setItem(item.key, checkbox.checked); } catch (e) {}
        updateVisibility();
    });

    const row = checkbox.closest('.toggle-row');
    if (row) {
        row.addEventListener('click', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.closest('label')) return;
            checkbox.checked = !checkbox.checked;
            checkbox.dispatchEvent(new Event('change'));
        });
    }
});

// 10. 엑셀 다운로드
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
