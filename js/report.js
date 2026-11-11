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

// 1. 수입·지출 월별 차트 (상단 금액 표기 + 해당 막대 단일 숫자 툴팁)
export const renderMonthlyChart = (year) => {
    const chartContainer = document.getElementById("chartContainer");
    if (!chartContainer) return;

    chartContainer.innerHTML = "";
    const yearData = yearlyFinanceData[year]?.monthlyBars || Array(12).fill({ in: 0, out: 0 }).map((_, i) => ({ m: i + 1, in: 0, out: 0 }));
    const maxVal = Math.max(...yearData.map(d => Math.max(d.in, d.out)), 550);

    yearData.forEach(item => {
        const hasData = item.in > 0 || item.out > 0;
        const inH = hasData ? Math.min(Math.round((item.in / maxVal) * 100), 80) : 5;
        const outH = hasData ? Math.min(Math.round((item.out / maxVal) * 100), 80) : 5;

        const exactIncome = item.in * 10000;
        const exactExpense = item.out * 10000;

        const col = document.createElement("div");
        col.className = "flex-1 flex flex-col items-center h-full justify-end group relative transition-all";

        col.innerHTML = `
            <div class="w-full flex items-end justify-center space-x-1.5 h-32 cursor-pointer pb-0.5">
                <!-- 수입 막대 (상단 만원 표기 + 호버 시 수입 단독 툴팁) -->
                <div class="flex flex-col items-center justify-end h-full relative group/in">
                    ${hasData && item.in > 0 ? `
                        <div class="absolute bottom-full mb-1 hidden group-hover/in:flex flex-col items-center z-50 pointer-events-none whitespace-nowrap shadow-md">
                            <div class="bg-slate-900/95 text-emerald-300 rounded-md py-1 px-2.5 text-[11px] font-bold font-mono">
                                ${exactIncome.toLocaleString()}원
                            </div>
                            <div class="w-1.5 h-1.5 bg-slate-900/95 rotate-45 -mt-0.5"></div>
                        </div>
                        <span class="text-[9px] font-bold text-brand-positive tabular-nums mb-0.5 select-none leading-none">${item.in}</span>
                    ` : ''}
                    <div class="w-3.5 ${hasData && item.in > 0 ? 'bg-brand-positive hover:brightness-110' : 'bg-slate-200'} rounded-t transition-all duration-300" style="height: ${inH}%;"></div>
                </div>

                <!-- 지출 막대 (상단 만원 표기 + 호버 시 지출 단독 툴팁) -->
                <div class="flex flex-col items-center justify-end h-full relative group/out">
                    ${hasData && item.out > 0 ? `
                        <div class="absolute bottom-full mb-1 hidden group-hover/out:flex flex-col items-center z-50 pointer-events-none whitespace-nowrap shadow-md">
                            <div class="bg-slate-900/95 text-rose-300 rounded-md py-1 px-2.5 text-[11px] font-bold font-mono">
                                ${exactExpense.toLocaleString()}원
                            </div>
                            <div class="w-1.5 h-1.5 bg-slate-900/95 rotate-45 -mt-0.5"></div>
                        </div>
                        <span class="text-[9px] font-bold text-brand-negative tabular-nums mb-0.5 select-none leading-none">${item.out}</span>
                    ` : ''}
                    <div class="w-3.5 ${hasData && item.out > 0 ? 'bg-brand-negative hover:brightness-110' : 'bg-slate-200'} rounded-t transition-all duration-300" style="height: ${outH}%;"></div>
                </div>
            </div>

            <!-- 하단 라벨 (월만 단정하게 표시) -->
            <div class="mt-1 flex flex-col items-center select-none border-t border-brand-border/40 w-full pt-1">
                <span class="text-[11px] font-semibold ${hasData ? 'text-brand-ink' : 'text-slate-400'}">${item.m}월</span>
            </div>
        `;
        chartContainer.appendChild(col);
    });
};

// 2. 상단 8대 지표 카드 렌더링
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
