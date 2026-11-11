import { initAuthModule } from "./auth.js?v=20261111_asset_storage_v3";
import { initNavigationModule } from "./navigation.js?v=20261111_asset_storage_v3";
import { initReportModule } from "./report.js?v=20261111_asset_storage_v3";
import { initAssetsModule } from "./assets.js?v=20261111_asset_storage_v3";

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
