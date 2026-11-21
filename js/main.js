import { initAuthModule } from "./auth.js?v=20261121_nav_fix";

const startSystem = async () => {
    // 1. 로그인 모듈 최우선 실행
    initAuthModule();

    // 2. 각 기능 모듈 독립 로드
    const modules = [
        { path: "./navigation.js?v=20261121_nav_fix", fn: "initNavigationModule" },
        { path: "./report.js?v=20261121_nav_fix", fn: "initReportModule" },
        { path: "./assets.js?v=20261121_nav_fix", fn: "initAssetsModule" },
        { path: "./cards.js?v=20261121_nav_fix", fn: "initCardsModule" }
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
