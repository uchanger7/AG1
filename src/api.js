import { INITIAL_PROJECTS } from './data';

// 배포 환경에서는 정적 데이터를 사용하고, 개발 환경에서는 API 호출
const isProduction = import.meta.env.PROD;
let projectsData = [...INITIAL_PROJECTS];

export const fetchProjects = async () => {
    if (isProduction) {
        // 배포 환경에서는 정적 데이터 반환
        return Promise.resolve([...projectsData]);
    } else {
        // 개발 환경에서는 API 호출
        const response = await fetch('/api/projects');
        if (!response.ok) throw new Error('Failed to fetch projects');
        return response.json();
    }
};

export const saveProjects = async (projects) => {
    if (isProduction) {
        // 배포 환경에서는 메모리에 저장
        projectsData = [...projects];
        return Promise.resolve({ success: true });
    } else {
        // 개발 환경에서는 API 호출
        const response = await fetch('/api/projects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(projects)
        });
        if (!response.ok) throw new Error('Failed to save projects');
        return response.json();
    }
};