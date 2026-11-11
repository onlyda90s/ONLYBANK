import { initAuthModule } from "./auth.js?v=20261111_asset_fix";
import { initNavigationModule } from "./navigation.js?v=20261111_asset_fix";
import { initReportModule } from "./report.js?v=20261111_asset_fix";
import { initAssetsModule } from "./assets.js?v=20261111_asset_fix";

const startSystem = () => {
    initAuthModule();       // 1. 보안 규정 및 세션
    initNavigationModule(); // 2. 사이드바 및 뷰 복원
    initReportModule();     // 3. 연간 리포트
    initAssetsModule();     // 4. 자산현황 (신규 분리 차트)
};

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startSystem);
} else {
    startSystem();
}
