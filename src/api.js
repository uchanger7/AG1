import { INITIAL_PROJECTS } from './data';

// 배포 환경에서는 localStorage를 사용하고, 개발 환경에서는 API 호출
const isProduction = import.meta.env.PROD;

// 로컬 스토리지에서 데이터 불러오기 또는 초기 데이터 사용
const getStoredProjects = () => {
  try {
    const storedProjects = localStorage.getItem('projects');
    return storedProjects ? JSON.parse(storedProjects) : [...INITIAL_PROJECTS];
  } catch (error) {
    console.error('로컬 스토리지에서 데이터를 불러오는 중 오류 발생:', error);
    return [...INITIAL_PROJECTS];
  }
};

export const fetchProjects = async () => {
  if (isProduction) {
    // 배포 환경에서는 로컬 스토리지에서 데이터 불러오기
    return Promise.resolve(getStoredProjects());
  } else {
    // 개발 환경에서는 API 호출
    try {
      const response = await fetch('/api/projects');
      if (!response.ok) throw new Error('Failed to fetch projects');
      return response.json();
    } catch (error) {
      console.error('API에서 데이터를 불러오는 중 오류 발생:', error);
      // API 호출 실패 시 로컬 스토리지 데이터 사용
      return getStoredProjects();
    }
  }
};

export const saveProjects = async (projects) => {
  if (isProduction) {
    // 배포 환경에서는 로컬 스토리지에 저장
    try {
      localStorage.setItem('projects', JSON.stringify(projects));
      return Promise.resolve({ success: true });
    } catch (error) {
      console.error('로컬 스토리지에 데이터를 저장하는 중 오류 발생:', error);
      return Promise.reject(error);
    }
  } else {
    // 개발 환경에서는 API 호출
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projects)
      });
      if (!response.ok) throw new Error('Failed to save projects');
      return response.json();
    } catch (error) {
      console.error('API에 데이터를 저장하는 중 오류 발생:', error);
      // API 호출 실패 시 로컬 스토리지에 저장
      localStorage.setItem('projects', JSON.stringify(projects));
      return { success: true, fallback: true };
    }
  }
};