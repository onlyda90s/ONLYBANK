import { initAuthModule } from "./auth.js?v=20261111_asset_ui_clean";
import { initNavigationModule } from "./navigation.js?v=20261111_asset_ui_clean";
import { initReportModule } from "./report.js?v=20261111_asset_ui_clean";
import { initAssetsModule } from "./assets.js?v=20261111_asset_ui_clean";

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
