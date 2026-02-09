import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, 'database.json');

// 테이블에서 제공된 데이터
const scheduleData = [
  { iljaNo: '2026/02/06 -1', client: '아지무역', productName: 'COOSOME(2%)', capacity: 5.00, dueDate: '2026/02/06', manager: '김용덕' },
  { iljaNo: '2026/02/06 -2', client: '(주)이미인', productName: 'CRYSTAL BEAD(ORANGE-C)', capacity: 10.00, dueDate: '2026/02/11', manager: '방승일, 김성수' },
  { iljaNo: '2026/02/06 -3', client: '(주)네이처랙', productName: 'RETINOL FLUID', capacity: 160.00, dueDate: '2026/02/12', manager: '김승준, 이광재' },
  { iljaNo: '2026/02/06 -3', client: '(주)네이처랙', productName: 'NT FLUID', capacity: 100.00, dueDate: '2026/02/12', manager: '김승준, 이광재' },
  { iljaNo: '2026/02/06 -4', client: '(주)더원코스메틱', productName: 'AQUA SHEA BUTTER', capacity: 20.00, dueDate: '2026/02/10', manager: '김용덕' },
  { iljaNo: '2026/02/06 -5', client: '(주)코스메카코리아', productName: 'ADENOSOLVE 2%', capacity: 100.00, dueDate: '2026/02/23', manager: '김용덕' },
  { iljaNo: '2026/02/06 -5', client: '(주)코스메카코리아', productName: 'ADENOSOLVE 2%', capacity: 100.00, dueDate: '2026/03/04', manager: '김용덕' },
  { iljaNo: '2026/02/06 -5', client: '(주)코스메카코리아', productName: 'ADENOSOLVE 2%', capacity: 100.00, dueDate: '2026/03/11', manager: '김용덕' },
  { iljaNo: '2026/02/06 -6', client: '(주)엠코스', productName: 'AQUA VD', capacity: 200.00, dueDate: '2026/02/24', manager: '김용덕' },
  { iljaNo: '2026/02/06 -7', client: '(주)한국화장품제조용성공장', productName: 'PEPTARICH COMPLEX TM', capacity: 10.00, dueDate: '2026/02/24', manager: '김용덕' },
  { iljaNo: '2026/02/06 -7', client: '(주)한국화장품제조용성공장', productName: 'ADENOSOLVE 2%', capacity: 20.00, dueDate: '2026/02/24', manager: '김용덕' },
  { iljaNo: '2026/02/06 -7', client: '(주)한국화장품제조용성공장', productName: 'PEPTARICH-MCT2X', capacity: 20.00, dueDate: '2026/02/24', manager: '김용덕' },
  { iljaNo: '2026/02/06 -7', client: '(주)한국화장품제조용성공장', productName: 'SKINSOME(NG)', capacity: 20.00, dueDate: '2026/02/24', manager: '김용덕' },
  { iljaNo: '2026/02/06 -7', client: '(주)한국화장품제조용성공장', productName: 'VITA 12 SOME(EWG)', capacity: 10.00, dueDate: '2026/02/24', manager: '김용덕' },
  { iljaNo: '2026/02/06 -8', client: '(주)한국화장품제조용성공장', productName: 'GOLD FIBER(500)-DOWN', capacity: 5.00, dueDate: '2026/02/24', manager: '방승일, 김성수' },
  { iljaNo: '2026/02/06 -9', client: '한솔생명과학(주)', productName: '엑시펩타이드중금콤플렉스', capacity: 100.00, dueDate: '2026/02/20', manager: '김승준, 이광재' },
  { iljaNo: '2026/02/06 -10', client: '주식회사바이오네이처', productName: 'PEARL CREAM-SF', capacity: 20.00, dueDate: '2026/02/13', manager: '김용덕' },
  { iljaNo: '2026/02/06 -11', client: '(주)딜리체이코스', productName: 'VITASOME 12', capacity: 10.00, dueDate: '2026/02/13', manager: '김용덕' }
];

// 색상 배열 - 프로젝트마다 다른 색상 지정
const colors = [
  '#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16'
];

async function addScheduleToDatabase() {
  try {
    // 기존 데이터 읽기
    let projects = [];
    if (await fs.exists(DB_PATH)) {
      projects = await fs.readJson(DB_PATH);
    }

    // 마지막 ID 찾기
    let lastId = 0;
    if (projects.length > 0) {
      lastId = Math.max(...projects.map(p => p.id));
    }

    // 새 프로젝트 생성
    const newProjects = scheduleData.map((item, index) => {
      // 일자번호에서 시작일 추출 (예: 2026/02/06 -1 -> 2026/02/06)
      const startDate = item.iljaNo.split(' ')[0];
      
      // 납기일
      const dueDate = item.dueDate;
      
      // 생산 기간 계산 (시작일부터 납기일까지)
      const start = new Date(startDate);
      const end = new Date(dueDate);
      
      // 담당자 정보 파싱
      const managerParts = item.manager.split(', ');
      const managerInfo = {
        production: managerParts[0] || '',
        admin: managerParts[1] || managerParts[0] || '',
        delivery: managerParts[1] || managerParts[0] || ''
      };

      // 새 프로젝트 객체
      return {
        id: lastId + index + 1,
        client: item.client,
        capacity: item.capacity,
        startDate: startDate,
        endDate: dueDate,
        dueDate: dueDate,
        rawMaterial: '',
        productName: item.productName,
        color: colors[index % colors.length],
        includeHolidays: false,
        manager: managerInfo,
        progress: Math.floor(Math.random() * 40) + 10, // 임의의 진행률 (10~50%)
        dailyProduction: [],
        note: `일자번호: ${item.iljaNo}`
      };
    });

    // 기존 데이터와 새 데이터 합치기
    const updatedProjects = [...projects, ...newProjects];
    
    // 데이터베이스에 저장
    await fs.writeJson(DB_PATH, updatedProjects, { spaces: 2 });
    
    console.log(`${newProjects.length}개의 일정이 성공적으로 추가되었습니다.`);
  } catch (error) {
    console.error('일정 추가 중 오류 발생:', error);
  }
}

// 실행
addScheduleToDatabase();