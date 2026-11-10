// ==========================================
// 1. Firebase SDK 동적 로드 및 설정
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getAuth, 
    GoogleAuthProvider, 
    signInWithPopup, 
    signOut, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Firebase 콘솔 설정값 (본인 프로젝트 키가 있다면 여기에 입력하세요)
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

let auth = null;
let provider = null;
let isFirebaseReady = false;

try {
    if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_API_KEY") {
        const app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        provider = new GoogleAuthProvider();
        isFirebaseReady = true;
    }
} catch (e) {
    console.warn("Firebase 초기화 대기 (임시 모드로 전환):", e);
}

// ==========================================
// 2. DOM 요소 연결
// ==========================================
const loginScreen = document.getElementById("loginScreen");
const dashboardScreen = document.getElementById("dashboardScreen");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const userName = document.getElementById("userName");
const userAvatar = document.getElementById("userAvatar");
const inviteCodeInput = document.getElementById("inviteCodeInput");
const enterCodeBtn = document.getElementById("enterCodeBtn");

// 대시보드 화면 진입 함수
const enterDashboard = (name = "지나", avatar = "https://via.placeholder.com/80") => {
    if (loginScreen) loginScreen.style.setProperty("display", "none", "important");
    if (dashboardScreen) dashboardScreen.style.setProperty("display", "flex", "important");
    if (userName) userName.textContent = name;
    if (userAvatar) userAvatar.src = avatar;
    localStorage.setItem("onlybank_logged_in", "true");
};

// 로그인 화면 복귀 함수
const exitDashboard = () => {
    if (loginScreen) loginScreen.style.setProperty("display", "flex", "important");
    if (dashboardScreen) dashboardScreen.style.setProperty("display", "none", "important");
    localStorage.removeItem("onlybank_logged_in");
};

// ==========================================
// 3. 로그인 / 로그아웃 이벤트 (절대 막히지 않는 로직)
// ==========================================

// Google 로그인 버튼
if (loginBtn) {
    loginBtn.addEventListener("click", async () => {
        if (!isFirebaseReady) {
            // Firebase 키가 아직 입력되지 않은 상태인 경우 친절한 안내 후 즉시 입장
            alert("Firebase 키 설정 전입니다. 테스트 계정(지나)으로 대시보드에 바로 진입합니다.");
            enterDashboard("지나 (테스트)");
            return;
        }

        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            enterDashboard(user.displayName || "사용자", user.photoURL || "https://via.placeholder.com/80");
        } catch (error) {
            console.error("구글 로그인 실패:", error);
            // 팝업이 닫히거나 도메인 미승인 에러가 나도 테스트를 이어갈 수 있도록 선택권 제공
            const proceed = confirm(`Google 로그인 접속 오류 (${error.code || error.message})\n\n테스트 모드로 대시보드를 계속 둘러보시겠습니까?`);
            if (proceed) {
                enterDashboard("지나 (오프라인)");
            }
        }
    });
}

// 초대 코드로 바로 입장 버튼
if (enterCodeBtn) {
    enterCodeBtn.addEventListener("click", () => {
        const code = inviteCodeInput ? inviteCodeInput.value.trim() : "";
        enterDashboard(code ? `지나 [${code}]` : "지나");
    });
}

// 로그아웃 버튼
if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
        if (isFirebaseReady && auth) {
            try { await signOut(auth); } catch (e) {}
        }
        exitDashboard();
    });
}

// Firebase 로그인 상태 감시 및 기존 로그인 세션 유지
if (isFirebaseReady && auth) {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            enterDashboard(user.displayName || "사용자", user.photoURL || "https://via.placeholder.com/80");
        }
    });
} else {
    // 로컬 세션 확인
    if (localStorage.getItem("onlybank_logged_in") === "true") {
        enterDashboard("지나");
    }
}

// ==========================================
// 4. 사이드바 접기/펼치기 (Collapse)
// ==========================================
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

// ==========================================
// 5. 메뉴 라우팅
// ==========================================
const menuBtns = document.querySelectorAll('.menu-btn');
const viewSections = document.querySelectorAll('.view-section');
const placeholderTitle = document.getElementById('placeholder-title');

menuBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        menuBtns.forEach(b => {
            if (b.id === 'nav-settings') {
                b.className = "menu-btn flex items-center px-3 py-2 mb-2 rounded-xl text-xs font-medium text-brand-sub hover:text-brand-ink hover:bg-black/[0.03] transition-colors";
            } else {
                b.className = "menu-btn flex items-center pl-7 pr-3 py-2 rounded-xl text-brand-sub hover:text-brand-ink hover:bg-black/[0.03] transition-colors text-[13px]";
            }
        });
        
        if (btn.id.includes('group')) {
            btn.className = "menu-btn flex items-center pl-7 pr-3 py-2 rounded-xl bg-brand-group text-white shadow-sm font-semibold text-[13px]";
        } else if (btn.id === 'nav-settings') {
            btn.className = "menu-btn flex items-center px-3 py-2 mb-2 rounded-xl text-xs bg-slate-200 text-brand-ink shadow-sm font-semibold";
        } else {
            btn.className = "menu-btn flex items-center pl-7 pr-3 py-2 rounded-xl bg-brand-personal text-white shadow-sm font-semibold text-[13px]";
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
// 6. 설정 화면 메뉴 ON/OFF 토글
// ==========================================
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

// ==========================================
// 7. 엑셀 다운로드
// ==========================================
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
