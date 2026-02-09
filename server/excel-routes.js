import express from 'express';
import multer from 'multer';
import XLSX from 'xlsx';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, 'database.json');

// 색상 배열 - 프로젝트마다 다른 색상 지정
const colors = [
  '#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16'
];

// 파일 업로드를 위한 multer 설정
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname);
    }
  }),
  fileFilter: function (req, file, cb) {
    if (
      file.mimetype === 'application/vnd.ms-excel' ||
      file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ) {
      cb(null, true);
    } else {
      cb(new Error('엑셀 파일만 업로드 가능합니다.'));
    }
  }
});

// uploads 폴더가 없으면 생성
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

export function setupExcelRoutes(app) {
  app.post('/api/upload-excel', upload.single('excelFile'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: '파일이 업로드되지 않았습니다.' });
      }

      // 엑셀 파일 읽기
      const workbook = XLSX.readFile(req.file.path);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);

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

      // 엑셀 데이터를 프로젝트 형식으로 변환
      const newProjects = data.map((item, index) => {
        // 날짜 형식 변환 (필요시)
        let startDate = item['시작일'] || item['일자'] || new Date().toISOString().split('T')[0];
        let dueDate = item['납기일'] || item['종료일'] || startDate;
        
        // 날짜 형식이 문자열이고 '/'를 포함하면 '-'로 변환
        if (typeof startDate === 'string' && startDate.includes('/')) {
          startDate = startDate.replace(/\//g, '-');
        }
        if (typeof dueDate === 'string' && dueDate.includes('/')) {
          dueDate = dueDate.replace(/\//g, '-');
        }

        // 담당자 정보 파싱
        const managerInfo = {
          production: item['담당자'] || item['생산담당'] || '',
          admin: item['관리담당'] || item['담당자'] || '',
          delivery: item['배송담당'] || item['담당자'] || ''
        };

        // 새 프로젝트 객체
        return {
          id: lastId + index + 1,
          client: item['고객사'] || item['거래처명'] || '',
          capacity: parseFloat(item['수량']) || 0,
          startDate: startDate,
          endDate: dueDate,
          dueDate: dueDate,
          rawMaterial: item['원자재'] || '',
          productName: item['품목명'] || item['제품명'] || '',
          color: colors[index % colors.length],
          includeHolidays: false,
          manager: managerInfo,
          progress: Math.floor(Math.random() * 40) + 10, // 임의의 진행률 (10~50%)
          dailyProduction: [],
          note: item['비고'] || ''
        };
      });

      // 기존 데이터와 새 데이터 합치기
      const updatedProjects = [...projects, ...newProjects];
      
      // 데이터베이스에 저장
      await fs.writeJson(DB_PATH, updatedProjects, { spaces: 2 });
      
      // 업로드된 파일 삭제
      fs.unlinkSync(req.file.path);
      
      res.status(200).json({ success: true, count: newProjects.length });
    } catch (error) {
      console.error('엑셀 파일 처리 중 오류:', error);
      res.status(500).json({ error: '엑셀 파일 처리 중 오류가 발생했습니다.' });
    }
  });
}