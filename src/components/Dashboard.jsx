import { useState, useEffect } from 'react';
import './Dashboard.css';

const Dashboard = ({ projects }) => {
  const [stats, setStats] = useState({
    totalProjects: 0,
    completedProjects: 0,
    inProgressProjects: 0,
    upcomingProjects: 0,
    averageProgress: 0,
    clientStats: [],
    productStats: [],
    monthlyProjects: []
  });

  useEffect(() => {
    if (!projects || projects.length === 0) return;

    // 현재 날짜
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 완료된 프로젝트 (진행률 100%)
    const completed = projects.filter(p => p.progress === 100);
    
    // 진행 중인 프로젝트 (시작일이 오늘 이전이고, 종료일이 오늘 이후이며, 진행률이 100% 미만)
    const inProgress = projects.filter(p => {
      const startDate = new Date(p.startDate);
      const endDate = new Date(p.endDate);
      return startDate <= today && endDate >= today && p.progress < 100;
    });
    
    // 예정된 프로젝트 (시작일이 오늘 이후)
    const upcoming = projects.filter(p => {
      const startDate = new Date(p.startDate);
      return startDate > today;
    });

    // 평균 진행률
    const totalProgress = projects.reduce((sum, p) => sum + p.progress, 0);
    const averageProgress = Math.round(totalProgress / projects.length);

    // 고객사별 통계
    const clientMap = {};
    projects.forEach(p => {
      if (!clientMap[p.client]) {
        clientMap[p.client] = { count: 0, totalCapacity: 0 };
      }
      clientMap[p.client].count++;
      clientMap[p.client].totalCapacity += parseFloat(p.capacity) || 0;
    });

    const clientStats = Object.entries(clientMap)
      .map(([client, data]) => ({
        client,
        count: data.count,
        totalCapacity: data.totalCapacity
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // 상위 5개

    // 제품별 통계
    const productMap = {};
    projects.forEach(p => {
      if (!productMap[p.productName]) {
        productMap[p.productName] = { count: 0, totalCapacity: 0 };
      }
      productMap[p.productName].count++;
      productMap[p.productName].totalCapacity += parseFloat(p.capacity) || 0;
    });

    const productStats = Object.entries(productMap)
      .map(([productName, data]) => ({
        productName,
        count: data.count,
        totalCapacity: data.totalCapacity
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // 상위 5개

    // 월별 프로젝트 수
    const monthlyMap = {};
    projects.forEach(p => {
      const startDate = new Date(p.startDate);
      const monthYear = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyMap[monthYear]) {
        monthlyMap[monthYear] = 0;
      }
      monthlyMap[monthYear]++;
    });

    const monthlyProjects = Object.entries(monthlyMap)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));

    setStats({
      totalProjects: projects.length,
      completedProjects: completed.length,
      inProgressProjects: inProgress.length,
      upcomingProjects: upcoming.length,
      averageProgress,
      clientStats,
      productStats,
      monthlyProjects
    });
  }, [projects]);

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">생산 대시보드</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-title">전체 프로젝트</div>
          <div className="stat-value">{stats.totalProjects}</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-title">완료된 프로젝트</div>
          <div className="stat-value">{stats.completedProjects}</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-title">진행 중인 프로젝트</div>
          <div className="stat-value">{stats.inProgressProjects}</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-title">예정된 프로젝트</div>
          <div className="stat-value">{stats.upcomingProjects}</div>
        </div>
      </div>
      
      <div className="progress-overview">
        <h2>전체 진행률</h2>
        <div className="overall-progress-container">
          <div className="progress-circle-container">
            <div className="progress-circle" style={{ '--progress': `${stats.averageProgress}%` }}>
              <span className="progress-text">{stats.averageProgress}%</span>
            </div>
          </div>
          <div className="progress-details">
            <p>전체 {stats.totalProjects}개 프로젝트의 평균 진행률입니다.</p>
            <p>완료: {stats.completedProjects}, 진행 중: {stats.inProgressProjects}, 예정: {stats.upcomingProjects}</p>
          </div>
        </div>
      </div>
      
      <div className="dashboard-row">
        <div className="chart-section">
          <h2>고객사별 프로젝트</h2>
          <div className="chart-container">
            {stats.clientStats.map((item, index) => (
              <div key={index} className="chart-item">
                <div className="chart-label">{item.client}</div>
                <div className="chart-bar-container">
                  <div 
                    className="chart-bar" 
                    style={{ 
                      width: `${Math.min(100, (item.count / Math.max(...stats.clientStats.map(s => s.count))) * 100)}%`,
                      backgroundColor: `hsl(${index * 25}, 70%, 50%)`
                    }}
                  ></div>
                </div>
                <div className="chart-value">{item.count}건</div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="chart-section">
          <h2>제품별 생산량</h2>
          <div className="chart-container">
            {stats.productStats.map((item, index) => (
              <div key={index} className="chart-item">
                <div className="chart-label">{item.productName}</div>
                <div className="chart-bar-container">
                  <div 
                    className="chart-bar" 
                    style={{ 
                      width: `${Math.min(100, (item.totalCapacity / Math.max(...stats.productStats.map(s => s.totalCapacity))) * 100)}%`,
                      backgroundColor: `hsl(${200 + index * 25}, 70%, 50%)`
                    }}
                  ></div>
                </div>
                <div className="chart-value">{item.totalCapacity}Kg</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="recent-projects">
        <h2>최근 프로젝트</h2>
        <div className="projects-table-container">
          <table className="projects-table">
            <thead>
              <tr>
                <th>제품명</th>
                <th>고객사</th>
                <th>생산량</th>
                <th>시작일</th>
                <th>납기일</th>
                <th>진행률</th>
              </tr>
            </thead>
            <tbody>
              {projects.slice(0, 10).map(project => (
                <tr key={project.id}>
                  <td>{project.productName}</td>
                  <td>{project.client}</td>
                  <td>{project.capacity}Kg</td>
                  <td>{project.startDate}</td>
                  <td>{project.dueDate}</td>
                  <td>
                    <div className="table-progress-container">
                      <div 
                        className="table-progress-bar" 
                        style={{ 
                          width: `${project.progress}%`,
                          backgroundColor: project.color
                        }}
                      ></div>
                      <span className="table-progress-text">{project.progress}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;