import { initAuthModule } from "./auth.js?v=20261122_admin_v2";

const startSystem = async () => {
    initAuthModule();

    const modules = [
        { path: "./adminCode.js?v=20261122_admin_v2", fn: "initAdminCodeModule" },
        { path: "./navigation.js?v=20261122_admin_v2", fn: "initNavigationModule" },
        { path: "./report.js?v=20261122_admin_v2", fn: "initReportModule" },
        { path: "./assets.js?v=20261122_admin_v2", fn: "initAssetsModule" },
        { path: "./cards.js?v=20261122_admin_v2", fn: "initCardsModule" }
    ];

    for (const mod of modules) {
        try {
            const imported = await import(mod.path);
            if (imported[mod.fn]) imported[mod.fn]();
        } catch (err) {
            console.error(`[모듈 로드 확인 필요] ${mod.path}:`, err);
        }
    }
};

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startSystem);
} else {
    startSystem();
}
