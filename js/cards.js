const CARDS_STORAGE_KEY = "onlybank_cards_v1";

// 노션 시트에 기록하셨던 실데이터 기반 초기값
const defaultCardDatabase = [
    {
        id: "c_1",
        company: "롯데",
        name: "LOCA LIKIT",
        type: "신용",
        channel: "롯데",
        issueDate: "2026-03-02",
        rewardDate: "2026-05-10",
        rewardPaid: true,
        rewardAmount: 70000,
        cancelDate: "2026-06-01",
        canceled: true,
        condition: "레노버 태블릿 구매 (구매 5% + 7만원 페이백)",
        annualFee: 15000,
        expectedBenefit: 0
    },
    {
        id: "c_2",
        company: "농협",
        name: "zgm.고향으로",
        type: "신용",
        channel: "카카오페이",
        issueDate: "2026-03-05",
        rewardDate: "2026-05-31",
        rewardPaid: false,
        rewardAmount: 180000,
        cancelDate: "2027-03-31",
        canceled: false,
        condition: "20만원 결제시 18만원 (3.1~4.30) / 10만원 결제시 4만원",
        annualFee: 12000,
        expectedBenefit: 20000
    },
    {
        id: "c_3",
        company: "넥슨현대",
        name: "넥슨 현대카드",
        type: "신용",
        channel: "넥슨",
        issueDate: "2023-12-01",
        rewardDate: "2023-12-06",
        rewardPaid: true,
        rewardAmount: 210000,
        cancelDate: "2024-06-17",
        canceled: true,
        condition: "30만원 사용시 21만원 포인트 지급 (현금화 완료)",
        annualFee: 10000,
        expectedBenefit: 0
    },
    {
        id: "c_4",
        company: "하나카드",
        name: "하나 MG 새마을",
        type: "신용",
        channel: "MG",
        issueDate: "2025-08-01",
        rewardDate: "",
        rewardPaid: false,
        rewardAmount: 15000,
        cancelDate: "",
        canceled: false,
        condition: "30만원 실적 1.5만원 페이백",
        annualFee: 10000,
        expectedBenefit: 15000
    },
    {
        id: "c_5",
        company: "페이코",
        name: "페이코 포인트 카드",
        type: "체크",
        channel: "페이코",
        issueDate: "2022-05-20",
        rewardDate: "2022-05-31",
        rewardPaid: true,
        rewardAmount: 15000,
        cancelDate: "2022-06-30",
        canceled: true,
        condition: "포인트 15,000원 / 할인쿠폰 10장 / 13,200포인트",
        annualFee: 0,
        expectedBenefit: 0
    },
    {
        id: "c_6",
        company: "신한카드",
        name: "신한 Mr.Life",
        type: "신용",
        channel: "핀크",
        issueDate: "2023-02-13",
        rewardDate: "2023-04-28",
        rewardPaid: true,
        rewardAmount: 140000,
        cancelDate: "2023-05-03",
        canceled: true,
        condition: "14만원 결제시 14만원 캐시백",
        annualFee: 15000,
        expectedBenefit: 0
    },
    {
        id: "c_7",
        company: "롯데 LG",
        name: "LG U+ 롯데카드",
        type: "신용",
        channel: "롯데",
        issueDate: "2026-01-05",
        rewardDate: "",
        rewardPaid: false,
        rewardAmount: 0,
        cancelDate: "",
        canceled: false,
        condition: "통신비 카드 24개월 프로모션 1.1만원 추가 할인",
        annualFee: 20000,
        expectedBenefit: 30000
    }
];

let cardDatabase = defaultCardDatabase;
let currentCardFilter = "all"; // 'all', 'active', 'canceled'
let currentCardTab = "basic"; // 'basic', 'usage'

const loadCards = () => {
    try {
        const saved = localStorage.getItem(CARDS_STORAGE_KEY);
        if (saved) cardDatabase = JSON.parse(saved);
        else saveCards();
    } catch (e) {
        cardDatabase = defaultCardDatabase;
    }
};

