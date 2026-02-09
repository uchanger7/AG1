import { useState, useEffect, useMemo } from 'react';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Calendar, 
  Users, 
  Package, 
  Clock, 
  AlertTriangle,
  CheckCircle2,
  Timer,
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import './Dashboard.css';

const Dashboard = ({ projects }) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('all');
  const [animateCharts, setAnimateCharts] = useState(false);

  // 애니메이션 효과를 위한 설정
  useEffect(() => {
    setAnimateCharts(true);
    const timer = setTimeout(() => setAnimateCharts(false), 1000);
    return () => clearTimeout(timer);
  }, [selectedTimeRange]);

  // 시간 범위에 따른 프로젝트 필터링
  const filteredProjects = useMemo(() => {
    if (selectedTimeRange === 'all') return projects;
    
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);
    
    if (selectedTimeRange === '30days') {
      return projects.filter(p => new Date(p.startDate) >= thirtyDaysAgo);
    } else if (selectedTimeRange === '7days') {
      return projects.filter(p => new Date(p.startDate) >= sevenDaysAgo);
    }
    return projects;
  }, [projects, selectedTimeRange]);

  // 통계 계산
  const stats = useMemo(() => {
    if (!filteredProjects || filteredProjects.length === 0) {
      return {
        totalProjects: 0,
        completedProjects: 0,
        inProgressProjects: 0,
        upcomingProjects: 0,
        averageProgress: 0,
        totalCapacity: 0,
        clientStats: [],
        productStats: [],
        monthlyProjects: []
      };
    }

    // 현재 날짜
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 완료된 프로젝트 (진행률 100%)
    const completed = filteredProjects.filter(p => p.progress === 100);
    
    // 진행 중인 프로젝트 (시작일이 오늘 이전이고, 종료일이 오늘 이후이며, 진행률이 100% 미만)
    const inProgress = filteredProjects.filter(p => {
      const startDate = new Date(p.startDate);
      const endDate = new Date(p.endDate);
      return startDate <= today && endDate >= today && p.progress < 100;
    });
    
    // 예정된 프로젝트 (시작일이 오늘 이후)
    const upcoming = filteredProjects.filter(p => {
      const startDate = new Date(p.startDate);
      return startDate > today;
    });

    // 평균 진행률
    const totalProgress = filteredProjects.reduce((sum, p) => sum + p.progress, 0);
    const averageProgress = Math.round(totalProgress / filteredProjects.length);

    // 총 생산량
    const totalCapacity = filteredProjects.reduce((sum, p) => sum + parseFloat(p.capacity || 0), 0);

    // 고객사별 통계
    const clientMap = {};
    filteredProjects.forEach(p => {
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
        totalCapacity: data.totalCapacity,
        percentage: (data.count / filteredProjects.length) * 100
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // 상위 5개

    // 제품별 통계
    const productMap = {};
    filteredProjects.forEach(p => {
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
        totalCapacity: data.totalCapacity,
        percentage: (data.totalCapacity / totalCapacity) * 100
      }))
      .sort((a, b) => b.totalCapacity - a.totalCapacity)
      .slice(0, 5); // 상위 5개

    // 월별 프로젝트 수
    const monthlyMap = {};
    filteredProjects.forEach(p => {
      const startDate = new Date(p.startDate);
      const monthYear = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyMap[monthYear]) {
        monthlyMap[monthYear] = 0;
      }
      monthlyMap[monthYear]++;
    });

    const monthlyProjects = Object.entries(monthlyMap)
      .map(([month, count]) => {
        const [year, monthNum] = month.split('-');
        const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
        const displayName = `${year}년 ${monthNames[parseInt(monthNum) - 1]}`;
        return { month: displayName, count };
      })
      .sort((a, b) => a.month.localeCompare(b.month));

    return {
      totalProjects: filteredProjects.length,
      completedProjects: completed.length,
      inProgressProjects: inProgress.length,
      upcomingProjects: upcoming.length,
      averageProgress,
      totalCapacity,
      clientStats,
      productStats,
      monthlyProjects
    };
  }, [filteredProjects]);

  // 납기일 임박한 프로젝트 (7일 이내)
  const urgentProjects = useMemo(() => {
    const today = new Date();
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(today.getDate() + 7);
    
    return projects
      .filter(p => {
        const dueDate = new Date(p.dueDate);
        return dueDate >= today && dueDate <= sevenDaysLater && p.progress < 100;
      })
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  }, [projects]);

  // 최근 추가된 프로젝트
  const recentProjects = useMemo(() => {
    return [...projects]
      .sort((a, b) => {
        // ID가 높을수록 최근에 추가된 것으로 가정
        return b.id - a.id;
      })
      .slice(0, 5);
  }, [projects]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const calculateDaysLeft = (dateString) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(dateString);
    dueDate.setHours(0, 0, 0, 0);
    
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">생산 대시보드</h1>
        <div className="time-filter">
          <button 
            className={`time-filter-btn ${selectedTimeRange === '7days' ? 'active' : ''}`}
            onClick={() => setSelectedTimeRange('7days')}
          >
            최근 7일
          </button>
          <button 
            className={`time-filter-btn ${selectedTimeRange === '30days' ? 'active' : ''}`}
            onClick={() => setSelectedTimeRange('30days')}
          >
            최근 30일
          </button>
          <button 
            className={`time-filter-btn ${selectedTimeRange === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedTimeRange('all')}
          >
            전체 기간
          </button>
        </div>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <BarChart3 size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-title">전체 프로젝트</div>
            <div className="stat-value">{stats.totalProjects}</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon success">
            <CheckCircle2 size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-title">완료된 프로젝트</div>
            <div className="stat-value">{stats.completedProjects}</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon info">
            <Timer size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-title">진행 중인 프로젝트</div>
            <div className="stat-value">{stats.inProgressProjects}</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon warning">
            <Calendar size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-title">예정된 프로젝트</div>
            <div className="stat-value">{stats.upcomingProjects}</div>
          </div>
        </div>
      </div>
      
      <div className="dashboard-row">
        <div className="chart-card progress-overview">
          <div className="card-header">
            <h2 className="card-title">
              <TrendingUp size={18} />
              전체 진행률
            </h2>
          </div>
          <div className="overall-progress-container">
            <div className="progress-circle-wrapper">
              <div 
                className={`progress-circle ${animateCharts ? 'animate-progress' : ''}`}
                style={{ '--progress': `${stats.averageProgress}%` }}
              >
                <div className="progress-circle-inner">
                  <span className="progress-text">{stats.averageProgress}%</span>
                </div>
              </div>
            </div>
            <div className="progress-details">
              <div className="progress-stat">
                <div className="progress-stat-label">총 생산량</div>
                <div className="progress-stat-value">{stats.totalCapacity.toLocaleString()} Kg</div>
              </div>
              <div className="progress-stat">
                <div className="progress-stat-label">완료</div>
                <div className="progress-stat-value">{stats.completedProjects} 건</div>
              </div>
              <div className="progress-stat">
                <div className="progress-stat-label">진행 중</div>
                <div className="progress-stat-value">{stats.inProgressProjects} 건</div>
              </div>
              <div className="progress-stat">
                <div className="progress-stat-label">예정</div>
                <div className="progress-stat-value">{stats.upcomingProjects} 건</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="chart-card urgent-projects">
          <div className="card-header">
            <h2 className="card-title">
              <AlertTriangle size={18} />
              납기일 임박 프로젝트
            </h2>
          </div>
          <div className="urgent-projects-list">
            {urgentProjects.length > 0 ? (
              urgentProjects.slice(0, 3).map(project => (
                <div key={project.id} className="urgent-project-item">
                  <div className="urgent-project-info">
                    <div className="urgent-project-name">{project.productName}</div>
                    <div className="urgent-project-client">{project.client}</div>
                  </div>
                  <div className="urgent-project-date">
                    <div className="urgent-due-date">{formatDate(project.dueDate)}</div>
                    <div className={`urgent-days-left ${calculateDaysLeft(project.dueDate) <= 3 ? 'danger' : 'warning'}`}>
                      {calculateDaysLeft(project.dueDate)}일 남음
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-list-message">납기일이 임박한 프로젝트가 없습니다.</div>
            )}
            {urgentProjects.length > 3 && (
              <a href="#" className="view-all-link">
                모든 임박 프로젝트 보기 <ChevronRight size={16} />
              </a>
            )}
          </div>
        </div>
      </div>
      
      <div className="dashboard-row">
        <div className="chart-card">
          <div className="card-header">
            <h2 className="card-title">
              <Users size={18} />
              고객사별 프로젝트
            </h2>
          </div>
          <div className="chart-container">
            {stats.clientStats.map((item, index) => (
              <div key={index} className="chart-item">
                <div className="chart-label">{item.client}</div>
                <div className="chart-bar-container">
                  <div 
                    className={`chart-bar ${animateCharts ? 'animate-width' : ''}`}
                    style={{ 
                      width: `${Math.min(100, item.percentage)}%`,
                      backgroundColor: `hsl(${index * 25 + 200}, 70%, 50%)`
                    }}
                  ></div>
                </div>
                <div className="chart-value">{item.count}건</div>
              </div>
            ))}
            {stats.clientStats.length === 0 && (
              <div className="empty-list-message">데이터가 없습니다.</div>
            )}
          </div>
        </div>
        
        <div className="chart-card">
          <div className="card-header">
            <h2 className="card-title">
              <Package size={18} />
              제품별 생산량
            </h2>
          </div>
          <div className="chart-container">
            {stats.productStats.map((item, index) => (
              <div key={index} className="chart-item">
                <div className="chart-label" title={item.productName}>
                  {item.productName.length > 15 ? item.productName.substring(0, 15) + '...' : item.productName}
                </div>
                <div className="chart-bar-container">
                  <div 
                    className={`chart-bar ${animateCharts ? 'animate-width' : ''}`}
                    style={{ 
                      width: `${Math.min(100, item.percentage)}%`,
                      backgroundColor: `hsl(${index * 25 + 100}, 70%, 50%)`
                    }}
                  ></div>
                </div>
                <div className="chart-value">{item.totalCapacity.toLocaleString()}Kg</div>
              </div>
            ))}
            {stats.productStats.length === 0 && (
              <div className="empty-list-message">데이터가 없습니다.</div>
            )}
          </div>
        </div>
      </div>
      
      <div className="dashboard-row">
        <div className="chart-card monthly-trend">
          <div className="card-header">
            <h2 className="card-title">
              <PieChart size={18} />
              월별 프로젝트 추이
            </h2>
          </div>
          <div className="monthly-chart">
            {stats.monthlyProjects.map((item, index) => (
              <div key={index} className="monthly-bar-container">
                <div className="monthly-bar-label">{item.month}</div>
                <div className="monthly-bar-wrapper">
                  <div 
                    className={`monthly-bar ${animateCharts ? 'animate-height' : ''}`}
                    style={{ 
                      height: `${Math.min(100, (item.count / Math.max(...stats.monthlyProjects.map(s => s.count))) * 100)}%`,
                      backgroundColor: `hsl(${index * 15 + 220}, 70%, 50%)`
                    }}
                  ></div>
                </div>
                <div className="monthly-bar-value">{item.count}</div>
              </div>
            ))}
            {stats.monthlyProjects.length === 0 && (
              <div className="empty-list-message">데이터가 없습니다.</div>
            )}
          </div>
        </div>
        
        <div className="chart-card recent-projects">
          <div className="card-header">
            <h2 className="card-title">
              <Clock size={18} />
              최근 추가된 프로젝트
            </h2>
          </div>
          <div className="recent-projects-list">
            {recentProjects.length > 0 ? (
              recentProjects.map(project => (
                <div key={project.id} className="recent-project-item">
                  <div 
                    className="recent-project-color" 
                    style={{ backgroundColor: project.color }}
                  ></div>
                  <div className="recent-project-info">
                    <div className="recent-project-name">{project.productName}</div>
                    <div className="recent-project-client">{project.client}</div>
                  </div>
                  <div className="recent-project-details">
                    <div className="recent-project-capacity">{project.capacity} Kg</div>
                    <div className="recent-project-date">{formatDate(project.startDate)}</div>
                  </div>
                  <div className="recent-project-progress">
                    <div className="mini-progress-bar-container">
                      <div 
                        className="mini-progress-bar"
                        style={{ 
                          width: `${project.progress}%`,
                          backgroundColor: project.color
                        }}
                      ></div>
                    </div>
                    <div className="mini-progress-value">{project.progress}%</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-list-message">최근 추가된 프로젝트가 없습니다.</div>
            )}
            <a href="#" className="view-all-link">
              모든 프로젝트 보기 <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;