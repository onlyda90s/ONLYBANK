import { initAuthModule } from "./auth.js?v=20261111_sheet_grid12";
import { initNavigationModule } from "./navigation.js?v=20261111_sheet_grid12";
import { initReportModule } from "./report.js?v=20261111_sheet_grid12";
import { initAssetsModule } from "./assets.js?v=20261111_sheet_grid12";

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
