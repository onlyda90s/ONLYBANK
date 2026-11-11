import { initAuthModule } from "./auth.js";
import { initNavigationModule } from "./navigation.js";
import { initReportModule } from "./report.js";
import { initAssetsModule } from "./assets.js";

document.addEventListener("DOMContentLoaded", () => {
    // 1. 보안 규정 및 7시간 세션 엔진
    initAuthModule();

    // 2. 사이드바 및 화면 라우팅
    initNavigationModule();

    // 3. 연간 리포트 화면 및 차트 복원 실행
    initReportModule();

    // 4. 자산현황 12개월 추이 및 1원 시트 복원 실행
    initAssetsModule();
});
