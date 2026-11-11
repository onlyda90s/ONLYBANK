import { initAuthModule } from "./auth.js";
import { initNavigationModule } from "./navigation.js";

// 시스템 시작 시 핵심 모듈 통합 가동
document.addEventListener("DOMContentLoaded", () => {
    // 1. 보안 규정, 인증 세션, 인앱 방어, 게스트 격리 실행
    initAuthModule();

    // 2. 사이드바 조작, 화면 라우팅, 메뉴 표시 설정 실행
    initNavigationModule();

    // 추후 데이터 시트 확정 시 연결될 모듈 (지금은 비활성화 대기)
    // initReportModule();
    // initAssetsModule();
});
