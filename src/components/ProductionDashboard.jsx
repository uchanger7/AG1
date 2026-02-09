import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, ResponsiveContainer } from 'recharts';
import './ProductionDashboard.css';

const ProductionDashboard = ({ projects }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  // 라인별 데이터 (이미지 기준으로 구성)
  const linesData = [
    { id: 1, name: 'LINE 1 - PIPE A100', target: 15000, current: 8308, progress: 55 },
    { id: 2, name: 'LINE 2 - PIPE A150', target: 20000, current: 17209, progress: 86 },
    { id: 3, name: 'LINE 3 - PIPE A200', target: 8000, current: 2953, progress: 36 },
    { id: 4, name: 'LINE 4 - PIPE A250', target: 5000, current: 1426, progress: 28 },
    { id: 5, name: 'LINE 5 - PIPE A300', target: 6000, current: 1504, progress: 25 }
  ];

  // 라인별 시간 가동률 데이터
  const lineOperationData = [
    { name: '10:25', LINE1: 7.7, LINE2: 11.2, LINE3: 7.9, LINE4: 7.2, LINE5: 8.1 },
    { name: '10:26', LINE1: 7.8, LINE2: 11.0, LINE3: 8.0, LINE4: 7.1, LINE5: 8.0 },
    { name: '10:27', LINE1: 7.6, LINE2: 11.3, LINE3: 7.8, LINE4: 7.3, LINE5: 8.2 },
    { name: '10:28', LINE1: 7.7, LINE2: 11.1, LINE3: 7.9, LINE4: 7.2, LINE5: 8.0 },
    { name: '10:29', LINE1: 7.8, LINE2: 11.2, LINE3: 8.0, LINE4: 7.1, LINE5: 8.1 },
    { name: '10:30', LINE1: 7.7, LINE2: 11.2, LINE3: 7.9, LINE4: 7.2, LINE5: 8.1 }
  ];

  // 라인별 생산비율 데이터
  const productionRatioData = [
    { name: 'PIPE A100', value: 26, color: '#FFD700' },
    { name: 'PIPE A150', value: 55, color: '#00CED1' },
    { name: 'PIPE A200', value: 10, color: '#FF6347' },
    { name: 'PIPE A250', value: 5, color: '#32CD32' },
    { name: 'PIPE A300', value: 4, color: '#9370DB' }
  ];

  // 라인별 실적 데이터
  const performanceData = [
    { name: 'LINE 1', plan: 80, actual: 55 },
    { name: 'LINE 2', plan: 100, actual: 90 },
    { name: 'LINE 3', plan: 60, actual: 40 },
    { name: 'LINE 4', plan: 40, actual: 30 },
    { name: 'LINE 5', plan: 50, actual: 35 }
  ];

  // 온도 데이터
  const temperatureData = [
    { name: '10:25', 내부: 31.6, 외부: 66.3 },
    { name: '10:26', 내부: 31.5, 외부: 66.2 },
    { name: '10:27', 내부: 31.7, 외부: 66.4 },
    { name: '10:28', 내부: 31.6, 외부: 66.3 },
    { name: '10:29', 내부: 31.5, 외부: 66.2 },
    { name: '10:30', 내부: 31.6, 외부: 66.3 }
  ];

  // 프로젝트 데이터를 기반으로 공정률 계산
  const calculateProjectProgress = () => {
    if (!projects || projects.length === 0) return 0;
    const totalProgress = projects.reduce((sum, project) => sum + project.progress, 0);
    return Math.round(totalProgress / projects.length);
  };

  const overallProgress = calculateProjectProgress();

  return (
    <div className="production-dashboard">
      <div className="dashboard-header">
        <div className="dashboard-logo">
          <img src="/logo.png" alt="IOT KOREA" className="logo-image" />
          <span>IOT KOREA</span>
        </div>
        <h1 className="dashboard-title">생산관리 모니터링</h1>
        <div className="dashboard-time">
          {currentTime.toLocaleDateString('ko-KR')} {currentTime.toLocaleTimeString('ko-KR')}
        </div>
      </div>
      
      <div className="dashboard-grid">
        {/* 라인별 생산 현황 */}
        <div className="dashboard-row">
          {linesData.map(line => (
            <div key={line.id} className="line-status-card">
              <div className="line-header">{line.name}</div>
              <div className="line-stats">
                <div className="line-progress-container">
                  <div className="progress-circle" style={{ '--progress': `${line.progress}%` }}>
                    <span className="progress-text">{line.progress}%</span>
                  </div>
                </div>
                <div className="line-numbers">
                  <div className="line-target">목표 {line.target}</div>
                  <div className="line-current">달성 {line.current}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* 차트 및 데이터 시각화 */}
        <div className="dashboard-row charts-row">
          {/* 라인별 시간 가동률 */}
          <div className="chart-card">
            <h3>라인별 시간 가동률</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={lineOperationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="LINE1" stroke="#8884d8" />
                <Line type="monotone" dataKey="LINE2" stroke="#82ca9d" />
                <Line type="monotone" dataKey="LINE3" stroke="#ffc658" />
                <Line type="monotone" dataKey="LINE4" stroke="#ff8042" />
                <Line type="monotone" dataKey="LINE5" stroke="#0088fe" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          {/* 라인별 생산비율 */}
          <div className="chart-card">
            <h3>라인별 생산비율(%)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={productionRatioData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {productionRatioData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* CCTV 화면 */}
          <div className="chart-card cctv-card">
            <h3>CCTV_01</h3>
            <div className="cctv-placeholder">
              <img src="/cctv-placeholder.jpg" alt="CCTV Feed" className="cctv-image" />
            </div>
          </div>
        </div>
        
        <div className="dashboard-row">
          {/* 라인별 실적 */}
          <div className="chart-card">
            <h3>라인별 실적</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="plan" fill="#8884d8" name="계획" />
                <Bar dataKey="actual" fill="#82ca9d" name="실적" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* 라인별 보조버튼 */}
          <div className="chart-card">
            <h3>라인별 보조버튼</h3>
            <div className="line-buttons">
              {[1, 2, 3, 4, 5].map(line => (
                <div key={line} className="line-button">
                  <span>{line}번 라인</span>
                  <span className="status">운전중</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* 공장 내부 온도 */}
          <div className="chart-card">
            <h3>공장 내부 온도 | 습도 그래프</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={temperatureData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="내부" stroke="#ff0000" />
                <Line type="monotone" dataKey="외부" stroke="#0000ff" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 프로젝트 진행 상황 */}
        <div className="dashboard-row">
          <div className="chart-card full-width">
            <h3>전체 프로젝트 진행 상황</h3>
            <div className="projects-overview">
              <div className="overall-progress-container">
                <div className="overall-progress-circle" style={{ '--progress': `${overallProgress}%` }}>
                  <span className="progress-text">{overallProgress}%</span>
                </div>
                <div className="overall-progress-label">전체 평균 진행률</div>
              </div>
              
              <div className="projects-list">
                {projects.slice(0, 5).map(project => (
                  <div key={project.id} className="project-progress-item">
                    <div className="project-info">
                      <div className="project-name">{project.productName}</div>
                      <div className="project-client">{project.client}</div>
                    </div>
                    <div className="project-progress-bar-container">
                      <div 
                        className="project-progress-bar" 
                        style={{ width: `${project.progress}%`, backgroundColor: project.color }}
                      ></div>
                    </div>
                    <div className="project-progress-value">{project.progress}%</div>
                  </div>
                ))}
                {projects.length > 5 && (
                  <div className="more-projects">+ {projects.length - 5}개 더보기</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="dashboard-footer">
        <p>항상 작업장 주변을 청소하고 정리정돈 해주세요!</p>
      </div>
    </div>
  );
};

export default ProductionDashboard;