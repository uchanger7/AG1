export const INITIAL_PROJECTS = [
    {
        id: 1,
        client: '삼성전자',
        capacity: 500,
        startDate: '2026-01-25',
        endDate: '2026-02-05',
        dueDate: '2026-02-07',
        rawMaterial: '케미칼 A',
        productName: '특수 코팅액',
        color: '#3b82f6',
        includeHolidays: false,
        manager: { production: '김생산', admin: '이관리', delivery: '박배송' },
        progress: 65,
        dailyProduction: [{ date: '2026-01-25', amount: 50 }, { date: '2026-01-26', amount: 80 }],
        note: '품질 검사 철저히 진행할 것'
    },
    {
        id: 2,
        client: 'LG에너지솔루션',
        capacity: 1200,
        startDate: '2026-01-31',
        endDate: '2026-02-15',
        dueDate: '2026-02-18',
        rawMaterial: '전해질 B',
        productName: '2차전지 소재',
        color: '#10b981',
        includeHolidays: true,
        manager: { production: '최공정', admin: '정기획', delivery: '강물류' },
        progress: 10,
        dailyProduction: [],
        note: '긴급 발주건'
    }
];