let assetYear = 2026;
let currentTab = "bank"; 
let showHiddenAccounts = false; 
let activeMenuAccountId = null; // 현재 메뉴가 열린 계좌 ID

const currentSystemMonth = new Date().getMonth() + 1;
let currentRange = currentSystemMonth <= 6 ? "h1" : "h2"; 

const ASSET_STORAGE_KEY = "onlybank_asset_accounts_v5";

const defaultAccountDatabase = {
    bank: [
        { id: "b_1", name: "우리은행 (급여통장)", hidden: false, values: { 1: 9500000, 2: 9800000, 3: 9700000, 4: 9900000, 5: 10050000, 6: 10140000, 7: 9440000, 8: 19070000, 9: 16750000, 10: 16750000, 11: 16954200, 12: 0 } },
        { id: "b_2", name: "카카오뱅크 (생활비)", hidden: false, values: { 1: 5100000, 2: 5200000, 3: 5200000, 4: 5250000, 5: 5250000, 6: 5250000, 7: 5250000, 8: 5260000, 9: 5270000, 10: 5270000, 11: 5270000, 12: 0 } },
        { id: "b_3", name: "토스뱅크 (비상금)", hidden: false, values: { 1: 23500000, 2: 23800000, 3: 23900000, 4: 24000000, 5: 24000000, 6: 24080000, 7: 24570000, 8: 24600000, 9: 25150000, 10: 25150000, 11: 25308500, 12: 0 } },
        { id: "b_4", name: "신한은행 (청년적금)", hidden: false, values: { 1: 1000000, 2: 2000000, 3: 3000000, 4: 4000000, 5: 5000000, 6: 5000000, 7: 25000000, 8: 25000000, 9: 55000000, 10: 55000000, 11: 60000000, 12: 0 } }
    ],
    invest: [
        { id: "i_1", name: "미래에셋 (국내주식)", hidden: false, values: { 1: 15000000, 2: 15800000, 3: 15200000, 4: 16000000, 5: 16500000, 6: 16800000, 7: 17100000, 8: 18200000, 9: 17900000, 10: 19500000, 11: 20100000, 12: 0 } },
        { id: "i_2", name: "토스증권 (해외주식)", hidden: false, values: { 1: 8000000, 2: 8500000, 3: 8900000, 4: 9200000, 5: 9400000, 6: 9800000, 7: 10200000, 8: 10500000, 9: 10800000, 10: 11400000, 11: 12000000, 12: 0 } }
    ],
    debt: [
        { id: "d_1", name: "신한은행 마이너스통장", hidden: false, values: { 1: 5000000, 2: 4500000, 3: 4000000, 4: 3500000, 5: 3000000, 6: 2500000, 7: 2000000, 8: 1500000, 9: 1000000, 10: 500000, 11: 0, 12: 0 } }
    ],
    etc: [
        { id: "e_1", name: "주택청약종합저축", hidden: false, values: { 1: 7200000, 2: 7300000, 3: 7400000, 4: 7500000, 5: 7600000, 6: 7700000, 7: 7800000, 8: 7900000, 9: 8000000, 10: 8100000, 11: 8200000, 12: 0 } },
        { id: "e_2", name: "오피스텔 임대보증금", hidden: false, values: { 1: 10000000, 2: 10000000, 3: 10000000, 4: 10000000, 5: 10000000, 6: 10000000, 7: 10000000, 8: 10000000, 9: 10000000, 10: 10000000, 11: 10000000, 12: 0 } }
    ]
};

let accountDatabase = defaultAccountDatabase;

const loadAccounts = () => {
    try {
        const saved = localStorage.getItem(ASSET_STORAGE_KEY);
        if (saved) accountDatabase = JSON.parse(saved);
        else saveAccounts();
    } catch (e) {
        accountDatabase = defaultAccountDatabase;
    }
};

const saveAccounts = () => {
    try { localStorage.setItem(ASSET_STORAGE_KEY, JSON.stringify(accountDatabase)); } catch (e) {}
};

const formatWon = (val) => (!val || isNaN(val) ? "0" : Number(val).toLocaleString());

