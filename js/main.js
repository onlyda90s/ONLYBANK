import { auth, provider, signInWithPopup, signOut, onAuthStateChanged } from "./firebase.js";

// DOM 요소 식별
const loginScreen = document.getElementById("loginScreen");
const dashboardScreen = document.getElementById("dashboardScreen");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const userName = document.getElementById("userName");
const userAvatar = document.getElementById("userAvatar");
const inviteCodeInput = document.getElementById("inviteCodeInput");
const enterCodeBtn = document.getElementById("enterCodeBtn");

// 1. Google 로그인
if (loginBtn) {
    loginBtn.addEventListener("click", async () => {
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Google 로그인 실패:", error);
            alert(`로그인 오류: ${error.message}`);
        }
    });
}

// 2. 로그아웃
if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("로그아웃 실패:", error);
        }
    });
}

// 3. 초대 코드
if (enterCodeBtn) {
    enterCodeBtn.addEventListener("click", () => {
        const code = inviteCodeInput ? inviteCodeInput.value.trim() : "";
        if (!code) {
            alert("초대 코드를 입력해 주세요.");
            return;
        }
        alert(`[${code}] 코드로 모임 권한을 확인합니다.`);
    });
}

// 4. 인증 상태 감시
onAuthStateChanged(auth, (user) => {
    if (user) {
        if (loginScreen) loginScreen.style.setProperty("display", "none", "important");
        if (dashboardScreen) dashboardScreen.style.setProperty("display", "flex", "important");
        if (userName) userName.textContent = user.displayName || "사용자";
        if (userAvatar && user.photoURL) userAvatar.src = user.photoURL;
    } else {
        if (loginScreen) loginScreen.style.setProperty("display", "flex", "important");
        if (dashboardScreen) dashboardScreen.style.setProperty("display", "none", "important");
    }
});

// 5. 사이드바 접기/펼치기
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

// 6. 메뉴 라우팅
const menuBtns = document.querySelectorAll('.menu-btn');
const viewSections = document.querySelectorAll('.view-section');
const placeholderTitle = document.getElementById('placeholder-title');

menuBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        
        menuBtns.forEach(b => {
            if (b.id === 'nav-settings') {
                b.className = "menu-btn flex items-center px-3 py-1.5 mb-1.5 rounded-xl text-xs font-medium text-brand-sub hover:text-brand-ink hover:bg-black/[0.03] transition-colors";
            } else if (b.id === 'nav-add-group') {
                b.className = "menu-btn flex items-center px-3 py-2 rounded-xl text-brand-group hover:bg-brand-group/5 transition-colors text-[13px]";
            } else {
                b.className = "menu-btn flex items-center px-3 py-2 rounded-xl text-brand-sub hover:text-brand-ink hover:bg-black/[0.03] transition-colors text-[13px]";
            }
        });
        
        if (btn.id.includes('group')) {
            btn.className = "menu-btn flex items-center px-3 py-2 rounded-xl bg-brand-group text-white shadow-sm font-semibold text-[13px]";
        } else if (btn.id === 'nav-settings') {
            btn.className = "menu-btn flex items-center px-3 py-1.5 mb-1.5 rounded-xl text-xs bg-slate-200 text-brand-ink shadow-sm font-semibold";
        } else {
            btn.className = "menu-btn flex items-center px-3 py-2 rounded-xl bg-brand-personal text-white shadow-sm font-semibold text-[13px]";
        }

        viewSections.forEach(section => { section.style.display = 'none'; });
        const targetViewId = btn.id.replace('nav-', 'view-');
        const targetView = document.getElementById(targetViewId);
        
        if (targetView) {
            targetView.style.display = 'block';
        } else {
            const placeholder = document.getElementById('view-placeholder');
            const menuName = btn.querySelector('.sidebar-text') ? btn.querySelector('.sidebar-text').textContent.trim() : btn.textContent.trim();
            if (placeholderTitle) placeholderTitle.textContent = menuName;
            if (placeholder) placeholder.style.display = 'block';
        }
    });
});

// ==========================================
// 7. 연간 리포트 연도 데이터 세트 & 실시간 갱신 기능
// ==========================================
let currentYear = 2026;

