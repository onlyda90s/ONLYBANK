import { auth, provider, signInWithPopup, signOut, onAuthStateChanged } from "./firebase.js";

// HTML 요소 가져오기
const entryView = document.getElementById("entryView");
const loggedInView = document.getElementById("loggedInView");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const userName = document.getElementById("userName");
const userEmail = document.getElementById("userEmail");
const userAvatar = document.getElementById("userAvatar");
const inviteCodeInput = document.getElementById("inviteCodeInput");
const enterCodeBtn = document.getElementById("enterCodeBtn");

// 1. 구글 로그인 실행
loginBtn.addEventListener("click", async () => {
    try {
        await signInWithPopup(auth, provider);
    } catch (error) {
        console.error("로그인 에러:", error);
        alert("로그인 중 문제가 발생했습니다: " + error.message);
    }
});

// 2. 로그아웃 실행
logoutBtn.addEventListener("click", async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("로그아웃 에러:", error);
    }
});

// 3. 초대 코드로 접속 시도
enterCodeBtn.addEventListener("click", () => {
    const code = inviteCodeInput.value.trim();
    if (!code) {
        alert("초대 코드를 입력해 주세요.");
        return;
    }
    // Phase 1 프로토타입 단계 확인용 안내
    alert(`[${code}] 코드로 모임 대시보드 진입을 시도합니다.\n(다음 단계에서 모임 화면과 연결됩니다)`);
});

// 4. 구글 로그인 상태 감지
onAuthStateChanged(auth, (user) => {
    if (user) {
        entryView.classList.add("hidden");
        loggedInView.classList.remove("hidden");
        userName.textContent = user.displayName;
        userEmail.textContent = user.email;
        userAvatar.src = user.photoURL || "https://via.placeholder.com/80";
    } else {
        entryView.classList.remove("hidden");
        loggedInView.classList.add("hidden");
    }
});
