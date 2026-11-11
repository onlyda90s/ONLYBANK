let assetYear = 2026;
let currentTab = "bank"; // 기본 탭: 금융권

// 접속 시점 월(1~12)을 자동 판별하여 상반기/하반기 기본 활성화
const currentSystemMonth = new Date().getMonth() + 1;
let currentRange = currentSystemMonth <= 6 ? "h1" : "h2"; // 11월이므로 자동으로 'h2'로 시작

// 1. 상단 차트 데이터 (단위: 만원 기준 원본)
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

// 2. 4대 자산군 계좌별 원 단위(KRW) 원본 데이터베이스
const accountDatabase = {
    bank: [
        { id: "b_1", name: "우리은행 (급여통장)", dot: "bg-blue-500", values: { 1: 9500000, 2: 9800000, 3: 9700000, 4: 9900000, 5: 10050000, 6: 10140000, 7: 9440000, 8: 19070000, 9: 16750000, 10: 16750000, 11: 16954200, 12: 0 } },
        { id: "b_2", name: "카카오뱅크 (생활비)", dot: "bg-yellow-400", values: { 1: 5100000, 2: 5200000, 3: 5200000, 4: 5250000, 5: 5250000, 6: 5250000, 7: 5250000, 8: 5260000, 9: 5270000, 10: 5270000, 11: 5270000, 12: 0 } },
        { id: "b_3", name: "토스뱅크 (비상금)", dot: "bg-indigo-500", values: { 1: 23500000, 2: 23800000, 3: 23900000, 4: 24000000, 5: 24000000, 6: 24080000, 7: 24570000, 8: 24600000, 9: 25150000, 10: 25150000, 11: 25308500, 12: 0 } },
        { id: "b_4", name: "신한은행 (청년적금)", dot: "bg-sky-500", values: { 1: 1000000, 2: 2000000, 3: 3000000, 4: 4000000, 5: 5000000, 6: 5000000, 7: 25000000, 8: 25000000, 9: 55000000, 10: 55000000, 11: 60000000, 12: 0 } }
    ],
    invest: [
        { id: "i_1", name: "미래에셋 (국내주식)", dot: "bg-amber-500", values: { 1: 15000000, 2: 15800000, 3: 15200000, 4: 16000000, 5: 16500000, 6: 16800000, 7: 17100000, 8: 18200000, 9: 17900000, 10: 19500000, 11: 20100000, 12: 0 } },
        { id: "i_2", name: "토스증권 (해외주식)", dot: "bg-blue-600", values: { 1: 8000000, 2: 8500000, 3: 8900000, 4: 9200000, 5: 9400000, 6: 9800000, 7: 10200000, 8: 10500000, 9: 10800000, 10: 11400000, 11: 12000000, 12: 0 } }
    ],
    debt: [
        { id: "d_1", name: "신한은행 마이너스통장", dot: "bg-rose-500", values: { 1: 5000000, 2: 4500000, 3: 4000000, 4: 3500000, 5: 3000000, 6: 2500000, 7: 2000000, 8: 1500000, 9: 1000000, 10: 500000, 11: 0, 12: 0 } }
    ],
    etc: [
        { id: "e_1", name: "주택청약종합저축", dot: "bg-emerald-500", values: { 1: 7200000, 2: 7300000, 3: 7400000, 4: 7500000, 5: 7600000, 6: 7700000, 7: 7800000, 8: 7900000, 9: 8000000, 10: 8100000, 11: 8200000, 12: 0 } },
        { id: "e_2", name: "오피스텔 임대보증금", dot: "bg-slate-500", values: { 1: 10000000, 2: 10000000, 3: 10000000, 4: 10000000, 5: 10000000, 6: 10000000, 7: 10000000, 8: 10000000, 9: 10000000, 10: 10000000, 11: 10000000, 12: 0 } }
    ]
};

const formatWon = (val) => (!val || isNaN(val) ? "0" : Number(val).toLocaleString());

