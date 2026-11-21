export const initNavigationModule = () => {
    const sidebar = document.getElementById('sidebar');
    const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
    
    // 사이드바 접기/펼치기
    sidebarToggleBtn?.addEventListener('click', () => {
        const isCollapsed = sidebar.classList.contains('w-20');
        if (isCollapsed) {
            sidebar.classList.remove('w-20');
            sidebar.classList.add('w-64');
            sidebarToggleBtn.textContent = '◀';
        } else {
            sidebar.classList.remove('w-64');
            sidebar.classList.add('w-20');
            sidebarToggleBtn.textContent = '▶';
        }
    });

    const views = {
        'nav-home': 'view-home',
        'nav-assets': 'view-assets',
        'nav-cards': 'view-cards',
        'nav-settings': 'view-settings'
    };

    const switchView = (targetViewId, clickedBtn) => {
        document.querySelectorAll('.view-section').forEach(view => {
            view.style.display = 'none';
        });

        const targetView = document.getElementById(targetViewId);
        if (targetView) {
            targetView.style.display = 'flex';
        } else {
            const placeholder = document.getElementById('view-placeholder');
            const titleEl = document.getElementById('placeholder-title');
            if (placeholder) {
                placeholder.style.display = 'flex';
                if (titleEl && clickedBtn) titleEl.textContent = clickedBtn.innerText.trim();
            }
        }

        document.querySelectorAll('.menu-btn').forEach(btn => {
            btn.classList.remove('bg-brand-personal', 'text-white', 'shadow-sm', 'font-semibold');
            btn.classList.add('text-brand-sub', 'hover:text-brand-ink', 'hover:bg-black/[0.03]');
        });

        if (clickedBtn) {
            clickedBtn.classList.add('bg-brand-personal', 'text-white', 'shadow-sm', 'font-semibold');
            clickedBtn.classList.remove('text-brand-sub', 'hover:text-brand-ink', 'hover:bg-black/[0.03]');
        }

        window.dispatchEvent(new CustomEvent('onlybank:viewchange', { detail: { viewId: targetViewId } }));
    };

    document.querySelectorAll('.menu-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const btnId = btn.id;
            const targetViewId = views[btnId] || 'view-placeholder';
            switchView(targetViewId, btn);
        });
    });
};
