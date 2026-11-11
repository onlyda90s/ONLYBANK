// 현재 활성 메뉴를 기억하기 위한 세션 스토리지 키
const ACTIVE_MENU_KEY = "onlybank_active_menu";

export const initNavigationModule = () => {
    // 1. 사이드바 접기/펼치기
    const sidebar = document.getElementById("sidebar");
    const sidebarToggleBtn = document.getElementById("sidebarToggleBtn");
    const sidebarTexts = document.querySelectorAll(".sidebar-text");

    if (sidebarToggleBtn && sidebar) {
        sidebarToggleBtn.addEventListener("click", () => {
            const isCollapsed = sidebar.classList.contains("w-20");
            if (isCollapsed) {
                sidebar.classList.remove("w-20");
                sidebar.classList.add("w-64");
                sidebarTexts.forEach(el => el.style.setProperty("display", "", ""));
                sidebarToggleBtn.textContent = "◀";
            } else {
                sidebar.classList.remove("w-64");
                sidebar.classList.add("w-20");
                sidebarTexts.forEach(el => el.style.setProperty("display", "none", "important"));
                sidebarToggleBtn.textContent = "▶";
            }
        });
    }

    // 2. 화면 전환(라우팅) 핵심 엔진
    const menuBtns = document.querySelectorAll('.menu-btn');
    const viewSections = document.querySelectorAll('.view-section');
    const placeholderTitle = document.getElementById('placeholder-title');

    const switchView = (btn, saveToSession = true) => {
        if (!btn) return;

        // 모든 메뉴 버튼 스타일 초기화
        menuBtns.forEach(b => {
            if (b.id === 'nav-settings') {
                b.className = "menu-btn flex items-center px-3 py-1.5 mb-1.5 rounded-xl text-xs font-medium text-brand-sub hover:text-brand-ink hover:bg-black/[0.03] transition-colors";
            } else if (b.id === 'nav-add-group') {
                b.className = "menu-btn flex items-center px-3 py-2 rounded-xl text-brand-group hover:bg-brand-group/5 transition-colors text-[13px]";
            } else {
                b.className = "menu-btn flex items-center px-3 py-2 rounded-xl text-brand-sub hover:text-brand-ink hover:bg-black/[0.03] transition-colors text-[13px]";
            }
        });

        // 선택된 메뉴 버튼 활성화 스타일 적용
        if (btn.id.includes('group')) {
            btn.className = "menu-btn flex items-center px-3 py-2 rounded-xl bg-brand-group text-white shadow-sm font-semibold text-[13px]";
        } else if (btn.id === 'nav-settings') {
            btn.className = "menu-btn flex items-center px-3 py-1.5 mb-1.5 rounded-xl text-xs bg-slate-200 text-brand-ink shadow-sm font-semibold";
        } else {
            btn.className = "menu-btn flex items-center px-3 py-2 rounded-xl bg-brand-personal text-white shadow-sm font-semibold text-[13px]";
        }

        // 모든 화면 숨김
        viewSections.forEach(sec => { sec.style.display = 'none'; });

        // 대상 화면 노출
        const targetViewId = btn.id.replace('nav-', 'view-');
        const targetView = document.getElementById(targetViewId);

        if (targetView) {
            targetView.style.display = 'flex';
        } else {
            const placeholder = document.getElementById('view-placeholder');
            const menuName = btn.querySelector('.sidebar-text')?.textContent.trim() || btn.textContent.trim();
            if (placeholderTitle) placeholderTitle.textContent = menuName;
            if (placeholder) placeholder.style.display = 'flex';
        }

        // 현재 보고 있는 메뉴 ID를 세션에 영구 보존 ('모임 추가' 모달 클릭 제외)
        if (saveToSession && btn.id !== 'nav-add-group') {
            sessionStorage.setItem(ACTIVE_MENU_KEY, btn.id);
        }
    };

    // 메뉴 버튼 클릭 리스너 연결
    menuBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            switchView(btn, true);
        });
    });

    // 새로고침 시 마지막으로 보던 메뉴 자동 복원
    const isGuest = sessionStorage.getItem("onlybank_guest_code");
    const savedMenuId = sessionStorage.getItem(ACTIVE_MENU_KEY);

    // 게스트가 아닌 정상 로그인 사용자라면 직전 머물렀던 메뉴로 즉시 복원
    if (!isGuest && savedMenuId) {
        const savedBtn = document.getElementById(savedMenuId);
        if (savedBtn) {
            switchView(savedBtn, false);
        }
    }

    // 로그아웃 클릭 시 저장된 페이지 기록 초기화
    document.getElementById("logoutBtn")?.addEventListener("click", () => {
        sessionStorage.removeItem(ACTIVE_MENU_KEY);
    });

    // 3. 설정 메뉴 토글 (LocalStorage 영구 보존)
    const toggleConfigs = [
        { checkboxId: 'toggle-cards', liId: 'li-cards', key: 'onlybank_cfg_cards' },
        { checkboxId: 'toggle-vehicle', liId: 'li-vehicle', key: 'onlybank_cfg_vehicle' },
        { checkboxId: 'toggle-tax', liId: 'li-tax', key: 'onlybank_cfg_tax' },
        { checkboxId: 'toggle-ipo', liId: 'li-ipo', key: 'onlybank_cfg_ipo' },
        { checkboxId: 'toggle-reward', liId: 'li-reward', key: 'onlybank_cfg_reward' },
        { checkboxId: 'toggle-extra', liId: 'li-extra', key: 'onlybank_cfg_extra' },
        { checkboxId: 'toggle-moim', liId: 'group-moim', key: 'onlybank_cfg_moim' }
    ];

    toggleConfigs.forEach(item => {
        const checkbox = document.getElementById(item.checkboxId);
        const liElement = document.getElementById(item.liId);
        if (!checkbox || !liElement) return;

        try {
            const savedState = localStorage.getItem(item.key);
            if (savedState !== null) checkbox.checked = (savedState === 'true');
        } catch (e) {}

        const updateVisibility = () => {
            liElement.style.setProperty("display", checkbox.checked ? "block" : "none", "important");
        };

        updateVisibility();

        checkbox.addEventListener('change', () => {
            try { localStorage.setItem(item.key, checkbox.checked); } catch (e) {}
            updateVisibility();
        });
    });

    // CSV 백업 다운로드
    document.getElementById('exportCsvBtn')?.addEventListener('click', () => {
        const csv = "data:text/csv;charset=utf-8,\uFEFF날짜,계좌명,금액\n2026-11-01,우리은행,16954200";
        const link = document.createElement("a");
        link.setAttribute("href", encodeURI(csv));
        link.setAttribute("download", "onlybank_assets_backup.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
};
