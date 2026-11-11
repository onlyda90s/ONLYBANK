let currentYear = 2026;

// 연도별 가계부 수입·지출 및 부수입 데이터베이스 (단위: 원)
const yearlyFinanceData = {
    2025: {
        currentMonth: {
            income: 4500000, savings: 1800000, expense: 1850000,
            sideIncome: { total: 650000, invest: 350000, ipo: 200000, reward: 100000 }
        },
        accumulated: {
            income: 48500000, savings: 19500000, expense: 17200000,
            sideIncome: { total: 5800000, invest: 3200000, ipo: 1700000, reward: 900000 }
        },
        monthlyBars: [
            { m: 1, in: 420, out: 160 }, { m: 2, in: 420, out: 175 }, { m: 3, in: 430, out: 165 },
            { m: 4, in: 420, out: 180 }, { m: 5, in: 450, out: 190 }, { m: 6, in: 430, out: 170 },
            { m: 7, in: 440, out: 185 }, { m: 8, in: 440, out: 195 }, { m: 9, in: 460, out: 170 },
            { m: 10, in: 440, out: 180 }, { m: 11, in: 450, out: 185 }, { m: 12, in: 500, out: 220 }
        ]
    },
    2026: {
        currentMonth: {
            income: 4800000, savings: 2000000, expense: 1900000,
            sideIncome: { total: 850000, invest: 500000, ipo: 250000, reward: 100000 }
        },
        accumulated: {
            income: 52400000, savings: 21000000, expense: 18500000,
            sideIncome: { total: 7450000, invest: 4200000, ipo: 2150000, reward: 1100000 }
        },
        monthlyBars: [
            { m: 1, in: 460, out: 180 }, { m: 2, in: 460, out: 190 }, { m: 3, in: 470, out: 175 },
            { m: 4, in: 465, out: 185 }, { m: 5, in: 490, out: 200 }, { m: 6, in: 470, out: 170 },
            { m: 7, in: 480, out: 195 }, { m: 8, in: 480, out: 205 }, { m: 9, in: 510, out: 180 },
            { m: 10, in: 480, out: 185 }, { m: 11, in: 480, out: 190 }, { m: 12, in: 0, out: 0 }
        ]
    }
};

const formatWon = (val) => (!val || isNaN(val) ? "0" : Number(val).toLocaleString());

// 1. 수입·지출 월별 차트 렌더링 (단위: 만원 + 마우스 호버 정밀 툴팁)
export const renderMonthlyChart = (year) => {
    const chartContainer = document.getElementById("chartContainer");
    if (!chartContainer) return;

    chartContainer.innerHTML = "";
    const yearData = yearlyFinanceData[year]?.monthlyBars || Array(12).fill({ in: 0, out: 0 }).map((_, i) => ({ m: i + 1, in: 0, out: 0 }));
    const maxVal = Math.max(...yearData.map(d => Math.max(d.in, d.out)), 550);

    yearData.forEach(item => {
        const hasData = item.in > 0 || item.out > 0;
        const inH = hasData ? Math.min(Math.round((item.in / maxVal) * 100), 88) : 5;
        const outH = hasData ? Math.min(Math.round((item.out / maxVal) * 100), 88) : 5;

        const exactIncome = item.in * 10000;
        const exactExpense = item.out * 10000;
        const exactSurplus = exactIncome - exactExpense;

        const col = document.createElement("div");
        col.className = "flex-1 flex flex-col items-center h-full justify-end group relative transition-all";

        // 마우스 호버 시 나타나는 1원 단위 툴팁
        const tooltipHtml = hasData ? `
            <div class="absolute bottom-[95%] mb-2 hidden group-hover:flex flex-col items-center z-50 pointer-events-none transition-all duration-200 shadow-xl">
                <div class="bg-slate-900/95 text-white rounded-xl py-2 px-3 border border-slate-700 text-center whitespace-nowrap shadow-2xl backdrop-blur-xs">
                    <p class="text-[10px] text-slate-300 font-medium mb-1">${item.m}월 결산 내역</p>
                    <div class="space-y-0.5 text-xs text-left">
                        <div class="flex justify-between space-x-2 text-emerald-400">
                            <span>수입:</span><span class="font-bold tabular-nums">${exactIncome.toLocaleString()}원</span>
                        </div>
                        <div class="flex justify-between space-x-2 text-rose-400">
                            <span>지출:</span><span class="font-bold tabular-nums">${exactExpense.toLocaleString()}원</span>
                        </div>
                    </div>
                    <div class="mt-1 pt-1 border-t border-slate-700 flex justify-between space-x-2 text-[11px]">
                        <span class="text-slate-400">순잉여:</span>
                        <span class="font-bold tabular-nums text-amber-300">${exactSurplus >= 0 ? '+' : ''}${exactSurplus.toLocaleString()}원</span>
                    </div>
                </div>
                <div class="w-2 h-2 bg-slate-900/95 rotate-45 -mt-1 border-r border-b border-slate-700"></div>
            </div>
        ` : '';

        col.innerHTML = `
            ${tooltipHtml}
            <div class="w-full flex items-end justify-center space-x-1 h-32 cursor-pointer pb-1">
                <!-- 수입 막대 -->
                <div class="w-3.5 ${hasData ? 'bg-brand-positive group-hover:brightness-110' : 'bg-slate-200'} rounded-t transition-all duration-300" style="height: ${inH}%;"></div>
                <!-- 지출 막대 -->
                <div class="w-3.5 ${hasData ? 'bg-brand-negative group-hover:brightness-110' : 'bg-slate-200'} rounded-t transition-all duration-300" style="height: ${outH}%;"></div>
            </div>
            <div class="mt-1 flex flex-col items-center select-none border-t border-brand-border/40 w-full pt-1">
                <span class="text-[11px] font-semibold ${hasData ? 'text-brand-ink' : 'text-slate-400'}">${item.m}월</span>
                <span class="text-[10px] font-medium tracking-tight text-slate-400 tabular-nums">${hasData ? `${item.in}/${item.out}` : '-'}</span>
            </div>
        `;
        chartContainer.appendChild(col);
    });
};

