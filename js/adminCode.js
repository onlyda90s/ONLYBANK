const ADMIN_HASH_KEY = "onlybank_admin_code_hash_v1";
const ADMIN_SESSION_KEY = "onlybank_admin_session_active";
const FAIL_COUNT_KEY = "onlybank_admin_fail_count";
const LOCKED_KEY = "onlybank_admin_locked";

const MAX_ATTEMPTS = 5;

const ADMIN_AVATAR_SVG = "data:image/svg+xml;utf8," + encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="16" fill="#1E3A5F"/><text x="16" y="21" font-family="sans-serif" font-size="13" font-weight="bold" fill="#FFFDF8" text-anchor="middle">관</text></svg>`
);

// SHA-256 해시 생성
const hashCode = async (plain) => {
    const encoder = new TextEncoder();
    const data = encoder.encode("ONLYBANK_SALT_" + plain.trim());
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
};

// 영문, 숫자, 영문+숫자 모두 허용 (4~6자리)
const isValidAdminCodeFormat = (code) => {
    const trimmed = code.trim();
    return /^[a-zA-Z0-9]{4,6}$/.test(trimmed);
};

// Firestore 선택적 동기화
const syncHashWithFirestore = async (action, newHash = null) => {
    try {
        const fb = await import("./firebase.js");
        const fs = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js");
        const db = fb.db || fb.firestore;
        if (!db) return null;

        const docRef = fs.doc(db, "onlybank_security", "personal_admin");
        if (action === "save") {
            await fs.setDoc(docRef, { hash: newHash, updatedAt: new Date().toISOString() }, { merge: true });
            return newHash;
        } else if (action === "remove") {
            await fs.deleteDoc(docRef);
            return null;
        } else if (action === "get") {
            const snap = await fs.getDoc(docRef);
            if (snap.exists() && snap.data().hash) {
                localStorage.setItem(ADMIN_HASH_KEY, snap.data().hash);
                return snap.data().hash;
            }
        }
    } catch (e) {
        // 오프라인 또는 Firestore 규칙 미허용 시 로컬 스토리지 유지
    }
    return localStorage.getItem(ADMIN_HASH_KEY);
};

// 잠금 상태 확인
const isCodeLocked = () => {
    return localStorage.getItem(LOCKED_KEY) === "true";
};

const recordFailedAttempt = () => {
    const count = Number(localStorage.getItem(FAIL_COUNT_KEY) || 0) + 1;
    localStorage.setItem(FAIL_COUNT_KEY, String(count));
    if (count >= MAX_ATTEMPTS) {
        localStorage.setItem(LOCKED_KEY, "true");
        return "5회 연속 오입력으로 코드 로그인이 차단되었습니다. 아래 'Google로 계속하기'로 로그인하면 잠금이 해제됩니다.";
    }
    return `코드가 일치하지 않습니다. (${count}/${MAX_ATTEMPTS}회 오류)`;
};

// Google 로그인 성공 시 잠금 및 오류 횟수 해제
const clearFailedAttempts = () => {
    localStorage.removeItem(FAIL_COUNT_KEY);
    localStorage.removeItem(LOCKED_KEY);
    const loginMsg = document.getElementById("codeLoginMsg");
    if (loginMsg) loginMsg.classList.add("hidden");
};

// 관리자 모드 진입 (현재 브라우저 탭 세션 동안만 유지 -> 탭 종료/로그아웃 시 자동 만료)
const unlockAdminDashboard = () => {
    sessionStorage.setItem(ADMIN_SESSION_KEY, "true");

    const loginScreen = document.getElementById("loginScreen");
    const dashboardScreen = document.getElementById("dashboardScreen");
    const userNameEl = document.getElementById("userName");
    const userAvatarEl = document.getElementById("userAvatar");
    const groupMoimEl = document.getElementById("group-moim");

    if (loginScreen) loginScreen.style.display = "none";
    if (dashboardScreen) dashboardScreen.style.display = "flex";
    if (userNameEl) userNameEl.textContent = "관리자 모드";
    if (userAvatarEl) userAvatarEl.src = ADMIN_AVATAR_SVG;
    if (groupMoimEl) groupMoimEl.style.display = "block";
};

// 설정 탭 UI 상태 갱신
const refreshSettingsUI = () => {
    const hasHash = Boolean(localStorage.getItem(ADMIN_HASH_KEY));
    const badge = document.getElementById("adminCodeStatusBadge");
    const removeBtn = document.getElementById("removeAdminCodeBtn");

    if (badge) {
        if (hasHash) {
            badge.textContent = "설정됨 (활성)";
            badge.className = "text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200";
        } else {
            badge.textContent = "미설정";
            badge.className = "text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200";
        }
    }
    if (removeBtn) {
        removeBtn.classList.toggle("hidden", !hasHash);
    }
};

const showFeedback = (el, text, isError = false) => {
    if (!el) return;
    el.textContent = text;
    el.className = `text-xs font-medium pt-0.5 leading-relaxed ${isError ? "text-rose-600" : "text-emerald-700"}`;
    el.classList.remove("hidden");
};

// Google 로그인 감지 시 잠금 자동 해제 리스너 등록
const bindGoogleUnlockListener = async () => {
    // 1) Firebase Auth 상태 감지 (Google 로그인 완료 시 user 객체 생성됨)
    try {
        const fb = await import("./firebase.js");
        const authMod = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js");
        const authInstance = fb.auth || authMod.getAuth();
        if (authInstance && authMod.onAuthStateChanged) {
            authMod.onAuthStateChanged(authInstance, (user) => {
                if (user) {
                    clearFailedAttempts();
                }
            });
        }
    } catch (e) {}

    // 2) 보조 감지: 대시보드 화면이 열렸는데 관리자 코드 세션이 아니면(Google 로그인 등) 잠금 해제
    const dashboardScreen = document.getElementById("dashboardScreen");
    if (dashboardScreen) {
        const observer = new MutationObserver(() => {
            if (dashboardScreen.style.display !== "none" && sessionStorage.getItem(ADMIN_SESSION_KEY) !== "true") {
                clearFailedAttempts();
            }
        });
        observer.observe(dashboardScreen, { attributes: true, attributeFilter: ["style"] });
    }
};

export const initAdminCodeModule = async () => {
    // 이전 버전 영구 유지 키가 남아있다면 제거하여 기본 세션 만료 규칙 준수
    localStorage.removeItem("onlybank_admin_session_persist");
    localStorage.removeItem("onlybank_admin_lock_until");

    // 1. 현재 탭 세션이 유효한 경우에만 대시보드 유지
    if (sessionStorage.getItem(ADMIN_SESSION_KEY) === "true" && Boolean(localStorage.getItem(ADMIN_HASH_KEY))) {
        unlockAdminDashboard();
    }

    // Google 로그인 시 잠금 해제 감지기 연결
    bindGoogleUnlockListener();

    // 백그라운드에서 Firestore 최신 코드 해시 동기화
    syncHashWithFirestore("get");

    const codeInput = document.getElementById("inviteCodeInput");
    const enterBtn = document.getElementById("enterCodeBtn");
    const loginMsg = document.getElementById("codeLoginMsg");

    // 초기 진입 시 이미 5회 잠금 상태라면 안내 메시지 노출
    if (isCodeLocked()) {
        showFeedback(loginMsg, "5회 연속 오입력으로 코드 로그인이 차단되었습니다. 'Google로 계속하기'로 로그인하면 잠금이 해제됩니다.", true);
    }

    // 2. 로그인 화면 코드 입장 이벤트 처리
    const handleCodeSubmit = async (e) => {
        if (isCodeLocked()) {
            e.stopImmediatePropagation();
            e.preventDefault();
            showFeedback(loginMsg, "5회 연속 오입력으로 코드 로그인이 차단되었습니다. 'Google로 계속하기'로 로그인하면 잠금이 해제됩니다.", true);
            return;
        }

        const rawCode = (codeInput?.value || "").trim();
        if (!rawCode) return;

        let storedHash = localStorage.getItem(ADMIN_HASH_KEY);
        if (!storedHash) {
            storedHash = await syncHashWithFirestore("get");
        }

        if (storedHash) {
            const enteredHash = await hashCode(rawCode);
            if (enteredHash === storedHash) {
                e.stopImmediatePropagation();
                e.preventDefault();
                clearFailedAttempts();
                codeInput.value = "";
                unlockAdminDashboard();
                return;
            }
        }

        // 관리자 코드가 아닐 경우 기존 초대 코드(auth.js) 동작 후 실패 시 카운트 누적
        setTimeout(() => {
            const loginScreen = document.getElementById("loginScreen");
            if (loginScreen && loginScreen.style.display !== "none") {
                const errMsg = recordFailedAttempt();
                showFeedback(loginMsg, errMsg, true);
            }
        }, 350);
    };

    enterBtn?.addEventListener("click", handleCodeSubmit, true);
    codeInput?.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            handleCodeSubmit(e);
        }
    }, true);

    // 3. 로그아웃 시 세션 정리 (기존 auth.js 로그아웃과 함께 동작)
    document.getElementById("logoutBtn")?.addEventListener("click", () => {
        sessionStorage.removeItem(ADMIN_SESSION_KEY);
        const loginScreen = document.getElementById("loginScreen");
        const dashboardScreen = document.getElementById("dashboardScreen");
        if (dashboardScreen) dashboardScreen.style.display = "none";
        if (loginScreen) loginScreen.style.display = "flex";
    }, true);

    // 4. 설정 탭: 관리자 코드 저장 / 해제 이벤트
    refreshSettingsUI();

    const adminInput = document.getElementById("adminCodeInput");
    const adminConfirm = document.getElementById("adminCodeConfirmInput");
    const saveBtn = document.getElementById("saveAdminCodeBtn");
    const removeBtn = document.getElementById("removeAdminCodeBtn");
    const settingsMsg = document.getElementById("adminCodeMsg");

    saveBtn?.addEventListener("click", async () => {
        const c1 = (adminInput?.value || "").trim();
        const c2 = (adminConfirm?.value || "").trim();

        if (!isValidAdminCodeFormat(c1)) {
            showFeedback(settingsMsg, "영문, 숫자 또는 영문+숫자 조합 4~6자리 코드를 입력해 주세요.", true);
            return;
        }
        if (c1 !== c2) {
            showFeedback(settingsMsg, "입력한 두 코드가 서로 일치하지 않습니다.", true);
            return;
        }

        const hashed = await hashCode(c1);
        localStorage.setItem(ADMIN_HASH_KEY, hashed);
        clearFailedAttempts();
        await syncHashWithFirestore("save", hashed);

        if (adminInput) adminInput.value = "";
        if (adminConfirm) adminConfirm.value = "";
        refreshSettingsUI();
        showFeedback(settingsMsg, "개인 관리자 코드가 저장되었습니다.", false);
    });

    removeBtn?.addEventListener("click", async () => {
        if (!confirm("등록된 개인 관리자 코드를 해제하시겠습니까?\n해제 후에는 Google 로그인만 사용할 수 있습니다.")) return;

        localStorage.removeItem(ADMIN_HASH_KEY);
        sessionStorage.removeItem(ADMIN_SESSION_KEY);
        clearFailedAttempts();
        await syncHashWithFirestore("remove");

        refreshSettingsUI();
        showFeedback(settingsMsg, "관리자 코드가 해제되었습니다.", false);
    });
};
