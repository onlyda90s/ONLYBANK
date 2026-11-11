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

// 1. Google 로그인 & 로그아웃 & 초대코드
if (loginBtn) {
    loginBtn.addEventListener("click", async () => {
        try { await signInWithPopup(auth, provider); }
        catch (error) { alert(`로그인 오류: ${error.message}`); }
    });
}
if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
        try { await signOut(auth); } catch (e) { console.error(e); }
    });
}
if (enterCodeBtn) {
    enterCodeBtn.addEventListener("click", () => {
        const code = inviteCodeInput ? inviteCodeInput.value.trim() : "";
        if (!code) return alert("초대 코드를 입력해 주세요.");
        alert(`[${code}] 코드로 모임 권한을 확인합니다.`);
    });
}

// 2. 인증 상태 감시
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

// 3. 사이드바 접기/펼치기
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

// 4. 메인 메뉴 라우팅
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
            targetView.style.display = 'flex';
        } else {
            const placeholder = document.getElementById('view-placeholder');
            const menuName = btn.querySelector('.sidebar-text') ? btn.querySelector('.sidebar-text').textContent.trim() : btn.textContent.trim();
            if (placeholderTitle) placeholderTitle.textContent = menuName;
            if (placeholder) placeholder.style.display = 'flex';
        }
    });
});

// ==========================================================
// 5. [자산현황] 데이터 모델 & 인터랙션 로직
// ==========================================================
let assetYear = 2026;

// 연도별 12개월 순자산 추이 및 전월 대비 증감 데이터 (단위: 만원)
const assetYearlyData = {
    2025: [
        { m: 1, net: 9800, diff: 0 },
        { m: 2, net: 10100, diff: 300 },
        { m: 3, net: 10450, diff: 350 },
        { m: 4, net: 10400, diff: -50 },
        { m: 5, net: 10700, diff: 300 },
        { m: 6, net: 10950, diff: 250 },
        { m: 7, net: 11200, diff: 250 },
        { m: 8, net: 11500, diff: 300 },
        { m: 9, net: 11400, diff: -100 },
        { m: 10, net: 11600, diff: 200 },
        { m: 11, net: 11750, diff: 150 },
        { m: 12, net: 11800, diff: 50 }
    ],
    2026: [
        { m: 1, net: 11800, diff: 0 },
        { m: 2, net: 12100, diff: 300 },
        { m: 3, net: 12050, diff: -50 },
        { m: 4, net: 12300, diff: 250 },
        { m: 5, net: 12450, diff: 150 },
        { m: 6, net: 12553, diff: 103 },
        { m: 7, net: 12573, diff: 20 },
        { m: 8, net: 13018, diff: 445 },
        { m: 9, net: 12978, diff: -40 },
        { m: 10, net: 13930, diff: 952 },
        { m: 11, net: 14250, diff: 320 },
        { m: 12, net: 0, diff: 0 }
    ]
};

// 계좌별 월간 잔액 데이터 (1원 단위 정밀 데이터)
const bankAccounts = [
    { name: "우리은행 (급여통장)", dot: "bg-blue-500", values: { "26.06": 10140000, "26.07": 9440000, "26.08": 19070000, "26.09": 16750000, "26.10": 16750000, "26.11": 16954200, "26.12": 0 } },
    { name: "카카오뱅크 (모임·생활)", dot: "bg-yellow-400", values: { "26.06": 5250000, "26.07": 5250000, "26.08": 5260000, "26.09": 5270000, "26.10": 5270000, "26.11": 5270000, "26.12": 0 } },
    { name: "토스뱅크 (비상금통장)", dot: "bg-indigo-500", values: { "26.06": 24080000, "26.07": 24570000, "26.08": 24600000, "26.09": 25150000, "26.10": 25150000, "26.11": 25308500, "26.12": 0 } },
    { name: "신한은행 (청년적금)", dot: "bg-sky-500", values: { "26.06": 5000000, "26.07": 25000000, "26.08": 25000000, "26.09": 55000000, "26.10": 55000000, "26.11": 60000000, "26.12": 0 } }
];