const saveCards = () => {
    try {
        localStorage.setItem(CARDS_STORAGE_KEY, JSON.stringify(cardDatabase));
    } catch (e) {}
};

// 상단 1줄 컴팩트 대시보드 계산
export const renderCardsSummary = () => {
    const activeCards = cardDatabase.filter(c => !c.canceled);
    const creditCount = activeCards.filter(c => c.type === "신용").length;
    const checkCount = activeCards.filter(c => c.type === "체크").length;

    const expectedTotal = activeCards.reduce((sum, c) => sum + (c.expectedBenefit || 0), 0);
    const feeTotal = activeCards.reduce((sum, c) => sum + (c.annualFee || 0), 0);

    // 올해 받은 혜택: 지급 완료된 리워드 총합 + 월별 누적 할인액(가상 누적치)
    const paidRewards = cardDatabase
        .filter(c => c.rewardPaid && c.rewardAmount)
        .reduce((sum, c) => sum + c.rewardAmount, 0);

    const totalBenefit = paidRewards + 192500; // 리워드 + 실 할인 합계

    const totalEl = document.getElementById("card-stat-total");
    const creditEl = document.getElementById("card-stat-credit");
    const checkEl = document.getElementById("card-stat-check");
    const expectedEl = document.getElementById("card-stat-expected");
    const benefitEl = document.getElementById("card-stat-benefit");
    const feeEl = document.getElementById("card-stat-fee");

    if (totalEl) totalEl.textContent = activeCards.length;
    if (creditEl) creditEl.textContent = creditCount;
    if (checkEl) checkEl.textContent = checkCount;
    if (expectedEl) expectedEl.textContent = expectedTotal.toLocaleString();
    if (benefitEl) benefitEl.textContent = totalBenefit.toLocaleString();
    if (feeEl) feeEl.textContent = feeTotal.toLocaleString();
};

