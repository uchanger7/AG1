import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import './MobileMenu.css';

const MobileMenu = ({ activeTab, navItems, onTabChange, isDarkMode, toggleTheme }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // 메뉴가 열려있을 때 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  const handleTabClick = (tabId) => {
    onTabChange(tabId);
    setIsOpen(false);
  };
  
  return (
    <div className="mobile-menu-container">
      <button 
        className="mobile-menu-toggle" 
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "메뉴 닫기" : "메뉴 열기"}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
      
      <div className={`mobile-menu-overlay ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(false)}></div>
      
      <div className={`mobile-menu ${isOpen ? 'open' : ''}`}>
        <div className="mobile-menu-header">
          <img src="/logo.svg" alt="H&A PharmaChem" className="mobile-logo" />
          <h2>생산관리시스템</h2>
          <button 
            className="mobile-menu-close" 
            onClick={() => setIsOpen(false)}
            aria-label="메뉴 닫기"
          >
            <X size={24} />
          </button>
        </div>
        
        <nav className="mobile-nav">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`mobile-nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => handleTabClick(item.id)}
            >
              <span className="mobile-nav-icon">{item.icon}</span>
              <span className="mobile-nav-label">{item.label}</span>
            </button>
          ))}
        </nav>
        
        <div className="mobile-menu-footer">
          <button 
            className="mobile-theme-toggle" 
            onClick={toggleTheme}
          >
            {isDarkMode ? '☀️ 라이트 모드로 전환' : '🌙 다크 모드로 전환'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;