const yearlyData = {
    2025: {
        income: "49,200,000", savings: "19,800,000", expense: "17,600,000",
        savingsRate: "40%", expenseRate: "36%",
        bars: [
            { inc: 420, exp: 200 }, { inc: 450, exp: 210 }, { inc: 410, exp: 230 },
            { inc: 510, exp: 180 }, { inc: 430, exp: 240 }, { inc: 400, exp: 210 },
            { inc: 460, exp: 220 }, { inc: 390, exp: 190 }, { inc: 420, exp: 210 },
            { inc: 440, exp: 230 }, { inc: 470, exp: 250 }, { inc: 520, exp: 260 }
        ]
    },
    2026: {
        income: "52,400,000", savings: "21,000,000", expense: "18,500,000",
        savingsRate: "40%", expenseRate: "35%",
        bars: [
            { inc: 480, exp: 210 }, { inc: 510, exp: 240 }, { inc: 430, exp: 290 },
            { inc: 590, exp: 190 }, { inc: 460, exp: 260 }, { inc: 410, exp: 220 },
            { inc: 0, exp: 0 }, { inc: 0, exp: 0 }, { inc: 0, exp: 0 },
            { inc: 0, exp: 0 }, { inc: 0, exp: 0 }, { inc: 0, exp: 0 }
        ]
    },
    2027: {
        income: "0", savings: "0", expense: "0",
        savingsRate: "0%", expenseRate: "0%",
        bars: Array(12).fill({ inc: 0, exp: 0 })
    }
};

const currentYearDisplay = document.getElementById("currentYearDisplay");
const accumYearDisplay = document.getElementById("accumYearDisplay");
const prevYearBtn = document.getElementById("prevYearBtn");
const nextYearBtn = document.getElementById("nextYearBtn");
const chartContainer = document.getElementById("chartContainer");

const renderYearData = (year) => {
    if (currentYearDisplay) currentYearDisplay.textContent = `${year}년`;
    if (accumYearDisplay) accumYearDisplay.textContent = `(${year}년)`;

    const data = yearlyData[year] || {
        income: "0", savings: "0", expense: "0", savingsRate: "0%", expenseRate: "0%",
        bars: Array(12).fill({ inc: 0, exp: 0 })
    };

    const yIncome = document.getElementById("y-income");
    const ySavings = document.getElementById("y-savings");
    const yExpense = document.getElementById("y-expense");
    const ySavingsBar = document.getElementById("y-savings-bar");
    const yExpenseBar = document.getElementById("y-expense-bar");
    const ySavingsTxt = document.getElementById("y-savings-txt");
    const yExpenseTxt = document.getElementById("y-expense-txt");

    if (yIncome) yIncome.innerHTML = `${data.income}<span class="text-xs font-sans ml-1 text-brand-ink">원</span>`;
    if (ySavings) ySavings.innerHTML = `${data.savings}<span class="text-xs font-sans ml-1 text-brand-ink">원</span>`;
    if (yExpense) yExpense.innerHTML = `${data.expense}<span class="text-xs font-sans ml-1 text-brand-ink">원</span>`;
    if (ySavingsBar) ySavingsBar.style.width = data.savingsRate;
    if (yExpenseBar) yExpenseBar.style.width = data.expenseRate;
    if (ySavingsTxt) ySavingsTxt.textContent = `저축 ${data.savingsRate}`;
    if (yExpenseTxt) yExpenseTxt.textContent = `소비 ${data.expenseRate}`;

    if (chartContainer) {
        chartContainer.innerHTML = "";
        data.bars.forEach((m, idx) => {
            const monthNumber = idx + 1;
            const incH = m.inc > 0 ? Math.min(Math.round((m.inc / 600) * 100), 95) : 0;
            const expH = m.exp > 0 ? Math.min(Math.round((m.exp / 600) * 100), 95) : 0;
            const hasData = m.inc > 0 || m.exp > 0;

            const col = document.createElement("div");
            col.className = "flex-1 flex flex-col items-center h-full justify-end";
            col.innerHTML = `
                <div class="w-full flex items-end justify-center gap-1.5 h-24">
                    <div class="flex flex-col items-center justify-end h-full">
                        ${hasData ? `<span class="text-[11px] font-bold text-brand-positive mb-0.5 tabular-nums">${m.inc}</span>` : ''}
                        <div class="w-3.5 ${hasData ? 'bg-brand-positive' : 'bg-brand-positive/15'} rounded-t transition-all duration-300" style="height: ${hasData ? incH : 10}%;"></div>
                    </div>
                    <div class="flex flex-col items-center justify-end h-full">
                        ${hasData ? `<span class="text-[11px] font-bold text-brand-negative mb-0.5 tabular-nums">${m.exp}</span>` : ''}
                        <div class="w-3.5 ${hasData ? 'bg-brand-negative' : 'bg-brand-negative/15'} rounded-t transition-all duration-300" style="height: ${hasData ? expH : 10}%;"></div>
                    </div>
                </div>
                <span class="text-[11px] mt-1.5 font-medium ${hasData ? 'text-brand-sub' : 'text-brand-sub/40'}">${monthNumber}월</span>
            `;
            chartContainer.appendChild(col);
        });
    }
};

