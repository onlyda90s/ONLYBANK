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

// 4. 사이드바 접기/펼치기 (Collapse)
const sidebar = document.getElementById("sidebar");
const sidebarHeader = document.getElementById("sidebarHeader");
const sidebarToggleBtn = document.getElementById("sidebarToggleBtn");
const sidebarTexts = document.querySelectorAll(".sidebar-text");

if (sidebarToggleBtn && sidebar) {
    sidebarToggleBtn.addEventListener("click", () => {
        const isCollapsed = sidebar.classList.contains("w-20");
        
        if (isCollapsed) {
            sidebar.classList.remove("w-20");
            sidebar.classList.add("w-64");
            if (sidebarHeader) {
                sidebarHeader.classList.remove("px-2.5");
                sidebarHeader.classList.add("px-4");
            }
            sidebarTexts.forEach(el => el.style.display = "");
            sidebarToggleBtn.textContent = "◀";
        } else {
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

// 5. 메뉴 라우팅
const menuBtns = document.querySelectorAll('.menu-btn');
const viewSections = document.querySelectorAll('.view-section');
const placeholderTitle = document.getElementById('placeholder-title');

menuBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        
        menuBtns.forEach(b => {
            b.className = "menu-btn flex items-center px-2.5 py-2 rounded-xl text-brand-sub hover:text-brand-ink hover:bg-black/[0.03] transition-colors";
        });
        
        if (btn.id.includes('group')) {
            btn.className = "menu-btn flex items-center px-2.5 py-2 rounded-xl bg-brand-group text-white shadow-sm font-semibold";
        } else if (btn.id === 'nav-settings') {
            btn.className = "menu-btn flex items-center px-2.5 py-2 mb-2 rounded-xl text-xs bg-slate-200 text-brand-ink shadow-sm font-semibold";
        } else {
            btn.className = "menu-btn flex items-center px-2.5 py-2 rounded-xl bg-brand-personal text-white shadow-sm font-semibold";
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

// =====================================
// ★ 6. 7개 항목 설정 화면 메뉴 ON/OFF 토글
// =====================================
const toggleConfigs = [
    { checkboxId: 'toggle-cards', liId: 'li-cards', key: 'onlybank_cfg_cards' },
    { checkboxId: 'toggle-vehicle', liId: 'li-vehicle', key: 'onlybank_cfg_vehicle' },
    { checkboxId: 'toggle-tax', liId: 'li-tax', key: 'onlybank_cfg_tax' },
    { checkboxId: 'toggle-ipo', liId: 'li-ipo', key: 'onlybank_cfg_ipo' },
    { checkboxId: 'toggle-reward', liId: 'li-reward', key: 'onlybank_cfg_reward' },
    { checkboxId: 'toggle-extra', liId: 'li-extra', key: 'onlybank_cfg_extra' },
    { checkboxId: 'toggle-moim', liId: 'group-moim', key: 'onlybank_cfg_moim' }
];

// 부수입 관리(소제목) 헤더 자동 숨김 함수
const checkIncomeHeader = () => {
    const ipo = document.getElementById('toggle-ipo');
    const reward = document.getElementById('toggle-reward');
    const extra = document.getElementById('toggle-extra');
    const header = document.getElementById('header-income');
    
    if (header && ipo && reward && extra) {
        if (!ipo.checked && !reward.checked && !extra.checked) {
            header.style.setProperty("display", "none", "important"); // 3개 다 끄면 소제목 숨김
        } else {
            header.style.setProperty("display", "block", "important");
        }
    }
};

toggleConfigs.forEach(item => {
    const checkbox = document.getElementById(item.checkboxId);
    const liElement = document.getElementById(item.liId);

    // 로컬 스토리지에서 상태 불러오기
    const savedState = localStorage.getItem(item.key);
    if (savedState !== null && checkbox) {
        checkbox.checked = (savedState === 'true');
    }

    // 화면 반영 함수
    const updateVisibility = () => {
        if (!liElement || !checkbox) return;
        if (checkbox.checked) {
            liElement.style.setProperty("display", "block", "important");
        } else {
            liElement.style.setProperty("display", "none", "important");
        }
        checkIncomeHeader(); // 켤 때/끌 때마다 부수입 헤더 표시 여부 갱신
    };

    updateVisibility();

    // 스위치 조작 이벤트
    if (checkbox) {
        checkbox.addEventListener('change', () => {
            localStorage.setItem(item.key, checkbox.checked);
            updateVisibility();
        });
    }
});

// 7. 엑셀 다운로드
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