const monthsHeader = ["26.06", "26.07", "26.08", "26.09", "26.10", "26.11", "26.12"];

// 1원 단위 천단위 콤마 포맷터
const formatWon = (val) => {
    if (!val || isNaN(val)) return "0";
    return Number(val).toLocaleString();
};

// 1) 자산현황 연도 헤더 & 12개월 증감 차트 렌더링
const renderAssetYear = (year) => {
    const displayEl = document.getElementById("assetYearDisplay");
    const chartTitleEl = document.getElementById("assetYearChartTitle");
    
    if (displayEl) displayEl.textContent = `${year}년`;
    if (chartTitleEl) chartTitleEl.textContent = `${year}년 순자산 추이 및 월별 증감`;

    const monthsData = assetYearlyData[year] || Array(12).fill({ net: 0, diff: 0 }).map((_, idx) => ({ m: idx + 1, net: 0, diff: 0 }));
    const chartContainer = document.getElementById("asset12MonthChart");
    if (!chartContainer) return;

    chartContainer.innerHTML = "";

    // 최대값 산출 (높이 비율 계산용)
    const maxNet = Math.max(...monthsData.map(d => d.net), 15000);

    monthsData.forEach(item => {
        const hasData = item.net > 0;
        const barH = hasData ? Math.min(Math.round((item.net / maxNet) * 100), 92) : 6;
        const isPositive = item.diff > 0;
        const isNegative = item.diff < 0;

        const col = document.createElement("div");
        col.className = "flex-1 flex flex-col items-center h-full justify-end group transition-all";

        // 증감 뱃지 및 막대 색상 분기
        let badgeHtml = '';
        let barColor = 'bg-slate-200';

        if (hasData) {
            if (isPositive) {
                badgeHtml = `<span class="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.5 rounded-md mb-1.5 tabular-nums whitespace-nowrap shadow-3xs">▲ +${item.diff}만</span>`;
                barColor = 'bg-emerald-600/90 group-hover:bg-emerald-600';
            } else if (isNegative) {
                badgeHtml = `<span class="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200/80 px-1.5 py-0.5 rounded-md mb-1.5 tabular-nums whitespace-nowrap shadow-3xs">▼ ${Math.abs(item.diff)}만</span>`;
                barColor = 'bg-rose-600/90 group-hover:bg-rose-600';
            } else {
                badgeHtml = `<span class="text-[10px] font-medium text-slate-400 mb-1.5 tabular-nums">-</span>`;
                barColor = 'bg-slate-300 group-hover:bg-slate-400';
            }
        } else {
            badgeHtml = `<span class="text-[9px] text-slate-300 mb-1.5">예정</span>`;
            barColor = 'bg-slate-100 border border-dashed border-slate-200';
        }

        col.innerHTML = `
            <div class="w-full flex flex-col items-center justify-end h-32">
                ${badgeHtml}
                ${hasData ? `<span class="text-[11px] font-bold text-brand-ink mb-1 tabular-nums">${item.net.toLocaleString()}</span>` : ''}
                <div class="w-6 ${barColor} rounded-t transition-all duration-300" style="height: ${barH}%;"></div>
            </div>
            <span class="text-[11px] mt-2 font-medium ${hasData ? 'text-brand-ink font-semibold' : 'text-slate-300'}">${item.m}월</span>
        `;

        chartContainer.appendChild(col);
    });
};