if (prevYearBtn) {
    prevYearBtn.addEventListener("click", () => {
        currentYear--;
        renderYearData(currentYear);
    });
}

if (nextYearBtn) {
    nextYearBtn.addEventListener("click", () => {
        currentYear++;
        renderYearData(currentYear);
    });
}

renderYearData(currentYear);

// ==========================================
// 8. 하단 위젯 바로가기 라우팅
// ==========================================
const ddayItems = document.querySelectorAll(".dday-item");
ddayItems.forEach(item => {
    item.addEventListener("click", () => {
        const targetNavId = item.getAttribute("data-goto");
        const targetBtn = document.getElementById(targetNavId);
        if (targetBtn) targetBtn.click();
    });
});

const summaryMoimTile = document.getElementById("summary-moim-tile");
if (summaryMoimTile) {
    summaryMoimTile.addEventListener("click", () => {
        const groupBtn = document.getElementById("nav-group1");
        if (groupBtn) groupBtn.click();
    });
}

// 9. 설정 화면 메뉴 ON/OFF 토글
const toggleConfigs = [
    { checkboxId: 'toggle-cards', liId: 'li-cards', key: 'onlybank_cfg_cards' },
    { checkboxId: 'toggle-vehicle', liId: 'li-vehicle', key: 'onlybank_cfg_vehicle' },
    { checkboxId: 'toggle-tax', liId: 'li-tax', key: 'onlybank_cfg_tax' },
    { checkboxId: 'toggle-ipo', liId: 'li-ipo', key: 'onlybank_cfg_ipo' },
    { checkboxId: 'toggle-reward', liId: 'li-reward', key: 'onlybank_cfg_reward' },
    { checkboxId: 'toggle-extra', liId: 'li-extra', key: 'onlybank_cfg_extra' },
    { checkboxId: 'toggle-moim', liId: 'group-moim', key: 'onlybank_cfg_moim' }
];

const checkIncomeDivider = () => {
    const ipo = document.getElementById('toggle-ipo');
    const reward = document.getElementById('toggle-reward');
    const extra = document.getElementById('toggle-extra');
    const divider = document.getElementById('divider-income');
    
    if (divider && ipo && reward && extra) {
        if (!ipo.checked && !reward.checked && !extra.checked) {
            divider.style.setProperty("display", "none", "important");
        } else {
            divider.style.setProperty("display", "block", "important");
        }
    }
};

toggleConfigs.forEach(item => {
    const checkbox = document.getElementById(item.checkboxId);
    const liElement = document.getElementById(item.liId);
    if (!checkbox || !liElement) return;

    try {
        const savedState = localStorage.getItem(item.key);
        if (savedState !== null) {
            checkbox.checked = (savedState === 'true');
        }
    } catch (e) {}

    const updateVisibility = () => {
        if (checkbox.checked) {
            liElement.style.setProperty("display", "block", "important");
        } else {
            liElement.style.setProperty("display", "none", "important");
        }
        checkIncomeDivider();
    };

    updateVisibility();

    checkbox.addEventListener('change', () => {
        try { localStorage.setItem(item.key, checkbox.checked); } catch (e) {}
        updateVisibility();
    });

    const row = checkbox.closest('.toggle-row');
    if (row) {
        row.addEventListener('click', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.closest('label')) return;
            checkbox.checked = !checkbox.checked;
            checkbox.dispatchEvent(new Event('change'));
        });
    }
});

// 10. 엑셀 다운로드
const exportCsvBtn = document.getElementById('exportCsvBtn');
if (exportCsvBtn) {
    exportCsvBtn.addEventListener('click', () => {
        const csvContent = "data:text/csv;charset=utf-8,\uFEFF날짜,구분,카테고리,결제수단,금액,메모\n"
            + "2026-11-01,수입,급여,우리은행,3000000,11월 급여\n"
            + "2026-11-02,지출,식비,신한카드,15000,점심식사";
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "onlybank_backup.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
}
