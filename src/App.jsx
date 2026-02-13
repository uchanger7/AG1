import { useState, useEffect } from 'react';
import { usePMSData } from './hooks/usePMSData';
import Calendar from './components/Calendar.jsx';
import ProjectModal from './components/ProjectModal.jsx';
import Clock from './components/Clock.jsx';
import Dashboard from './components/Dashboard.jsx';
import ProcessProgress from './components/ProcessProgress.jsx';
import ProductionDashboard from './components/ProductionDashboard.jsx';
import { Calendar as CalendarIcon, BarChart3, LineChart, Activity, Upload, PlusCircle, Sun, Moon } from 'lucide-react';
import './App.css';

function App() {
  const {
    projects,
    selectedDate,
    setSelectedDate,
    addProject,
    updateProject,
    deleteProject,
    isLoading,
    getProjectsByDate
  } = usePMSData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [activeTab, setActiveTab] = useState('calendar'); // 'calendar', 'dashboard', 'progress', 'production'
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  // 06:00 ~ 18:00 is Day (Light Mode), otherwise Night (Dark Mode)
  const isDayTime = () => {
    const hour = new Date().getHours();
    return hour >= 6 && hour < 18;
  };

  const [isDarkMode, setIsDarkMode] = useState(!isDayTime());

  useEffect(() => {
    // Sync theme with body class
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }

    // Auto update theme when time passes 06:00 or 18:00
    const interval = setInterval(() => {
      const currentIsDay = isDayTime();
      if (isDarkMode === currentIsDay) { // If inconsistent, sync it
        setIsDarkMode(!currentIsDay);
      }
      
      // 현재 날짜 업데이트
      setCurrentDate(new Date());
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);
  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

  const handleDateClick = (date) => {
    setSelectedDate(date);
    // If you want to open modal on date click to add or edit, do it here
    // For now, let's say it just selects the date
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const handleAddProject = () => {
    setEditingProject(null);
    setIsModalOpen(true);
  };

  // 엑셀 파일 업로드 처리 함수
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // 파일 확장자 확인
    const fileExt = file.name.split('.').pop().toLowerCase();
    if (fileExt !== 'xls' && fileExt !== 'xlsx') {
      alert('엑셀 파일(.xls, .xlsx)만 업로드 가능합니다.');
      return;
    }

    // FormData 생성
    const formData = new FormData();
    formData.append('excelFile', file);

    // 서버에 파일 업로드 요청
    fetch('/api/upload-excel', {
      method: 'POST',
      body: formData,
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('파일 업로드에 실패했습니다.');
        }
        return response.json();
      })
      .then(data => {
        alert(`${data.count}개의 일정이 성공적으로 추가되었습니다.`);
        // 데이터 새로고침
        window.location.reload();
      })
      .catch(error => {
        console.error('Error:', error);
        alert('파일 업로드 중 오류가 발생했습니다.');
      });
  };

  const selectedDateString = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
  const activeProjects = getProjectsByDate(selectedDateString);

  const navItems = [
    { id: 'calendar', label: '캘린더', icon: <CalendarIcon size={20} /> },
    { id: 'dashboard', label: '대시보드', icon: <BarChart3 size={20} /> },
    { id: 'progress', label: '공정 진행률', icon: <Activity size={20} /> },
    { id: 'production', label: '생산관리 모니터링', icon: <LineChart size={20} /> }
  ];

  // 오늘 날짜 포맷팅
  const todayFormatted = currentDate.toLocaleDateString('ko-KR', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    weekday: 'long'
  });

  return (
    <div className="pms-container">
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner">데이터를 불러오는 중...</div>
        </div>
      )}
      
      <div className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-container">
            <img src="/logo.svg" alt="Logo" className="sidebar-logo" />
            {!sidebarCollapsed && <h2>생산관리시스템</h2>}
          </div>
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            {sidebarCollapsed ? '›' : '‹'}
          </button>
        </div>
        
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`sidebar-nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
              title={sidebarCollapsed ? item.label : ''}
            >
              <span className="sidebar-icon">{item.icon}</span>
              {!sidebarCollapsed && <span className="sidebar-label">{item.label}</span>}
            </button>
          ))}
        </nav>
        
        {activeTab === 'calendar' && !sidebarCollapsed && (
          <div className="sidebar-actions">
            <button className="sidebar-action-btn" onClick={handleAddProject}>
              <PlusCircle size={18} />
              <span>새 프로젝트</span>
            </button>
            
            <label htmlFor="excel-upload" className="sidebar-action-btn">
              <Upload size={18} />
              <span>엑셀 업로드</span>
            </label>
            <input 
              id="excel-upload" 
              type="file" 
              accept=".xls,.xlsx" 
              onChange={handleFileUpload} 
              style={{ display: 'none' }} 
            />
          </div>
        )}
        
        <div className="sidebar-footer">
          <button className="theme-toggle-btn" onClick={toggleTheme} title={isDarkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}>
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            {!sidebarCollapsed && <span>{isDarkMode ? '라이트 모드' : '다크 모드'}</span>}
          </button>
        </div>
      </div>

      <div className="main-content">
        <header className="main-header glass-panel">
          <div className="header-content">
            <div className="header-left">
              <h1 className="page-title">
                {navItems.find(item => item.id === activeTab)?.label}
              </h1>
              <div className="today-date">{todayFormatted}</div>
            </div>
            <div className="header-right">
              <Clock />
              {activeTab === 'calendar' && sidebarCollapsed && (
                <div className="header-actions">
                  <button className="header-action-btn" onClick={handleAddProject}>
                    <PlusCircle size={18} />
                    <span>새 프로젝트</span>
                  </button>
                  
                  <label htmlFor="excel-upload-header" className="header-action-btn">
                    <Upload size={18} />
                    <span>엑셀 업로드</span>
                  </label>
                  <input 
                    id="excel-upload-header" 
                    type="file" 
                    accept=".xls,.xlsx" 
                    onChange={handleFileUpload} 
                    style={{ display: 'none' }} 
                  />
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="main-area">
          {activeTab === 'calendar' && (
            <div className="dashboard-grid">
              <section className="calendar-section glass-panel">
                <Calendar
                  selectedDate={selectedDate}
                  onDateClick={handleDateClick}
                  projects={projects}
                />
              </section>

              <section className="detail-section glass-panel">
                <div className="detail-header">
                  <h2>{selectedDate.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })} 일정</h2>
                </div>
                <div className="project-list">
                  {activeProjects.length > 0 ? (
                    activeProjects.map(project => (
                      <div
                        key={project.id}
                        className="project-card card"
                        onClick={() => handleEditProject(project)}
                        style={{
                          '--project-color': project.color,
                          '--project-color-bg': project.color + '25' // 15% opacity tint
                        }}
                      >
                        <div className="project-info">
                          <h3>{project.productName} <span className="client">({project.client})</span></h3>
                          <p className="capacity">목표 용량: {project.capacity}Kg</p>
                          <div className="progress-wrapper">
                            <span>진행률: {project.progress}%</span>
                            <div className="progress-container">
                              <div className="progress-bar" style={{ width: `${project.progress}%`, backgroundColor: project.color }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state">해당 일자의 공정 일정이 없습니다.</div>
                  )}
                </div>
              </section>
            </div>
          )}

          {activeTab === 'dashboard' && (
            <Dashboard projects={projects} />
          )}

          {activeTab === 'progress' && (
            <ProcessProgress />
          )}

          {activeTab === 'production' && (
            <ProductionDashboard projects={projects} />
          )}
        </main>
      </div>

      {isModalOpen && (
        <ProjectModal
          project={editingProject}
          onClose={() => setIsModalOpen(false)}
          onDelete={(id) => {
            deleteProject(id);
            setIsModalOpen(false);
          }}
          onSave={(data) => {
            if (editingProject) updateProject(editingProject.id, data);
            else addProject(data);
            setIsModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

export default App;