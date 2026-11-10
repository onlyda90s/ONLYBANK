import { auth, provider, signInWithPopup, signOut, onAuthStateChanged } from "./firebase.js";

// 화면 HTML 요소 가져오기
const loggedOutView = document.getElementById("loggedOutView");
const loggedInView = document.getElementById("loggedInView");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const userName = document.getElementById("userName");
const userEmail = document.getElementById("userEmail");
const userAvatar = document.getElementById("userAvatar");

// 로그인 버튼 클릭 시 구글 팝업창 띄우기
loginBtn.addEventListener("click", async () => {
    try {
        await signInWithPopup(auth, provider);
    } catch (error) {
        console.error("로그인 에러:", error);
        alert("로그인에 실패했습니다: " + error.message);
    }
});

// 로그아웃 버튼 클릭 시
logoutBtn.addEventListener("click", async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("로그아웃 에러:", error);
    }
});

// 로그인 상태 감시 및 화면 전환
onAuthStateChanged(auth, (user) => {
    if (user) {
        // 로그인 상태
        loggedOutView.classList.add("hidden");
        loggedInView.classList.remove("hidden");
        userName.textContent = user.displayName;
        userEmail.textContent = user.email;
        userAvatar.src = user.photoURL || "https://via.placeholder.com/80";
    } else {
        // 로그아웃 상태
        loggedOutView.classList.remove("hidden");
        loggedInView.classList.add("hidden");
    }
});
