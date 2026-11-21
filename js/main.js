import { initAuthModule } from "./auth.js?v=20261111_cards_v1";

const startSystem = async () => {
    // 1. 로그인 모듈은 다른 파일 오류와 무관하게 최우선 실행
    initAuthModule();

    // 2. 화면 모듈은 개별 로드하여 격리 처리
    const modules = [
        { path: "./navigation.js?v=20261111_cards_v1", fn: "initNavigationModule" },
        { path: "./report.js?v=20261111_cards_v1", fn: "initReportModule" },
        { path: "./assets.js?v=20261111_cards_v1", fn: "initAssetsModule" },
        { path: "./cards.js?v=20261111_cards_v1", fn: "initCardsModule" }
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
