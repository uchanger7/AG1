// API 서버 기본 URL 설정
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export const fetchProjects = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/projects`);
    if (!response.ok) throw new Error('Failed to fetch projects');
    return response.json();
  } catch (error) {
    console.error('API에서 데이터를 불러오는 중 오류 발생:', error);
    // 오류 발생 시 빈 배열 반환 또는 적절한 에러 처리
    return [];
  }
};

export const saveProjects = async (projects) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projects)
    });
    if (!response.ok) throw new Error('Failed to save projects');
    return response.json();
  } catch (error) {
    console.error('API에 데이터를 저장하는 중 오류 발생:', error);
    throw error; // 에러를 상위로 전파하여 UI에서 적절히 처리하도록 함
  }
};