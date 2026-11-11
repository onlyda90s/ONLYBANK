import { initAuthModule } from "./auth.js?v=20261111_single_number_tooltip";
import { initNavigationModule } from "./navigation.js?v=20261111_single_number_tooltip";
import { initReportModule } from "./report.js?v=20261111_single_number_tooltip";
import { initAssetsModule } from "./assets.js?v=20261111_single_number_tooltip";

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