// 탭 1: 카드 기본 관리 테이블 렌더링
export const renderCardsTable = () => {
    const tbody = document.getElementById("cardTableBody");
    if (!tbody) return;

    let filtered = cardDatabase;
    if (currentCardFilter === "active") filtered = cardDatabase.filter(c => !c.canceled);
    else if (currentCardFilter === "canceled") filtered = cardDatabase.filter(c => c.canceled);

    tbody.innerHTML = "";

    filtered.forEach(card => {
        const tr = document.createElement("tr");
        tr.className = `transition-colors hover:bg-black/[0.015] ${card.canceled ? 'bg-slate-50/70 opacity-70' : 'bg-white'}`;

        const isCredit = card.type === "신용";
        const typeBadge = isCredit
            ? `<span class="bg-brand-personal/10 text-brand-personal font-semibold text-[10px] px-1.5 py-0.5 rounded">신용</span>`
            : `<span class="bg-emerald-50 text-emerald-700 font-semibold text-[10px] px-1.5 py-0.5 rounded">체크</span>`;

        tr.innerHTML = `
            <td class="p-2.5 pl-4 font-semibold text-brand-ink truncate">
                <input type="text" data-field="company" data-id="${card.id}" value="${card.company}" 
                    class="card-inline-input w-full bg-transparent hover:bg-slate-100 focus:bg-white border border-transparent focus:border-brand-personal rounded px-1 py-0.5 font-semibold focus:outline-none transition" />
            </td>
            <td class="p-2.5">
                <div class="flex items-center space-x-1.5">
                    <input type="text" data-field="name" data-id="${card.id}" value="${card.name}" 
                        class="card-inline-input flex-1 min-w-0 bg-transparent hover:bg-slate-100 focus:bg-white border border-transparent focus:border-brand-personal rounded px-1 py-0.5 font-medium ${card.canceled ? 'line-through text-slate-400' : 'text-brand-ink'} focus:outline-none transition truncate" />
                    ${typeBadge}
                </div>
            </td>
            <td class="p-2.5 text-slate-600">
                <input type="text" data-field="channel" data-id="${card.id}" value="${card.channel || '-'}" 
                    class="card-inline-input w-full bg-transparent hover:bg-slate-100 focus:bg-white border border-transparent focus:border-brand-personal rounded px-1 py-0.5 text-slate-600 focus:outline-none transition" />
            </td>
            <td class="p-2.5 text-slate-500 tabular-nums">
                <input type="text" data-field="issueDate" data-id="${card.id}" value="${card.issueDate || '-'}" 
                    class="card-inline-input w-full bg-transparent hover:bg-slate-100 focus:bg-white border border-transparent focus:border-brand-personal rounded px-1 py-0.5 text-slate-500 tabular-nums focus:outline-none transition text-[11px]" />
            </td>
            <td class="p-2.5">
                <div class="flex items-center space-x-1.5">
                    <input type="checkbox" data-action="toggle-reward" data-id="${card.id}" ${card.rewardPaid ? 'checked' : ''} 
                        class="w-3.5 h-3.5 accent-brand-positive rounded cursor-pointer" title="지급 완료 여부" />
                    <input type="text" data-field="rewardDate" data-id="${card.id}" value="${card.rewardDate || '-'}" 
                        class="card-inline-input w-20 bg-transparent hover:bg-slate-100 focus:bg-white border border-transparent focus:border-brand-personal rounded px-1 py-0.5 tabular-nums text-[11px] focus:outline-none transition ${card.rewardPaid ? 'text-brand-positive font-semibold' : 'text-slate-500'}" />
                    ${card.rewardPaid 
                        ? `<span class="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded border border-emerald-200">지급완료</span>` 
                        : (card.rewardDate ? `<span class="text-[9px] font-medium text-amber-700 bg-amber-50 px-1 py-0.5 rounded">대기</span>` : '')}
                </div>
            </td>
            <td class="p-2.5">
                <div class="flex items-center space-x-1.5">
                    <input type="checkbox" data-action="toggle-cancel" data-id="${card.id}" ${card.canceled ? 'checked' : ''} 
                        class="w-3.5 h-3.5 accent-rose-600 rounded cursor-pointer" title="해지 완료 여부" />
                    <input type="text" data-field="cancelDate" data-id="${card.id}" value="${card.cancelDate || '-'}" 
                        class="card-inline-input w-20 bg-transparent hover:bg-slate-100 focus:bg-white border border-transparent focus:border-brand-personal rounded px-1 py-0.5 tabular-nums text-[11px] focus:outline-none transition ${card.canceled ? 'line-through text-slate-400' : 'text-slate-600'}" />
                    ${card.canceled ? `<span class="text-[9px] font-medium text-slate-400 bg-slate-100 px-1 py-0.5 rounded">해지완료</span>` : ''}
                </div>
            </td>
            <td class="p-2.5">
                <input type="text" data-field="condition" data-id="${card.id}" value="${card.condition || ''}" 
                    class="card-inline-input w-full bg-transparent hover:bg-slate-100 focus:bg-white border border-transparent focus:border-brand-personal rounded px-1 py-0.5 text-slate-700 focus:outline-none transition text-[11px] truncate" placeholder="조건 입력" />
            </td>
            <td class="p-2.5 pr-4 text-center">
                <button data-action="delete-card" data-id="${card.id}" class="text-slate-400 hover:text-rose-600 transition text-[11px] font-medium px-1.5 py-0.5 rounded hover:bg-rose-50" title="카드 삭제">
                    삭제
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    // 1) 인라인 수정 리스너
    tbody.querySelectorAll('.card-inline-input').forEach(input => {
        input.addEventListener('blur', (e) => {
            const cardId = e.target.getAttribute('data-id');
            const field = e.target.getAttribute('data-field');
            const target = cardDatabase.find(c => c.id === cardId);
            if (target) {
                target[field] = e.target.value.trim();
                saveCards();
                renderCardsSummary();
            }
        });
    });

    // 2) 리워드 지급 완료 체크박스
    tbody.querySelectorAll('input[data-action="toggle-reward"]').forEach(chk => {
        chk.addEventListener('change', (e) => {
            const cardId = e.target.getAttribute('data-id');
            const target = cardDatabase.find(c => c.id === cardId);
            if (target) {
                target.rewardPaid = e.target.checked;
                saveCards();
                renderCardsSummary();
                renderCardsTable();
            }
        });
    });

    // 3) 해지 완료 체크박스
    tbody.querySelectorAll('input[data-action="toggle-cancel"]').forEach(chk => {
        chk.addEventListener('change', (e) => {
            const cardId = e.target.getAttribute('data-id');
            const target = cardDatabase.find(c => c.id === cardId);
            if (target) {
                target.canceled = e.target.checked;
                saveCards();
                renderCardsSummary();
                renderCardsTable();
            }
        });
    });

    // 4) 삭제 버튼
    tbody.querySelectorAll('button[data-action="delete-card"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const cardId = btn.getAttribute('data-id');
            const target = cardDatabase.find(c => c.id === cardId);
            if (!target) return;
            if (confirm(`'${target.name}' 카드를 목록에서 삭제하시겠습니까?`)) {
                cardDatabase = cardDatabase.filter(c => c.id !== cardId);
                saveCards();
                renderCardsSummary();
                renderCardsTable();
            }
        });
    });
};

export const initCardsModule = () => {
    loadCards();

    // 탭 전환 버튼
    const tabBasicBtn = document.getElementById("cardTabBtn-basic");
    const tabUsageBtn = document.getElementById("cardTabBtn-usage");
    const contentBasic = document.getElementById("cardContent-basic");
    const contentUsage = document.getElementById("cardContent-usage");

    tabBasicBtn?.addEventListener("click", () => {
        currentCardTab = "basic";
        tabBasicBtn.className = "px-4 py-1.5 rounded-lg text-xs font-bold bg-white text-brand-personal shadow-sm transition";
        tabUsageBtn.className = "px-4 py-1.5 rounded-lg text-xs font-semibold text-brand-sub hover:text-brand-ink transition";
        if (contentBasic) contentBasic.style.display = "flex";
        if (contentUsage) contentUsage.style.display = "none";
    });

    tabUsageBtn?.addEventListener("click", () => {
        currentCardTab = "usage";
        tabUsageBtn.className = "px-4 py-1.5 rounded-lg text-xs font-bold bg-white text-brand-personal shadow-sm transition";
        tabBasicBtn.className = "px-4 py-1.5 rounded-lg text-xs font-semibold text-brand-sub hover:text-brand-ink transition";
        if (contentBasic) contentBasic.style.display = "none";
        if (contentUsage) contentUsage.style.display = "flex";
    });

    // 필터 버튼 (전체 / 이용중 / 해지완료)
    const filterBtns = document.querySelectorAll(".card-filter-btn");
    filterBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            filterBtns.forEach(b => b.className = "card-filter-btn px-2.5 py-0.5 rounded-md hover:text-brand-ink transition text-brand-sub font-semibold text-[11px]");
            btn.className = "card-filter-btn px-2.5 py-0.5 rounded-md bg-white text-brand-personal shadow-xs transition font-bold text-[11px]";
            currentCardFilter = btn.getAttribute("data-filter");
            renderCardsTable();
        });
    });

    // 새 카드 추가 버튼
    document.getElementById("addCardBtn")?.addEventListener("click", () => {
        const newCard = {
            id: "c_" + Date.now(),
            company: "신규",
            name: "새 카드",
            type: "신용",
            channel: "-",
            issueDate: new Date().toISOString().slice(0, 10),
            rewardDate: "",
            rewardPaid: false,
            rewardAmount: 0,
            cancelDate: "",
            canceled: false,
            condition: "조건 입력",
            annualFee: 0,
            expectedBenefit: 0
        };
        cardDatabase.unshift(newCard);
        saveCards();
        renderCardsSummary();
        renderCardsTable();
    });

    renderCardsSummary();
    renderCardsTable();
};
