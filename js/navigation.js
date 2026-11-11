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

    // 2. 뷰 라우팅 (메뉴 버튼 클릭 시 해당 화면 표시)
    const menuBtns = document.querySelectorAll('.menu-btn');
    const viewSections = document.querySelectorAll('.view-section');
    const placeholderTitle = document.getElementById('placeholder-title');

    menuBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();

            // 활성 스타일 초기화
            menuBtns.forEach(b => {
                if (b.id === 'nav-settings') {
                    b.className = "menu-btn flex items-center px-3 py-1.5 mb-1.5 rounded-xl text-xs font-medium text-brand-sub hover:text-brand-ink hover:bg-black/[0.03] transition-colors";
                } else if (b.id === 'nav-add-group') {
                    b.className = "menu-btn flex items-center px-3 py-2 rounded-xl text-brand-group hover:bg-brand-group/5 transition-colors text-[13px]";
                } else {
                    b.className = "menu-btn flex items-center px-3 py-2 rounded-xl text-brand-sub hover:text-brand-ink hover:bg-black/[0.03] transition-colors text-[13px]";
                }
            });

            // 클릭 버튼 활성화 색상 지정
            if (btn.id.includes('group')) {
                btn.className = "menu-btn flex items-center px-3 py-2 rounded-xl bg-brand-group text-white shadow-sm font-semibold text-[13px]";
            } else if (btn.id === 'nav-settings') {
                btn.className = "menu-btn flex items-center px-3 py-1.5 mb-1.5 rounded-xl text-xs bg-slate-200 text-brand-ink shadow-sm font-semibold";
            } else {
                btn.className = "menu-btn flex items-center px-3 py-2 rounded-xl bg-brand-personal text-white shadow-sm font-semibold text-[13px]";
            }

            // 모든 뷰 숨김
            viewSections.forEach(sec => { sec.style.display = 'none'; });

            // 대상 뷰 노출
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
        });
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

        // 저장된 설정 불러오기
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
};
