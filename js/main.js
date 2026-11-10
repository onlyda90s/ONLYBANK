import { auth, provider, signInWithPopup, signOut, onAuthStateChanged } from "./firebase.js";

const loginScreen = document.getElementById("loginScreen");
const dashboardScreen = document.getElementById("dashboardScreen");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const userName = document.getElementById("userName");
const userAvatar = document.getElementById("userAvatar");
const inviteCodeInput = document.getElementById("inviteCodeInput");
const enterCodeBtn = document.getElementById("enterCodeBtn");

// 1. 구글 로그인
if (loginBtn) {
    loginBtn.addEventListener("click", async () => {
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            alert("로그인 에러: " + error.message);
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

// 3. 초대 코드 입력
if (enterCodeBtn) {
    enterCodeBtn.addEventListener("click", () => {
        const code = inviteCodeInput ? inviteCodeInput.value.trim() : "";
        if (!code) {
            alert("초대 코드를 입력해 주세요.");
            return;
        }
        alert(`[${code}] 코드로 모임 대시보드 진입을 확인했습니다.`);
    });
}

// 4. 로그인 상태 감지 및 확실한 화면 전환
onAuthStateChanged(auth, (user) => {
    if (user) {
        // 로그인 성공 시: 로그인 창 닫고 대시보드 표시
        loginScreen.style.setProperty("display", "none", "important");
        dashboardScreen.style.setProperty("display", "flex", "important");
        
        userName.textContent = user.displayName || "사용자";
        userAvatar.src = user.photoURL || "https://via.placeholder.com/80";
    } else {
        // 로그아웃 시: 대시보드 닫고 로그인 창 표시
        loginScreen.style.setProperty("display", "flex", "important");
        dashboardScreen.style.setProperty("display", "none", "important");
    }
});
