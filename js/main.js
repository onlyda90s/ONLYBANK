import { initAuthModule } from "./auth.js";
import { initNavigationModule } from "./navigation.js";
import { initReportModule } from "./report.js";
import { initAssetsModule } from "./assets.js";

const startSystem = () => {
    initAuthModule();       // 1. 보안 규정 및 7시간 세션
    initNavigationModule(); // 2. 사이드바 및 뷰 라우팅
    initReportModule();     // 3. 연간 리포트 및 수입·지출 차트 렌더링
    initAssetsModule();     // 4. 자산현황 12개월 추이 및 1원 시트
};

// DOM 로드 완료 여부를 체크하여 즉시 실행 보장
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startSystem);
} else {
    startSystem();
}
