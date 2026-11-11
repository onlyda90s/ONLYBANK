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

export const renderYearData = (year) => {
    const currentYearDisplay = document.getElementById("currentYearDisplay");
    const accumYearDisplay = document.getElementById("accumYearDisplay");
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

    const chartContainer = document.getElementById("chartContainer");
    if (chartContainer) {
        chartContainer.innerHTML = "";
        data.bars.forEach((m, idx) => {
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
                <span class="text-[11px] mt-2 font-medium ${hasData ? 'text-brand-sub' : 'text-brand-sub/40'}">${idx + 1}월</span>
            `;
            chartContainer.appendChild(col);
        });
    }
};

export const initReportModule = () => {
    document.getElementById("prevYearBtn")?.addEventListener("click", () => {
        currentYear--;
        renderYearData(currentYear);
    });
    document.getElementById("nextYearBtn")?.addEventListener("click", () => {
        currentYear++;
        renderYearData(currentYear);
    });

    document.querySelectorAll(".dday-item").forEach(item => {
        item.addEventListener("click", () => {
            const target = item.getAttribute("data-goto");
            if (target) document.getElementById(target)?.click();
        });
    });

    document.getElementById("summary-moim-tile")?.addEventListener("click", () => {
        document.getElementById("nav-group1")?.click();
    });

    renderYearData(currentYear);
};
