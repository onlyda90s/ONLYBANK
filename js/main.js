import { auth, provider, signInWithPopup, signOut, onAuthStateChanged } from "./firebase.js";

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

// 3. 상태 감시
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

// 4. 메뉴 라우팅
const menuBtns = document.querySelectorAll('.menu-btn');
const viewSections = document.querySelectorAll('.view-section');
const placeholderTitle = document.getElementById('placeholder-title');

menuBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        
        // 버튼 색상 초기화
        menuBtns.forEach(b => {
            b.className = "menu-btn block px-3 py-2.5 rounded-xl text-brand-sub hover:bg-black/5 transition";
        });
        
        // 하이라이트 (모임 vs 개인 vs 설정)
        if (btn.id.includes('group')) {
            btn.className = "menu-btn block px-3 py-2.5 rounded-xl bg-brand-group text-white shadow-sm";
        } else if (btn.id === 'nav-settings') {
            btn.className = "menu-btn block px-3 py-2.5 mb-2 rounded-xl text-xs font-bold bg-slate-200 text-brand-ink shadow-sm";
        } else {
            btn.className = "menu-btn block px-3 py-2.5 rounded-xl bg-brand-personal text-white shadow-sm";
        }

        // 화면 전환
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

// =========================================
// ★ 5. 설정 화면 로직 (메뉴 토글 & 엑셀 다운로드)
// =========================================

// 메뉴 토글 기능
const toggles = [
    { id: 'toggle-cards', targetLi: 'li-cards' },
    { id: 'toggle-income', targetLi: 'li-income' },
    { id: 'toggle-vehicle', targetLi: 'li-vehicle' },
    { id: 'toggle-tax', targetLi: 'li-tax' }
];

toggles.forEach(item => {
    const checkbox = document.getElementById(item.id);
    const liElement = document.getElementById(item.targetLi);
    if (checkbox && liElement) {
        checkbox.addEventListener('change', (e) => {
            if(e.target.checked) {
                liElement.style.display = 'block'; // 스위치 ON: 메뉴 표시
            } else {
                liElement.style.display = 'none';  // 스위치 OFF: 메뉴 숨김
            }
        });
    }
});

// 엑셀(CSV) 다운로드 기능
const exportCsvBtn = document.getElementById('exportCsvBtn');
if (exportCsvBtn) {
    exportCsvBtn.addEventListener('click', () => {
        // 샘플 CSV 데이터 생성 (한글 깨짐 방지 위해 \uFEFF 추가)
        const csvContent = "data:text/csv;charset=utf-8,\uFEFF날짜,구분,카테고리,결제수단,금액,메모\n"
            + "2026-11-01,수입,급여,우리은행,3000000,11월 정기급여\n"
            + "2026-11-02,지출,식비,신한카드,15000,점심식사\n"
            + "2026-11-05,저축,주식,미래에셋,500000,삼성전자 매수";
        
        // 다운로드 트리거
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "onlybank_backup_202611.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
}