// 2. 상단 8대 지표 카드 렌더링 (부수입 및 항목별 세부 실적 주입)
export const renderSummaryCards = (year) => {
    const data = yearlyFinanceData[year] || yearlyFinanceData[2026];

    // [A] 이달의 현황 (11월)
    const mIncomeEl = document.getElementById("m-income");
    const mSavingsEl = document.getElementById("m-savings");
    const mExpenseEl = document.getElementById("m-expense");
    const mSideIncomeEl = document.getElementById("m-side-income");
    const mSideInvestEl = document.getElementById("m-side-invest");
    const mSideIpoEl = document.getElementById("m-side-ipo");
    const mSideRewardEl = document.getElementById("m-side-reward");

    if (mIncomeEl) mIncomeEl.innerHTML = `${formatWon(data.currentMonth.income)}<span class="text-xs font-sans ml-1 text-brand-ink">원</span>`;
    if (mSavingsEl) mSavingsEl.innerHTML = `${formatWon(data.currentMonth.savings)}<span class="text-xs font-sans ml-1 text-brand-ink">원</span>`;
    if (mExpenseEl) mExpenseEl.innerHTML = `${formatWon(data.currentMonth.expense)}<span class="text-xs font-sans ml-1 text-brand-ink">원</span>`;
    
    // 이달 부수입 세부 항목 반영
    if (mSideIncomeEl) mSideIncomeEl.innerHTML = `${formatWon(data.currentMonth.sideIncome.total)}<span class="text-xs font-sans ml-0.5 text-brand-ink">원</span>`;
    if (mSideInvestEl) mSideInvestEl.textContent = `${formatWon(data.currentMonth.sideIncome.invest)}원`;
    if (mSideIpoEl) mSideIpoEl.textContent = `${formatWon(data.currentMonth.sideIncome.ipo)}원`;
    if (mSideRewardEl) mSideRewardEl.textContent = `${formatWon(data.currentMonth.sideIncome.reward)}원`;

    // [B] 올해 누적
    const yIncomeEl = document.getElementById("y-income");
    const ySavingsEl = document.getElementById("y-savings");
    const yExpenseEl = document.getElementById("y-expense");
    const ySideIncomeEl = document.getElementById("y-side-income");
    const ySideInvestEl = document.getElementById("y-side-invest");
    const ySideIpoEl = document.getElementById("y-side-ipo");
    const ySideRewardEl = document.getElementById("y-side-reward");

    if (yIncomeEl) yIncomeEl.innerHTML = `${formatWon(data.accumulated.income)}<span class="text-xs font-sans ml-1 text-brand-ink">원</span>`;
    if (ySavingsEl) ySavingsEl.innerHTML = `${formatWon(data.accumulated.savings)}<span class="text-xs font-sans ml-1 text-brand-ink">원</span>`;
    if (yExpenseEl) yExpenseEl.innerHTML = `${formatWon(data.accumulated.expense)}<span class="text-xs font-sans ml-1 text-brand-ink">원</span>`;

    // 올해 누적 부수입 세부 항목 반영
    if (ySideIncomeEl) ySideIncomeEl.innerHTML = `${formatWon(data.accumulated.sideIncome.total)}<span class="text-xs font-sans ml-0.5 text-brand-ink">원</span>`;
    if (ySideInvestEl) ySideInvestEl.textContent = `${formatWon(data.accumulated.sideIncome.invest)}원`;
    if (ySideIpoEl) ySideIpoEl.textContent = `${formatWon(data.accumulated.sideIncome.ipo)}원`;
    if (ySideRewardEl) ySideRewardEl.textContent = `${formatWon(data.accumulated.sideIncome.reward)}원`;
};

export const initReportModule = () => {
    const updateYearDisplays = () => {
        const curEl = document.getElementById("currentYearDisplay");
        const accEl = document.getElementById("accumYearDisplay");
        if (curEl) curEl.textContent = `${currentYear}년`;
        if (accEl) accEl.textContent = `(${currentYear}년)`;
    };

    document.getElementById("prevYearBtn")?.addEventListener("click", () => {
        currentYear--;
        updateYearDisplays();
        renderSummaryCards(currentYear);
        renderMonthlyChart(currentYear);
    });

    document.getElementById("nextYearBtn")?.addEventListener("click", () => {
        currentYear++;
        updateYearDisplays();
        renderSummaryCards(currentYear);
        renderMonthlyChart(currentYear);
    });

    updateYearDisplays();
    renderSummaryCards(currentYear);
    renderMonthlyChart(currentYear);
};
