import { initAuthModule } from "./auth.js?v=20261111_popover_action";
import { initNavigationModule } from "./navigation.js?v=20261111_popover_action";
import { initReportModule } from "./report.js?v=20261111_popover_action";
import { initAssetsModule } from "./assets.js?v=20261111_popover_action";

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
