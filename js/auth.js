import { auth, provider, signInWithPopup, signOut, onAuthStateChanged } from "./firebase.js";
import { setPersistence, browserSessionPersistence } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// ==========================================
// 세션 정책 상수 & 스토리지 키
// ==========================================
const SESSION_TIMEOUT_MS = 7 * 60 * 60 * 1000; // 7시간 절대 세션
const SESSION_START_KEY = "onlybank_session_start";
const GUEST_CODE_KEY = "onlybank_guest_code";

// 1. 인앱 브라우저(카카오, 네이버, 인스타 등) 감지 및 방어
export const checkInAppBrowser = () => {
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    const isInApp = (/KAKAOTALK|NAVER|Instagram|FB_IAB|FB4A|FBAN/i).test(ua);

    if (isInApp) {
        alert("보안 정책 및 Google 계정 보호를 위해 인앱 브라우저 접속이 제한됩니다.\n\n우측 상단 또는 하단 메뉴(⋮ 또는 공유)를 눌러 'Chrome으로 열기' 또는 'Safari로 열기'를 선택해 주세요.");
        const loginBtn = document.getElementById("loginBtn");
        if (loginBtn) {
            loginBtn.disabled = true;
            loginBtn.classList.add("opacity-50", "cursor-not-allowed");
        }
        return true;
    }
    return false;
};

// 2. 브라우저 세션 영속성 설정 (창 닫으면 토큰 자동 파기)
export const initPersistence = async () => {
    try {
        await setPersistence(auth, browserSessionPersistence);
    } catch (err) {
        console.warn("세션 영속성 설정 오류:", err);
    }
};

// 3. 세션 타이머 관리 (타임스탬프 기록 및 파기)
export const startSessionTimer = () => {
    if (!sessionStorage.getItem(SESSION_START_KEY)) {
        sessionStorage.setItem(SESSION_START_KEY, Date.now().toString());
    }
};

export const clearSessionStorage = () => {
    sessionStorage.removeItem(SESSION_START_KEY);
    sessionStorage.removeItem(GUEST_CODE_KEY);
};

// 4. 7시간 만료 판별 및 강제 로그아웃
export const checkSessionExpiry = async () => {
    const startTimeStr = sessionStorage.getItem(SESSION_START_KEY);
    if (!startTimeStr) return;

    const startTime = parseInt(startTimeStr, 10);
    const now = Date.now();

    if (now - startTime >= SESSION_TIMEOUT_MS) {
        clearSessionStorage();
        await signOut(auth);
        alert("보안 정책에 따라 로그인 후 7시간이 경과하여 세션이 안전하게 만료되었습니다.\n다시 로그인해 주세요.");
        window.location.reload();
    }
};

// 5. 게스트 권한 격리 (개인 메뉴 숨김 + 조회 전용 모임 장부 직행)
export const applyGuestMode = (code) => {
    // 개인 자산 관리 메뉴 전면 숨김
    const personalMenuIds = [
        "li-home", "li-ledger", "li-assets", "li-cards", 
        "li-vehicle", "li-tax", "li-ipo", "li-reward", "li-extra"
    ];
    personalMenuIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.setProperty("display", "none", "important");
    });

    // 프로필 영역 표시
    const userName = document.getElementById("userName");
    const userAvatar = document.getElementById("userAvatar");
    if (userName) userName.textContent = `초대 멤버 (${code})`;
    if (userAvatar) userAvatar.src = "https://ui-avatars.com/api/?name=Guest&background=8F3D2A&color=fff";

    // 공용 모임 메뉴로 강제 포커스
    document.getElementById("nav-group1")?.click();

    // 화면 전환
    document.getElementById("loginScreen")?.style.setProperty("display", "none", "important");
    document.getElementById("dashboardScreen")?.style.setProperty("display", "flex", "important");
};

// 6. 인증 및 세션 리스너 초기화
export const initAuthModule = () => {
    checkInAppBrowser();
    initPersistence();

    // [세션 감지 3대 트리거] 1) 60초 주기 2) 화면 복귀/잠금해제 3) 창 포커스
    setInterval(checkSessionExpiry, 60 * 1000);
    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") checkSessionExpiry();
    });
    window.addEventListener("focus", checkSessionExpiry);

    // Google 로그인 (소유자)
    document.getElementById("loginBtn")?.addEventListener("click", async () => {
        try {
            await signInWithPopup(auth, provider);
            clearSessionStorage();
            startSessionTimer();
        } catch (err) {
            console.error("로그인 에러:", err);
            alert(`로그인 실패: ${err.message}`);
        }
    });

    // 초대 코드 로그인 (게스트: 4자리 or 6자리 영문/숫자)
    document.getElementById("enterCodeBtn")?.addEventListener("click", () => {
        const codeInput = document.getElementById("inviteCodeInput");
        const code = codeInput ? codeInput.value.trim().toUpperCase() : "";

        if (code.length !== 4 && code.length !== 6) {
            alert("초대 코드는 4자리 또는 6자리 영문/숫자여야 합니다.");
            return;
        }

        clearSessionStorage();
        startSessionTimer();
        sessionStorage.setItem(GUEST_CODE_KEY, code);
        applyGuestMode(code);
    });

    // 수동 로그아웃
    document.getElementById("logoutBtn")?.addEventListener("click", async () => {
        try {
            clearSessionStorage();
            await signOut(auth);
            window.location.reload();
        } catch (err) {
            console.error("로그아웃 에러:", err);
        }
    });

    // 인증 상태 감시자 (새로고침 시 세션 유지 검사)
    onAuthStateChanged(auth, (user) => {
        const guestCode = sessionStorage.getItem(GUEST_CODE_KEY);
        const loginScreen = document.getElementById("loginScreen");
        const dashboardScreen = document.getElementById("dashboardScreen");

        if (user) {
            checkSessionExpiry();
            loginScreen?.style.setProperty("display", "none", "important");
            dashboardScreen?.style.setProperty("display", "flex", "important");
            
            const userName = document.getElementById("userName");
            const userAvatar = document.getElementById("userAvatar");
            if (userName) userName.textContent = user.displayName || "소유자";
            if (userAvatar && user.photoURL) userAvatar.src = user.photoURL;
        } else if (guestCode) {
            checkSessionExpiry();
            applyGuestMode(guestCode);
        } else {
            clearSessionStorage();
            loginScreen?.style.setProperty("display", "flex", "important");
            dashboardScreen?.style.setProperty("display", "none", "important");
        }
    });
};
