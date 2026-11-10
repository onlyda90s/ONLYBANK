import { auth, provider, signInWithPopup, signOut, onAuthStateChanged } from "./firebase.js";

// HTML 요소 가져오기
const entryContainer = document.getElementById("entryContainer");
const loggedInView = document.getElementById("loggedInView");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const userName = document.getElementById("userName");
const userAvatar = document.getElementById("userAvatar");
const inviteCodeInput = document.getElementById("inviteCodeInput");
const enterCodeBtn = document.getElementById("enterCodeBtn");

// 1. 구글 로그인
loginBtn.addEventListener("click", async () => {
    try {
        await signInWithPopup(auth, provider);
    } catch (error) {
        console.error("로그인 에러:", error);
        alert("로그인 중 문제가 발생했습니다: " + error.message);
    }
});

// 2. 로그아웃
logoutBtn.addEventListener("click", async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("로그아웃 에러:", error);
    }
});

// 3. 초대 코드 입력 시
enterCodeBtn.addEventListener("click", () => {
    const code = inviteCodeInput.value.trim();
    if (!code) {
        alert("초대 코드를 입력해 주세요.");
        return;
    }
    alert(`[${code}] 코드로 모임 대시보드 진입을 시도합니다.\n(다음 단계에서 모임 화면과 연결됩니다)`);
});

// 4. 구글 로그인 상태 감지 및 화면 전환
onAuthStateChanged(auth, (user) => {
    if (user) {
        entryContainer.classList.add("hidden");
        loggedInView.classList.remove("hidden");
        // 사용자 정보 표시 (이메일 제거하고 이름만 깔끔하게)
        userName.textContent = user.displayName;
        userAvatar.src = user.photoURL || "https://via.placeholder.com/80";
    } else {
        entryContainer.classList.remove("hidden");
        loggedInView.classList.add("hidden");
    }
});