// 2) 하단 결산 시트 렌더링 (모든 셀 편집 가능 input 구성)
const renderAssetTable = () => {
    const tbody = document.getElementById("assetTableBody");
    if (!tbody) return;
    tbody.innerHTML = "";

    bankAccounts.forEach(acc => {
        const tr = document.createElement("tr");
        tr.className = "hover:bg-black/[0.015] transition-colors";

        let cellsHtml = `
            <td class="p-3 font-medium text-brand-ink sticky-col bg-white border-r border-brand-border/40 flex items-center space-x-2">
                <span class="w-2.5 h-2.5 rounded-full ${acc.dot} shrink-0"></span>
                <span class="truncate">${acc.name}</span>
            </td>
        `;

        monthsHeader.forEach(mKey => {
            const val = acc.values[mKey] || 0;
            const isSelectedMonth = mKey === "26.11";
            
            cellsHtml += `
                <td class="p-1.5 text-center ${isSelectedMonth ? 'bg-brand-personal/5' : ''}">
                    <input type="text" data-acc="${acc.name}" data-month="${mKey}" value="${formatWon(val)}" 
                        class="asset-input w-full text-right bg-transparent hover:bg-white focus:bg-white border border-transparent hover:border-slate-300 focus:border-brand-personal rounded px-2 py-1 tabular-nums text-xs font-medium focus:outline-none focus:ring-1 focus:ring-brand-personal transition-all shadow-2xs" />
                </td>
            `;
        });

        // 11월 기준 전월(10월) 대비 증감 계산
        const vCurr = acc.values["26.11"] || 0;
        const vPrev = acc.values["26.10"] || 0;
        const diff = vCurr - vPrev;
        const isPlus = diff > 0;
        const diffClass = diff === 0 ? "text-slate-400" : (isPlus ? "text-brand-positive font-bold" : "text-brand-negative font-bold");
        const diffSign = isPlus ? "+" : "";

        cellsHtml += `
            <td class="p-3 text-right pr-4 tabular-nums text-xs ${diffClass}">
                ${diffSign}${formatWon(diff)}원
            </td>
        `;

        tr.innerHTML = cellsHtml;
        tbody.appendChild(tr);
    });

    // input 값 직접 변경 시 실시간 반영 (1원 단위 포맷팅 유지)
    const inputs = tbody.querySelectorAll('.asset-input');
    inputs.forEach(input => {
        input.addEventListener('focus', (e) => {
            const rawVal = e.target.value.replace(/,/g, '');
            e.target.value = rawVal === "0" ? "" : rawVal;
        });
        input.addEventListener('blur', (e) => {
            const num = Number(e.target.value.replace(/,/g, '')) || 0;
            e.target.value = formatWon(num);
            const accName = e.target.getAttribute('data-acc');
            const mKey = e.target.getAttribute('data-month');
            const targetAcc = bankAccounts.find(a => a.name === accName);
            if (targetAcc) {
                targetAcc.values[mKey] = num;
            }
        });
    });
};

// 연도 이동 버튼 리스너
const prevAssetYearBtn = document.getElementById("prevAssetYearBtn");
const nextAssetYearBtn = document.getElementById("nextAssetYearBtn");

if (prevAssetYearBtn) {
    prevAssetYearBtn.addEventListener("click", () => {
        assetYear--;
        renderAssetYear(assetYear);
    });
}
if (nextAssetYearBtn) {
    nextAssetYearBtn.addEventListener("click", () => {
        assetYear++;
        renderAssetYear(assetYear);
    });
}

// 탭 클릭 전환
const assetTabContainer = document.getElementById('assetTabs');
if (assetTabContainer) {
    const tabs = assetTabContainer.querySelectorAll('button:not(:last-child)');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => {
                t.className = "px-3.5 py-1.5 rounded-lg text-xs font-bold text-brand-sub hover:bg-black/5 whitespace-nowrap";
            });
            tab.className = "px-3.5 py-1.5 rounded-lg text-xs font-bold bg-white text-brand-personal shadow-sm border border-slate-200/80 whitespace-nowrap";
        });
    });
}

// 초기 자산현황 렌더링 호출
renderAssetYear(assetYear);
renderAssetTable();

