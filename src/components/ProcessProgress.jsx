import { useState, useEffect } from 'react';
import { usePMSData } from '../hooks/usePMSData';
import './ProcessProgress.css';

const ProcessProgress = () => {
  const { projects } = usePMSData();
  const [sortedProjects, setSortedProjects] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: 'progress',
    direction: 'desc'
  });
  const [filterConfig, setFilterConfig] = useState({
    client: '',
    minProgress: 0,
    maxProgress: 100
  });

  useEffect(() => {
    if (!projects) return;

    // 필터링
    let filteredProjects = [...projects];
    
    if (filterConfig.client) {
      filteredProjects = filteredProjects.filter(p => 
        p.client.toLowerCase().includes(filterConfig.client.toLowerCase())
      );
    }
    
    filteredProjects = filteredProjects.filter(p => 
      p.progress >= filterConfig.minProgress && p.progress <= filterConfig.maxProgress
    );

    // 정렬
    filteredProjects.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    setSortedProjects(filteredProjects);
  }, [projects, sortConfig, filterConfig]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilterConfig(prev => ({
      ...prev,
      [name]: name === 'client' ? value : Number(value)
    }));
  };

  const getProgressStatus = (progress) => {
    if (progress < 25) return 'status-danger';
    if (progress < 50) return 'status-warning';
    if (progress < 75) return 'status-info';
    return 'status-success';
  };

  const getTimeStatus = (startDate, dueDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(dueDate);
    const totalDuration = end - start;
    const elapsedDuration = now - start;
    
    if (now < start) return { status: 'status-info', text: '예정' };
    if (now > end) return { status: 'status-danger', text: '기한 초과' };
    
    const timeProgress = (elapsedDuration / totalDuration) * 100;
    if (timeProgress < 50) return { status: 'status-success', text: '여유' };
    if (timeProgress < 75) return { status: 'status-info', text: '진행 중' };
    return { status: 'status-warning', text: '마감 임박' };
  };

  return (
    <div className="process-progress-container">
      <h1 className="process-progress-title">공정 진행률</h1>
      
      <div className="filter-section">
        <div className="filter-item">
          <label htmlFor="client">고객사:</label>
          <input
            type="text"
            id="client"
            name="client"
            value={filterConfig.client}
            onChange={handleFilterChange}
            placeholder="고객사 검색"
          />
        </div>
        
        <div className="filter-item">
          <label htmlFor="minProgress">최소 진행률:</label>
          <input
            type="range"
            id="minProgress"
            name="minProgress"
            min="0"
            max="100"
            value={filterConfig.minProgress}
            onChange={handleFilterChange}
          />
          <span>{filterConfig.minProgress}%</span>
        </div>
        
        <div className="filter-item">
          <label htmlFor="maxProgress">최대 진행률:</label>
          <input
            type="range"
            id="maxProgress"
            name="maxProgress"
            min="0"
            max="100"
            value={filterConfig.maxProgress}
            onChange={handleFilterChange}
          />
          <span>{filterConfig.maxProgress}%</span>
        </div>
      </div>
      
      <div className="progress-table-container">
        <table className="progress-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('productName')}>제품명</th>
              <th onClick={() => handleSort('client')}>고객사</th>
              <th onClick={() => handleSort('startDate')}>시작일</th>
              <th onClick={() => handleSort('dueDate')}>납기일</th>
              <th onClick={() => handleSort('capacity')}>생산량</th>
              <th onClick={() => handleSort('progress')}>진행률</th>
              <th>상태</th>
            </tr>
          </thead>
          <tbody>
            {sortedProjects.map(project => {
              const timeStatus = getTimeStatus(project.startDate, project.dueDate);
              
              return (
                <tr key={project.id}>
                  <td>{project.productName}</td>
                  <td>{project.client}</td>
                  <td>{project.startDate}</td>
                  <td>{project.dueDate}</td>
                  <td>{project.capacity} Kg</td>
                  <td>
                    <div className="progress-bar-container">
                      <div 
                        className={`progress-bar ${getProgressStatus(project.progress)}`}
                        style={{ width: `${project.progress}%` }}
                      ></div>
                      <span className="progress-text">{project.progress}%</span>
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${timeStatus.status}`}>
                      {timeStatus.text}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      <div className="progress-summary">
        <div className="summary-card">
          <h3>전체 프로젝트</h3>
          <div className="summary-value">{projects?.length || 0}</div>
        </div>
        
        <div className="summary-card">
          <h3>평균 진행률</h3>
          <div className="summary-value">
            {projects?.length ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length) : 0}%
          </div>
        </div>
        
        <div className="summary-card">
          <h3>완료된 프로젝트</h3>
          <div className="summary-value">
            {projects?.filter(p => p.progress === 100).length || 0}
          </div>
        </div>
        
        <div className="summary-card">
          <h3>지연된 프로젝트</h3>
          <div className="summary-value">
            {projects?.filter(p => {
              const now = new Date();
              const end = new Date(p.dueDate);
              return now > end && p.progress < 100;
            }).length || 0}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessProgress;