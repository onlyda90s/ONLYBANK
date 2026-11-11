let assetYear = 2026;

const assetYearlyData = {
    2025: [
        { m: 1, net: 9800, diff: 0 }, { m: 2, net: 10100, diff: 300 }, { m: 3, net: 10450, diff: 350 },
        { m: 4, net: 10400, diff: -50 }, { m: 5, net: 10700, diff: 300 }, { m: 6, net: 10950, diff: 250 },
        { m: 7, net: 11200, diff: 250 }, { m: 8, net: 11500, diff: 300 }, { m: 9, net: 11400, diff: -100 },
        { m: 10, net: 11600, diff: 200 }, { m: 11, net: 11750, diff: 150 }, { m: 12, net: 11800, diff: 50 }
    ],
    2026: [
        { m: 1, net: 11800, diff: 0 }, { m: 2, net: 12100, diff: 300 }, { m: 3, net: 12050, diff: -50 },
        { m: 4, net: 12300, diff: 250 }, { m: 5, net: 12450, diff: 150 }, { m: 6, net: 12553, diff: 103 },
        { m: 7, net: 12573, diff: 20 }, { m: 8, net: 13018, diff: 445 }, { m: 9, net: 12978, diff: -40 },
        { m: 10, net: 13930, diff: 952 }, { m: 11, net: 14250, diff: 320 }, { m: 12, net: 0, diff: 0 }
    ]
};

const bankAccounts = [
    { name: "우리은행 (급여통장)", dot: "bg-blue-500", values: { "26.06": 10140000, "26.07": 9440000, "26.08": 19070000, "26.09": 16750000, "26.10": 16750000, "26.11": 16954200, "26.12": 0 } },
    { name: "카카오뱅크 (모임·생활)", dot: "bg-yellow-400", values: { "26.06": 5250000, "26.07": 5250000, "26.08": 5260000, "26.09": 5270000, "26.10": 5270000, "26.11": 5270000, "26.12": 0 } },
    { name: "토스뱅크 (비상금통장)", dot: "bg-indigo-500", values: { "26.06": 24080000, "26.07": 24570000, "26.08": 24600000, "26.09": 25150000, "26.10": 25150000, "26.11": 25308500, "26.12": 0 } },
    { name: "신한은행 (청년적금)", dot: "bg-sky-500", values: { "26.06": 5000000, "26.07": 25000000, "26.08": 25000000, "26.09": 55000000, "26.10": 55000000, "26.11": 60000000, "26.12": 0 } }
];

const monthsHeader = ["26.06", "26.07", "26.08", "26.09", "26.10", "26.11", "26.12"];

const formatWon = (val) => (!val || isNaN(val) ? "0" : Number(val).toLocaleString());

export const renderAssetYearChart = (year) => {
    const displayEl = document.getElementById("assetYearDisplay");
    const chartTitleEl = document.getElementById("assetYearChartTitle");
    
    if (displayEl) displayEl.textContent = `${year}년`;
    // 연도 텍스트 제거하고 고정 타이틀로 설정
    if (chartTitleEl) chartTitleEl.textContent = "순자산 추이 및 월별 증감";

    const monthsData = assetYearlyData[year] || Array(12).fill({ net: 0, diff: 0 }).map((_, idx) => ({ m: idx + 1, net: 0, diff: 0 }));
    const chartContainer = document.getElementById("asset12MonthChart");
    if (!chartContainer) return;

    chartContainer.innerHTML = "";
    const maxNet = Math.max(...monthsData.map(d => d.net), 15000);

    monthsData.forEach(item => {
        const hasData = item.net > 0;
        const barH = hasData ? Math.min(Math.round((item.net / maxNet) * 100), 85) : 6;
        const isPositive = item.diff > 0;
        const isNegative = item.diff < 0;

        const col = document.createElement("div");
        col.className = "flex-1 flex flex-col items-center h-full justify-end group transition-all";

        // 상단 증감 뱃지
        let badgeHtml = '';
        let barColor = 'bg-slate-200';

        if (hasData) {
            if (isPositive) {
                badgeHtml = `<span class="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-1 py-0.5 rounded tabular-nums whitespace-nowrap shadow-3xs">▲+${item.diff}만</span>`;
                barColor = 'bg-emerald-600/90 group-hover:bg-emerald-600';
            } else if (isNegative) {
                badgeHtml = `<span class="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200/80 px-1 py-0.5 rounded tabular-nums whitespace-nowrap shadow-3xs">▼${Math.abs(item.diff)}만</span>`;
                barColor = 'bg-rose-600/90 group-hover:bg-rose-600';
            } else {
                badgeHtml = `<span class="text-[10px] font-medium text-slate-400 tabular-nums">-</span>`;
                barColor = 'bg-slate-300 group-hover:bg-slate-400';
            }
        } else {
            badgeHtml = `<span class="text-[9px] text-slate-300">예정</span>`;
            barColor = 'bg-slate-100 border border-dashed border-slate-200';
        }

        // [구조: 상단 증감 뱃지 -> 막대 그래프 -> 하단 월 라벨 -> 하단 자산 잔액]
        col.innerHTML = `
            <div class="h-6 flex items-center justify-center mb-1">
                ${badgeHtml}
            </div>
            <div class="w-full flex flex-col items-center justify-end h-28">
                <div class="w-5 ${barColor} rounded-t transition-all duration-300" style="height: ${barH}%;"></div>
            </div>
            <div class="mt-2 flex flex-col items-center select-none border-t border-brand-border/40 w-full pt-1.5">
                <span class="text-[11px] font-semibold ${hasData ? 'text-brand-ink' : 'text-slate-400'}">${item.m}월</span>
                <span class="text-[11px] font-bold tracking-tight mt-0.5 tabular-nums ${hasData ? 'text-brand-ink' : 'text-slate-300'}">${hasData ? item.net.toLocaleString() : '-'}</span>
            </div>
        `;
        chartContainer.appendChild(col);
    });
};

export const renderAssetTable = () => {
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
            if (targetAcc) targetAcc.values[mKey] = num;
        });
    });
};

export const initAssetsModule = () => {
    document.getElementById("prevAssetYearBtn")?.addEventListener("click", () => {
        assetYear--;
        renderAssetYearChart(assetYear);
    });
    document.getElementById("nextAssetYearBtn")?.addEventListener("click", () => {
        assetYear++;
        renderAssetYearChart(assetYear);
    });

    const assetTabContainer = document.getElementById('assetTabs');
    if (assetTabContainer) {
        const tabs = assetTabContainer.querySelectorAll('button:not(:last-child)');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.className = "px-3.5 py-1.5 rounded-lg text-xs font-bold text-brand-sub hover:bg-black/5 whitespace-nowrap");
                tab.className = "px-3.5 py-1.5 rounded-lg text-xs font-bold bg-white text-brand-personal shadow-sm border border-slate-200/80 whitespace-nowrap";
            });
        });
    }

    renderAssetYearChart(assetYear);
    renderAssetTable();
};