// 1. 상단 순자산 추이 차트 (단위: 천원 + 마우스 호버 툴팁)
export const renderAssetYearChart = (year) => {
    const displayEl = document.getElementById("assetYearDisplay");
    const chartTitleEl = document.getElementById("assetYearChartTitle");
    if (displayEl) displayEl.textContent = `${year}년`;
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

        // 천원 단위 환산: 14,250만원 -> 142,500천원
        const netInThousand = hasData ? item.net * 10 : 0;
        const exactFullWon = item.net * 10000;
        const diffFullWon = item.diff * 10000;

        const col = document.createElement("div");
        col.className = "flex-1 flex flex-col items-center h-full justify-end group relative transition-all";

        let badgeHtml = '';
        let barColor = 'bg-slate-200';
        let diffText = '-';
        let diffColorCls = 'text-slate-300';

        if (hasData) {
            if (isPositive) {
                badgeHtml = `<span class="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-1 py-0.5 rounded tabular-nums whitespace-nowrap shadow-3xs">▲+${item.diff}만</span>`;
                barColor = 'bg-emerald-600/90 group-hover:bg-emerald-600';
                diffText = `▲ +${diffFullWon.toLocaleString()}원`;
                diffColorCls = 'text-emerald-400';
            } else if (isNegative) {
                badgeHtml = `<span class="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200/80 px-1 py-0.5 rounded tabular-nums whitespace-nowrap shadow-3xs">▼${Math.abs(item.diff)}만</span>`;
                barColor = 'bg-rose-600/90 group-hover:bg-rose-600';
                diffText = `▼ ${Math.abs(diffFullWon).toLocaleString()}원`;
                diffColorCls = 'text-rose-400';
            } else {
                badgeHtml = `<span class="text-[10px] font-medium text-slate-400 tabular-nums">-</span>`;
                barColor = 'bg-slate-300 group-hover:bg-slate-400';
                diffText = '전월 동일';
            }
        } else {
            badgeHtml = `<span class="text-[9px] text-slate-300">예정</span>`;
            barColor = 'bg-slate-100 border border-dashed border-slate-200';
        }

        // 마우스 오버 시 표시되는 미니 툴팁 (1원 단위 전체 금액 + 증감)
        const tooltipHtml = hasData ? `
            <div class="absolute bottom-[95%] mb-2 hidden group-hover:flex flex-col items-center z-50 pointer-events-none transition-all duration-200 shadow-xl">
                <div class="bg-slate-900/95 text-white rounded-xl py-2 px-3 border border-slate-700 text-center whitespace-nowrap shadow-2xl backdrop-blur-xs">
                    <p class="text-[10px] text-slate-300 font-medium mb-0.5">${item.m}월 말 순자산 총액</p>
                    <p class="text-xs font-bold text-amber-300 tabular-nums font-mono">${exactFullWon.toLocaleString()}원</p>
                    <div class="mt-1 pt-1 border-t border-slate-700/80 flex items-center justify-center space-x-1 text-[10px]">
                        <span class="text-slate-400">전월비:</span>
                        <span class="font-bold tabular-nums ${diffColorCls}">${diffText}</span>
                    </div>
                </div>
                <div class="w-2 h-2 bg-slate-900/95 rotate-45 -mt-1 border-r border-b border-slate-700"></div>
            </div>
        ` : '';

        col.innerHTML = `
            ${tooltipHtml}
            <div class="h-6 flex items-center justify-center mb-1">
                ${badgeHtml}
            </div>
            <div class="w-full flex flex-col items-center justify-end h-28 cursor-pointer">
                <div class="w-5 ${barColor} rounded-t transition-all duration-300" style="height: ${barH}%;"></div>
            </div>
            <div class="mt-2 flex flex-col items-center select-none border-t border-brand-border/40 w-full pt-1.5">
                <span class="text-[11px] font-semibold ${hasData ? 'text-brand-ink' : 'text-slate-400'}">${item.m}월</span>
                <span class="text-[11px] font-bold tracking-tight mt-0.5 tabular-nums ${hasData ? 'text-brand-ink' : 'text-slate-300'}">${hasData ? netInThousand.toLocaleString() : '-'}</span>
            </div>
        `;
        chartContainer.appendChild(col);
    });
};

