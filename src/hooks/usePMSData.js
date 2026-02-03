import { useState, useCallback, useEffect } from 'react';
import { fetchProjects, saveProjects } from '../api';

export const usePMSData = () => {
  const [projects, setProjects] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);

  // 1. Load data from server on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchProjects();
        setProjects(data);
      } catch (error) {
        console.error('Failed to load projects:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Helper to sync with server
  const syncWithServer = useCallback(async (updatedProjects) => {
    try {
      await saveProjects(updatedProjects);
    } catch (error) {
      console.error('Failed to sync with server:', error);
    }
  }, []);

  const addProject = useCallback(async (newProject) => {
    const updated = [...projects, {
      ...newProject,
      id: Date.now(),
      progress: Number(newProject.progress) || 0,
      includeHolidays: !!newProject.includeHolidays,
      dailyProduction: [],
      color: newProject.color || '#3b82f6'
    }];
    setProjects(updated);
    await syncWithServer(updated);
  }, [projects, syncWithServer]);

  const updateProject = useCallback(async (id, updatedData) => {
    const updated = projects.map(p => p.id === id ? { ...p, ...updatedData } : p);
    setProjects(updated);
    await syncWithServer(updated);
  }, [projects, syncWithServer]);

  const deleteProject = useCallback(async (id) => {
    const updated = projects.filter(p => p.id !== id);
    setProjects(updated);
    await syncWithServer(updated);
  }, [projects, syncWithServer]);

  // Holiday data (Shared logic or could be exported)
  const HOLIDAYS_2026 = [
    '2026-01-01', '2026-02-16', '2026-02-17', '2026-02-18', '2026-03-01', '2026-03-02',
    '2026-05-05', '2026-05-24', '2026-05-25', '2026-06-06', '2026-08-15', '2026-09-24',
    '2026-09-25', '2026-09-26', '2026-10-03', '2026-10-09', '2026-12-25'
  ];

  const getProjectsByDate = useCallback((dateString) => {
    const targetDate = new Date(dateString);
    const dayOfWeek = targetDate.getDay();
    const isHoliday = HOLIDAYS_2026.includes(dateString);
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isNonWorkingDay = isHoliday || isWeekend;

    return projects.filter(p => {
      // Check if project should be shown on this specific date
      if (isNonWorkingDay && !p.includeHolidays) {
        return false;
      }

      const startStr = p.startDate;
      const endStr = p.endDate;
      const dueStr = p.dueDate;
      const targetStr = dateString;
      return (targetStr >= startStr && targetStr <= endStr) || targetStr === dueStr;
    });
  }, [projects]);

  return {
    projects,
    selectedDate,
    setSelectedDate,
    isLoading,
    addProject,
    updateProject,
    deleteProject,
    getProjectsByDate
  };
};
