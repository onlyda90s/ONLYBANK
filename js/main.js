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
            console.error("로그인 에러:", error);
            alert("로그인 중 문제가 발생했습니다: " + error.message);
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

// 3. 초대 코드 입력 처리
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

// 4. 로그인 인증 상태 감시 및 대시보드 표시 전환
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

// 5. 사이드바 메뉴 클릭 시 화면 전환(라우팅)
const menuBtns = document.querySelectorAll('.menu-btn');
const viewSections = document.querySelectorAll('.view-section');
const placeholderTitle = document.getElementById('placeholder-title');

menuBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        
        // 1) 모든 사이드바 버튼 색상을 기본 회색으로 초기화
        menuBtns.forEach(b => {
            b.className = "menu-btn block px-3 py-2.5 rounded-xl text-brand-sub hover:bg-black/5 transition";
        });
        
        // 2) 클릭된 메뉴 버튼 하이라이트 (모임 메뉴: 벽돌색 / 개인 메뉴: 네이비)
        if (btn.id.includes('group')) {
            btn.className = "menu-btn block px-3 py-2.5 rounded-xl bg-brand-group text-white shadow-sm";
        } else {
            btn.className = "menu-btn block px-3 py-2.5 rounded-xl bg-brand-personal text-white shadow-sm";
        }

        // 3) 모든 우측 본문 화면 숨김
        viewSections.forEach(section => {
            section.style.display = 'none';
        });

        // 4) 타겟 화면 표시
        const targetViewId = btn.id.replace('nav-', 'view-');
        const targetView = document.getElementById(targetViewId);
        
        if (targetView) {
            targetView.style.display = 'block';
        } else {
            // 아직 상세 디자인이 안 들어간 메뉴는 임시 플레이스홀더 화면 표시
            const placeholder = document.getElementById('view-placeholder');
            if (placeholderTitle) placeholderTitle.textContent = btn.textContent.trim();
            if (placeholder) placeholder.style.display = 'block';
        }
    });
});