// ==========================================================
// 6. [연간 리포트] 차트 렌더링 (기존 안정 코드 유지)
// ==========================================================
let currentYear = 2026;
const yearlyData = {
    2025: {
        income: "49,200,000", savings: "19,800,000", expense: "17,600,000",
        savingsRate: "40%", expenseRate: "36%",
        bars: [{ inc: 420, exp: 200 }, { inc: 450, exp: 210 }, { inc: 410, exp: 230 }, { inc: 510, exp: 180 }, { inc: 430, exp: 240 }, { inc: 400, exp: 210 }, { inc: 460, exp: 220 }, { inc: 390, exp: 190 }, { inc: 420, exp: 210 }, { inc: 440, exp: 230 }, { inc: 470, exp: 250 }, { inc: 520, exp: 260 }]
    },
    2026: {
        income: "52,400,000", savings: "21,000,000", expense: "18,500,000",
        savingsRate: "40%", expenseRate: "35%",
        bars: [{ inc: 480, exp: 210 }, { inc: 510, exp: 240 }, { inc: 430, exp: 290 }, { inc: 590, exp: 190 }, { inc: 460, exp: 260 }, { inc: 410, exp: 220 }, { inc: 0, exp: 0 }, { inc: 0, exp: 0 }, { inc: 0, exp: 0 }, { inc: 0, exp: 0 }, { inc: 0, exp: 0 }, { inc: 0, exp: 0 }]
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

    const data = yearlyData[year] || { income: "0", savings: "0", expense: "0", savingsRate: "0%", expenseRate: "0%", bars: Array(12).fill({ inc: 0, exp: 0 }) };
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
                <div class="w-full flex items-end justify-center gap-1.5 h-34">
                    <div class="flex flex-col items-center justify-end h-full">
                        ${hasData ? `<span class="text-[11px] font-bold text-brand-positive mb-1 tabular-nums">${m.inc}</span>` : ''}
                        <div class="w-3.5 ${hasData ? 'bg-brand-positive' : 'bg-brand-positive/15'} rounded-t transition-all duration-300" style="height: ${hasData ? incH : 10}%;"></div>
                    </div>
                    <div class="flex flex-col items-center justify-end h-full">
                        ${hasData ? `<span class="text-[11px] font-bold text-brand-negative mb-1 tabular-nums">${m.exp}</span>` : ''}
                        <div class="w-3.5 ${hasData ? 'bg-brand-negative' : 'bg-brand-negative/15'} rounded-t transition-all duration-300" style="height: ${hasData ? expH : 10}%;"></div>
                    </div>
                </div>
                <span class="text-[11px] mt-2 font-medium ${hasData ? 'text-brand-sub' : 'text-brand-sub/40'}">${monthNumber}월</span>
            `;
            chartContainer.appendChild(col);
        });
    }
};

if (prevYearBtn) {
    prevYearBtn.addEventListener("click", () => { currentYear--; renderYearData(currentYear); });
}
if (nextYearBtn) {
    nextYearBtn.addEventListener("click", () => { currentYear++; renderYearData(currentYear); });
}
renderYearData(currentYear);

// 설정 토글 & 엑셀 백업
const toggleConfigs = [
    { checkboxId: 'toggle-cards', liId: 'li-cards', key: 'onlybank_cfg_cards' },
    { checkboxId: 'toggle-tax', liId: 'li-tax', key: 'onlybank_cfg_tax' }
];
toggleConfigs.forEach(item => {
    const checkbox = document.getElementById(item.checkboxId);
    const liElement = document.getElementById(item.liId);
    if (!checkbox || !liElement) return;
    checkbox.addEventListener('change', () => {
        liElement.style.setProperty("display", checkbox.checked ? "block" : "none", "important");
    });
});

const exportCsvBtn = document.getElementById('exportCsvBtn');
if (exportCsvBtn) {
    exportCsvBtn.addEventListener('click', () => {
        const csvContent = "data:text/csv;charset=utf-8,\uFEFF날짜,계좌명,금액\n2026-11-01,우리은행,16954200";
        const link = document.createElement("a");
        link.setAttribute("href", encodeURI(csvContent));
        link.setAttribute("download", "onlybank_assets_backup.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
}
