import { useState, useEffect } from 'react';
import { usePMSData } from './hooks/usePMSData';
import Calendar from './components/Calendar.jsx';
import ProjectModal from './components/ProjectModal.jsx';
import Clock from './components/Clock.jsx';
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
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

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

  const selectedDateString = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
  const activeProjects = getProjectsByDate(selectedDateString);

  return (
    <div className="pms-container">
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner">데이터를 불러오는 중...</div>
        </div>
      )}
      <header className="pms-header glass-panel">
        <div className="header-content">
          <div className="logo-container">
            <img src="/logo.png" alt="H&A PharmaChem Logo" className="header-logo" />
            <h1>생산관리시스템</h1>
          </div>
          <div className="header-right">
            <Clock />
            <button className="theme-toggle" onClick={toggleTheme} title="테마 전환">
              {isDarkMode ? '🌙 야간' : '☀️ 주간'}
            </button>
            <button className="primary" onClick={handleAddProject}>+ 새 프로젝트 추가</button>
          </div>
        </div>
      </header>

      <main className="pms-main">
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
                <div className="empty-state">해당 일제의 공정 일정이 없습니다.</div>
              )}
            </div>
          </section>
        </div>
      </main>

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