// 1. 상단 순자산 추이 차트 (단위: 천원 + 툴팁)
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

// 2. 더보기(⋮) 팝오버 제어 함수
const openPopoverMenu = (buttonEl, accId) => {
    const popover = document.getElementById("accountActionPopover");
    if (!popover) return;

    activeMenuAccountId = accId;
    const rect = buttonEl.getBoundingClientRect();

    popover.style.top = `${rect.bottom + 4}px`;
    popover.style.left = `${rect.left - 90}px`; // 버튼 좌측 정렬되도록 오프셋
    popover.classList.remove("hidden");
    popover.classList.add("flex");
};

const hidePopoverMenu = () => {
    const popover = document.getElementById("accountActionPopover");
    if (popover) {
        popover.classList.add("hidden");
        popover.classList.remove("flex");
    }
    activeMenuAccountId = null;
};

// 3. 월간 결산 시트 (인라인 입력 복원 + 우측 ⋮ 더보기 버튼)
export const renderAssetTable = (focusNewId = null) => {
    hidePopoverMenu();

    const thead = document.getElementById("assetTableHead");
    const tbody = document.getElementById("assetTableBody");
    const tfoot = document.getElementById("assetTableFoot");
    const unitDisplay = document.getElementById("assetSheetUnit");
    if (!thead || !tbody || !tfoot) return;

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
        if (unitDisplay) unitDisplay.textContent = "(단위: 천원 - 상·하반기 자동 반영)";
    }

    const colNameWidth = isAll ? "w-[16%]" : "w-[22%]";
    const colMonthWidth = isAll ? "w-[7%]" : "w-[13%]";

    // 헤더(Thead)
    let headHtml = `
        <tr class="bg-slate-50/80 border-b border-brand-border/60 text-xs text-brand-sub">
            <th class="p-2.5 font-semibold sticky-col bg-slate-50 border-r border-brand-border/40 ${colNameWidth}">항목</th>
    `;
    activeMonths.forEach((m, idx) => {
        const isCurrent = m === 11;
        const isQuarterEnd = isAll && (m === 3 || m === 6 || m === 9);
        const borderCls = isQuarterEnd ? "quarter-divider" : "";
        const padRight = (idx === activeMonths.length - 1) ? "pr-5" : "";

        headHtml += `
            <th class="p-2 font-medium text-center ${colMonthWidth} ${isCurrent ? 'bg-brand-personal/5 text-brand-personal font-bold' : ''} ${borderCls} ${padRight}">
                ${m}월
            </th>
        `;
    });
    headHtml += `</tr>`;
    thead.innerHTML = headHtml;

    // 계좌 데이터 분류
    const allTabAccounts = accountDatabase[currentTab] || [];
    const activeAccounts = allTabAccounts.filter(acc => !acc.hidden);
    const hiddenAccounts = allTabAccounts.filter(acc => acc.hidden);

    tbody.innerHTML = "";

    // [A] 활성 계좌: 인라인 타이핑 입력 + 우측 ⋮ 더보기 버튼
    activeAccounts.forEach(acc => {
        const tr = document.createElement("tr");
        tr.className = "hover:bg-black/[0.015] transition-colors group";

        let rowHtml = `
            <td class="p-1 sticky-col bg-white border-r border-brand-border/40 ${colNameWidth}">
                <div class="flex items-center space-x-1 px-1 py-0.5">
                    <!-- 칸 안에서 바로 타이핑 수정하는 인라인 인풋 -->
                    <input type="text" data-id="${acc.id}" value="${acc.name}" 
                        class="account-name-input flex-1 bg-transparent hover:bg-slate-50 focus:bg-white border border-transparent hover:border-slate-300 focus:border-brand-personal rounded px-2 py-1 text-xs font-semibold text-brand-ink focus:outline-none transition" />
                    <!-- 우측 단정한 ⋮ 더보기 버튼 -->
                    <button data-action="toggle-menu" data-id="${acc.id}" class="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-brand-ink hover:bg-slate-100 rounded-md transition text-xs font-bold shrink-0" title="계좌 관리">
                        ⋮
                    </button>
                </div>
            </td>
        `;

        activeMonths.forEach((m, idx) => {
            const val = acc.values[m] || 0;
            const isCurrent = m === 11;
            const isQuarterEnd = isAll && (m === 3 || m === 6 || m === 9);
            const borderCls = isQuarterEnd ? "quarter-divider" : "";
            const padRight = (idx === activeMonths.length - 1) ? "pr-5" : "";
            const displayVal = isAll ? (val > 0 ? Math.round(val / 1000) : 0) : val;

            if (isAll) {
                rowHtml += `
                    <td class="p-1 text-center ${colMonthWidth} ${isCurrent ? 'bg-brand-personal/5' : ''} ${borderCls} ${padRight}">
                        <div class="w-full text-right px-2 py-1 tabular-nums text-[11px] font-semibold text-slate-700 select-none">
                            ${displayVal > 0 ? formatWon(displayVal) : '-'}
                        </div>
                    </td>
                `;
            } else {
                rowHtml += `
                    <td class="p-1 text-center ${colMonthWidth} ${isCurrent ? 'bg-brand-personal/5' : ''} ${borderCls} ${padRight}">
                        <input type="text" data-acc-id="${acc.id}" data-month="${m}" value="${formatWon(displayVal)}" 
                            class="asset-input w-full text-right bg-transparent hover:bg-slate-50 focus:bg-white border border-transparent hover:border-slate-300 focus:border-brand-personal rounded px-1.5 py-1 tabular-nums text-xs font-medium focus:outline-none focus:ring-1 focus:ring-brand-personal transition-all shadow-2xs" />
                    </td>
                `;
            }
        });
        tr.innerHTML = rowHtml;
        tbody.appendChild(tr);
    });

    // [B] '+ 계좌 추가' 행 (인라인)
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

    // [C] '해지 보관함' 접이식 영역
    if (hiddenAccounts.length > 0) {
        const toggleRow = document.createElement("tr");
        toggleRow.className = "border-t border-dashed border-slate-300 bg-slate-50/60";
        toggleRow.innerHTML = `
            <td class="p-2 sticky-col bg-slate-50/90 border-r border-brand-border/40 ${colNameWidth}">
                <button id="toggleHiddenSectionBtn" class="flex items-center text-[11px] font-semibold text-slate-500 hover:text-brand-ink transition px-2 py-0.5 rounded hover:bg-black/5">
                    <span>📦 해지 보관함 (${hiddenAccounts.length})</span>
                    <span class="ml-1 text-[9px]">${showHiddenAccounts ? '▲' : '▼'}</span>
                </button>
            </td>
            <td colspan="${activeMonths.length}" class="px-3 text-[10px] text-slate-400">
                ${showHiddenAccounts ? '과거 결산에 포함되어 합계가 정상 보존됩니다.' : ''}
            </td>
        `;
        tbody.appendChild(toggleRow);

        if (showHiddenAccounts) {
            hiddenAccounts.forEach(acc => {
                const hTr = document.createElement("tr");
                hTr.className = "bg-slate-100/50 hover:bg-slate-100 transition-colors opacity-75";

                let hRowHtml = `
                    <td class="p-1 sticky-col bg-slate-100 border-r border-brand-border/40 ${colNameWidth}">
                        <div class="flex items-center justify-between px-2 py-1">
                            <span class="text-xs font-medium text-slate-500 line-through truncate flex-1 pr-1">${acc.name}</span>
                            <button data-action="restore" data-id="${acc.id}" title="활성 목록으로 복원" class="text-[10px] font-bold text-brand-personal bg-white border border-slate-200 px-2 py-1 rounded-md hover:bg-brand-personal hover:text-white transition shadow-3xs shrink-0">복원</button>
                        </div>
                    </td>
                `;

                activeMonths.forEach((m, idx) => {
                    const val = acc.values[m] || 0;
                    const isQuarterEnd = isAll && (m === 3 || m === 6 || m === 9);
                    const borderCls = isQuarterEnd ? "quarter-divider" : "";
                    const padRight = (idx === activeMonths.length - 1) ? "pr-5" : "";
                    const displayVal = isAll ? (val > 0 ? Math.round(val / 1000) : 0) : val;

                    hRowHtml += `
                        <td class="p-1 text-center ${colMonthWidth} ${borderCls} ${padRight}">
                            <div class="w-full text-right px-2 py-1 tabular-nums text-[11px] font-medium text-slate-400 select-none">
                                ${displayVal > 0 ? formatWon(displayVal) : '-'}
                            </div>
                        </td>
                    `;
                });
                hTr.innerHTML = hRowHtml;
                tbody.appendChild(hTr);
            });
        }
    }

    // [D] 푸터(합계)
    let footHtml = `
        <tr>
            <td class="p-2.5 sticky-col bg-slate-100 border-r border-brand-border/40 whitespace-nowrap ${colNameWidth}">
                <div class="flex items-center space-x-1.5 font-bold text-xs text-brand-ink whitespace-nowrap">
                    <span>📌</span><span>합계</span>
                </div>
            </td>
    `;
    activeMonths.forEach((m, idx) => {
        const totalRaw = allTabAccounts.reduce((sum, a) => sum + (a.values[m] || 0), 0);
        const displayTotal = isAll ? (totalRaw > 0 ? Math.round(totalRaw / 1000) : 0) : totalRaw;
        const isCurrent = m === 11;
        const isQuarterEnd = isAll && (m === 3 || m === 6 || m === 9);
        const borderCls = isQuarterEnd ? "quarter-divider" : "";
        const padRight = (idx === activeMonths.length - 1) ? "pr-5" : "";

        footHtml += `
            <td class="p-2 text-right tabular-nums ${colMonthWidth} ${isCurrent ? 'bg-brand-personal/5 text-brand-personal font-extrabold text-[12px]' : 'text-slate-600 text-xs'} ${borderCls} ${padRight}">
                ${displayTotal > 0 ? formatWon(displayTotal) : '-'}
            </td>
        `;
    });
    footHtml += `</tr>`;
    tfoot.innerHTML = footHtml;

    // ==========================================
    // 리스너 연결 (인라인 입력 실시간 영구저장)
    // ==========================================

    // 1) 항목 이름 인라인 수정 -> 즉시 localStorage 저장
    tbody.querySelectorAll('.account-name-input').forEach(nameInput => {
        nameInput.addEventListener('blur', (e) => {
            const accId = e.target.getAttribute('data-id');
            const targetAcc = allTabAccounts.find(a => a.id === accId);
            if (targetAcc && e.target.value.trim()) {
                targetAcc.name = e.target.value.trim();
                saveAccounts();
            }
        });
    });

    // 2) 금액 인라인 수정 -> 저장 및 합계 재계산
    tbody.querySelectorAll('.asset-input').forEach(input => {
        input.addEventListener('focus', (e) => {
            const raw = e.target.value.replace(/,/g, '');
            e.target.value = raw === "0" ? "" : raw;
        });
        input.addEventListener('blur', (e) => {
            const entered = Number(e.target.value.replace(/,/g, '')) || 0;
            const accId = e.target.getAttribute('data-acc-id');
            const m = parseInt(e.target.getAttribute('data-month'), 10);
            const targetAcc = allTabAccounts.find(a => a.id === accId);
            if (targetAcc) {
                targetAcc.values[m] = entered;
                saveAccounts();
                renderAssetTable();
            }
        });
    });

    // 3) '+ 계좌 추가' 클릭 -> 새 행 생성 및 이름 입력칸 자동 포커스
    document.getElementById("addAccountBtn")?.addEventListener("click", () => {
        const newId = "acc_" + Date.now();
        allTabAccounts.push({
            id: newId,
            name: "새 항목",
            hidden: false,
            values: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0 }
        });
        saveAccounts();
        renderAssetTable(newId);
    });

    // 4) 항목 우측 [⋮] 버튼 클릭 -> 팝오버 메뉴 띄우기
    tbody.querySelectorAll('button[data-action="toggle-menu"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const accId = btn.getAttribute('data-id');
            if (activeMenuAccountId === accId) {
                hidePopoverMenu();
            } else {
                openPopoverMenu(btn, accId);
            }
        });
    });

    // 5) 보관함 복원 클릭
    tbody.querySelectorAll('button[data-action="restore"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const targetAcc = allTabAccounts.find(a => a.id === btn.getAttribute('data-id'));
            if (targetAcc) {
                targetAcc.hidden = false;
                saveAccounts();
                renderAssetTable();
            }
        });
    });

    // 6) 보관함 접기/펼치기
    document.getElementById("toggleHiddenSectionBtn")?.addEventListener("click", () => {
        showHiddenAccounts = !showHiddenAccounts;
        renderAssetTable();
    });

    // 새 계좌 추가 직후 해당 행의 이름 입력창으로 커서 자동 이동
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
    loadAccounts();

    // 팝오버 메뉴 클릭 액션
    document.getElementById('popoverHideBtn')?.addEventListener('click', () => {
        if (!activeMenuAccountId) return;
        const targetAcc = accountDatabase[currentTab]?.find(a => a.id === activeMenuAccountId);
        if (targetAcc) {
            targetAcc.hidden = true;
            saveAccounts();
            renderAssetTable();
        }
        hidePopoverMenu();
    });

    document.getElementById('popoverDeleteBtn')?.addEventListener('click', () => {
        if (!activeMenuAccountId) return;
        const allTabAccounts = accountDatabase[currentTab];
        const targetIdx = allTabAccounts.findIndex(a => a.id === activeMenuAccountId);
        if (targetIdx === -1) return;

        const targetAcc = allTabAccounts[targetIdx];
        const hasMoney = Object.values(targetAcc.values).some(v => v > 0);

        if (hasMoney) {
            const confirmed = confirm(
                `[주의] '${targetAcc.name}' 항목은 과거 결산 금액이 기록되어 있습니다.\n\n` +
                `영구 삭제 시 이전 순자산 통계에서도 완전히 제외됩니다.\n` +
                `과거 기록을 보존하려면 '취소' 후 📦 [해지(숨김)]을 권장합니다.\n\n` +
                `정말 완전 삭제하시겠습니까?`
            );
            if (!confirmed) return;
        }

        allTabAccounts.splice(targetIdx, 1);
        saveAccounts();
        renderAssetTable();
        hidePopoverMenu();
    });

    // 화면 아무 곳이나 클릭 시 팝오버 닫기
    document.addEventListener('click', () => {
        hidePopoverMenu();
    });

    // 차트 연도 컨트롤
    document.getElementById("prevAssetYearBtn")?.addEventListener("click", () => {
        assetYear--;
        renderAssetYearChart(assetYear);
    });
    document.getElementById("nextAssetYearBtn")?.addEventListener("click", () => {
        assetYear++;
        renderAssetYearChart(assetYear);
    });

    // 4대 탭 전환
    const assetTabs = document.querySelectorAll('#assetTabs button[data-tab]');
    assetTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            assetTabs.forEach(t => t.className = "px-3.5 py-1.5 rounded-lg text-xs font-bold text-brand-sub hover:bg-black/5 whitespace-nowrap");
            tab.className = "px-3.5 py-1.5 rounded-lg text-xs font-bold bg-white text-brand-personal shadow-sm border border-slate-200/80 whitespace-nowrap";
            currentTab = tab.getAttribute('data-tab');
            renderAssetTable();
        });
    });

    // 반기/전체 칩 UI
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

    document.getElementById("filter-range-h1")?.addEventListener("click", () => { currentRange = "h1"; updateRangeBtnUI(); renderAssetTable(); });
    document.getElementById("filter-range-h2")?.addEventListener("click", () => { currentRange = "h2"; updateRangeBtnUI(); renderAssetTable(); });
    document.getElementById("filter-range-all")?.addEventListener("click", () => { currentRange = "all"; updateRangeBtnUI(); renderAssetTable(); });

    updateRangeBtnUI();
    renderAssetYearChart(assetYear);
    renderAssetTable();
};
