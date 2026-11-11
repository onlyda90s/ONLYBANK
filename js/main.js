import { initAuthModule } from "./auth.js?v=20261111_smart_view";
import { initNavigationModule } from "./navigation.js?v=20261111_smart_view";
import { initReportModule } from "./report.js?v=20261111_smart_view";
import { initAssetsModule } from "./assets.js?v=20261111_smart_view";

const startSystem = () => {
    initAuthModule();
    initNavigationModule();
    initReportModule();
    initAssetsModule();
};

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startSystem);
} else {
    startSystem();
}