// 2. 월간 결산 시트 (상반기/하반기 6열 원단위 vs 전체 12열 천원단위)
export const renderAssetTable = (focusNewId = null) => {
    const thead = document.getElementById("assetTableHead");
    const tbody = document.getElementById("assetTableBody");
    const tfoot = document.getElementById("assetTableFoot");
    const unitDisplay = document.getElementById("assetSheetUnit");
    if (!thead || !tbody || !tfoot) return;

    // 현재 뷰 범위에 따른 월 목록 & 단위 결정
    let activeMonths = [];
    const isAll = (currentRange === "all");

    if (currentRange === "h1") {
        activeMonths = [1, 2, 3, 4, 5, 6];
        if (unitDisplay) unitDisplay.textContent = "(단위: 원)";
    } else if (currentRange === "h2") {
        activeMonths = [7, 8, 9, 10, 11, 12];
        if (unitDisplay) unitDisplay.textContent = "(단위: 원)";
    } else {
        activeMonths = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
        if (unitDisplay) unitDisplay.textContent = "(단위: 천원)";
    }

    // 열 너비 비율 계산 (전체: 항목 16% + 월 7% / 반기: 항목 22% + 월 13%)
    const colNameWidth = isAll ? "w-[16%]" : "w-[22%]";
    const colMonthWidth = isAll ? "w-[7%]" : "w-[13%]";

    // 헤더(Thead)
    let headHtml = `
        <tr class="bg-slate-50/80 border-b border-brand-border/60 text-xs text-brand-sub">
            <th class="p-2.5 font-semibold sticky-col bg-slate-50 border-r border-brand-border/40 ${colNameWidth}">항목</th>
    `;
    activeMonths.forEach(m => {
        const isCurrent = m === 11;
        const isQuarterEnd = isAll && (m === 3 || m === 6 || m === 9);
        const borderCls = isQuarterEnd ? "quarter-divider" : "";
        headHtml += `
            <th class="p-2 font-medium text-center ${colMonthWidth} ${isCurrent ? 'bg-brand-personal/5 text-brand-personal font-bold' : ''} ${borderCls}">
                ${m}월
            </th>
        `;
    });
    headHtml += `</tr>`;
    thead.innerHTML = headHtml;

    // 본문(Tbody)
    const currentAccounts = accountDatabase[currentTab] || [];
    tbody.innerHTML = "";

    currentAccounts.forEach(acc => {
        const tr = document.createElement("tr");
        tr.className = "hover:bg-black/[0.015] transition-colors";

        let rowHtml = `
            <td class="p-1 sticky-col bg-white border-r border-brand-border/40 ${colNameWidth}">
                <div class="flex items-center space-x-1.5 px-1 py-0.5">
                    <span class="w-2 h-2 rounded-full ${acc.dot} shrink-0"></span>
                    <input type="text" data-id="${acc.id}" value="${acc.name}" 
                        class="account-name-input w-full bg-transparent hover:bg-slate-50 focus:bg-white border border-transparent hover:border-slate-300 focus:border-brand-personal rounded px-1.5 py-1 text-xs font-semibold text-brand-ink focus:outline-none transition" />
                </div>
            </td>
        `;

        activeMonths.forEach(m => {
            const val = acc.values[m] || 0;
            const isCurrent = m === 11;
            const isQuarterEnd = isAll && (m === 3 || m === 6 || m === 9);
            const borderCls = isQuarterEnd ? "quarter-divider" : "";

            // 전체 뷰면 천원 단위 환산 표시, 반기 뷰면 원 단위 그대로 표시
            const displayVal = isAll ? (val > 0 ? Math.round(val / 1000) : 0) : val;

            rowHtml += `
                <td class="p-1 text-center ${colMonthWidth} ${isCurrent ? 'bg-brand-personal/5' : ''} ${borderCls}">
                    <input type="text" data-acc-id="${acc.id}" data-month="${m}" value="${formatWon(displayVal)}" 
                        class="asset-input w-full text-right bg-transparent hover:bg-slate-50 focus:bg-white border border-transparent hover:border-slate-300 focus:border-brand-personal rounded px-1 py-1 tabular-nums ${isAll ? 'text-[11px]' : 'text-xs'} font-medium focus:outline-none focus:ring-1 focus:ring-brand-personal transition-all shadow-2xs" />
                </td>
            `;
        });

        tr.innerHTML = rowHtml;
        tbody.appendChild(tr);
    });

    // '+ 계좌 추가' 인라인 행
    const addRow = document.createElement("tr");
    addRow.className = "hover:bg-brand-personal/[0.02] border-t border-brand-border/40";
    addRow.innerHTML = `
        <td class="p-2 sticky-col bg-white border-r border-brand-border/40 ${colNameWidth}">
            <button id="addAccountBtn" class="flex items-center text-xs font-bold text-brand-personal hover:text-sky-800 transition px-2 py-1 rounded hover:bg-black/5">
                <svg class="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
                계좌 추가
            </button>
        </td>
        <td colspan="${activeMonths.length}" class="bg-slate-50/20"></td>
    `;
    tbody.appendChild(addRow);

    // 푸터(합계) 렌더링
    let footHtml = `
        <tr>
            <td class="p-2.5 sticky-col bg-slate-100 border-r border-brand-border/40 flex items-center space-x-1.5 ${colNameWidth}">
                <span>📌</span><span>합계</span>
            </td>
    `;
    activeMonths.forEach(m => {
        const totalRaw = currentAccounts.reduce((sum, a) => sum + (a.values[m] || 0), 0);
        const displayTotal = isAll ? (totalRaw > 0 ? Math.round(totalRaw / 1000) : 0) : totalRaw;
        const isCurrent = m === 11;
        const isQuarterEnd = isAll && (m === 3 || m === 6 || m === 9);
        const borderCls = isQuarterEnd ? "quarter-divider" : "";

        footHtml += `
            <td class="p-2 text-right tabular-nums ${colMonthWidth} ${isCurrent ? 'bg-brand-personal/5 text-brand-personal font-extrabold text-[12px]' : 'text-slate-600 text-xs'} ${borderCls}">
                ${displayTotal > 0 ? formatWon(displayTotal) : '-'}
            </td>
        `;
    });
    footHtml += `</tr>`;
    tfoot.innerHTML = footHtml;

    // 1) 항목명 수정 리스너
    tbody.querySelectorAll('.account-name-input').forEach(nameInput => {
        nameInput.addEventListener('blur', (e) => {
            const accId = e.target.getAttribute('data-id');
            const targetAcc = currentAccounts.find(a => a.id === accId);
            if (targetAcc && e.target.value.trim()) {
                targetAcc.name = e.target.value.trim();
            }
        });
    });

    // 2) 금액 수정 리스너 (현재 뷰 단위에 맞춘 정밀 보존)
    tbody.querySelectorAll('.asset-input').forEach(input => {
        input.addEventListener('focus', (e) => {
            const raw = e.target.value.replace(/,/g, '');
            e.target.value = raw === "0" ? "" : raw;
        });
        input.addEventListener('blur', (e) => {
            const entered = Number(e.target.value.replace(/,/g, '')) || 0;
            const accId = e.target.getAttribute('data-acc-id');
            const m = parseInt(e.target.getAttribute('data-month'), 10);
            const targetAcc = currentAccounts.find(a => a.id === accId);

            if (targetAcc) {
                // 전체(천원 뷰)에서 입력했으면 * 1000하여 원 단위로 영구 보존, 반기 뷰면 그대로 보존
                targetAcc.values[m] = isAll ? entered * 1000 : entered;
                renderAssetTable(); // 즉시 합계 재계산
            }
        });
    });

    // 3) '+ 계좌 추가' 인라인 클릭 리스너
    document.getElementById("addAccountBtn")?.addEventListener("click", () => {
        const newId = "acc_" + Date.now();
        currentAccounts.push({
            id: newId,
            name: "새 항목",
            dot: "bg-emerald-500",
            values: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0 }
        });
        renderAssetTable(newId);
    });

    // 새 항목 생성 시 자동 포커스
    if (focusNewId) {
        setTimeout(() => {
            const target = tbody.querySelector(`input[data-id="${focusNewId}"]`);
            if (target) {
                target.focus();
                target.select();
            }
        }, 50);
    }
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

    // 4대 탭 전환 리스너
    const assetTabs = document.querySelectorAll('#assetTabs button[data-tab]');
    assetTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            assetTabs.forEach(t => t.className = "px-3.5 py-1.5 rounded-lg text-xs font-bold text-brand-sub hover:bg-black/5 whitespace-nowrap");
            tab.className = "px-3.5 py-1.5 rounded-lg text-xs font-bold bg-white text-brand-personal shadow-sm border border-slate-200/80 whitespace-nowrap";
            currentTab = tab.getAttribute('data-tab');
            renderAssetTable();
        });
    });

    // 반기/전체 필터 칩 스타일 동기화 함수
    const updateRangeBtnUI = () => {
        const h1Btn = document.getElementById("filter-range-h1");
        const h2Btn = document.getElementById("filter-range-h2");
        const allBtn = document.getElementById("filter-range-all");

        [h1Btn, h2Btn, allBtn].forEach(b => {
            if (b) b.className = "range-btn px-2.5 py-0.5 rounded-md hover:text-brand-ink transition whitespace-nowrap text-[11px] font-semibold text-brand-sub";
        });

        const activeBtn = currentRange === "h1" ? h1Btn : (currentRange === "h2" ? h2Btn : allBtn);
        if (activeBtn) {
            activeBtn.className = "range-btn px-2.5 py-0.5 rounded-md bg-white text-brand-personal shadow-xs transition whitespace-nowrap text-[11px] font-bold";
        }
    };

    document.getElementById("filter-range-h1")?.addEventListener("click", () => {
        currentRange = "h1";
        updateRangeBtnUI();
        renderAssetTable();
    });
    document.getElementById("filter-range-h2")?.addEventListener("click", () => {
        currentRange = "h2";
        updateRangeBtnUI();
        renderAssetTable();
    });
    document.getElementById("filter-range-all")?.addEventListener("click", () => {
        currentRange = "all";
        updateRangeBtnUI();
        renderAssetTable();
    });

    // 초기 상태 가동
    updateRangeBtnUI();
    renderAssetYearChart(assetYear);
    renderAssetTable();
};
