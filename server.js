import express from 'express';
import cors from 'cors';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { setupExcelRoutes } from './server/excel-routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5001;
const DB_PATH = path.join(__dirname, 'database.json');

app.use(cors());
app.use(express.json());

// 정적 파일 제공 (업로드된 이미지 등을 위해)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure database exists
const initDb = async () => {
    if (!await fs.exists(DB_PATH)) {
        await fs.writeJson(DB_PATH, [], { spaces: 2 });
    }
};

initDb();

app.get('/api/projects', async (req, res) => {
    try {
        const projects = await fs.readJson(DB_PATH);
        res.json(projects);
    } catch (error) {
        res.status(500).json({ error: 'Failed to read data' });
    }
});

app.post('/api/projects', async (req, res) => {
    try {
        const projects = req.body;
        await fs.writeJson(DB_PATH, projects, { spaces: 2 });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to save data' });
    }
});

// 엑셀 파일 업로드 라우트 설정
setupExcelRoutes(app);

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend server running at http://0.0.0.0:${PORT}`);
    console.log(`For external access, use your machine's IP address and port ${PORT}`);
});