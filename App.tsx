
import React, { useState, useMemo, useCallback } from 'react';
import { AppContext } from './contexts/AppContext';
import useLocalStorage from './hooks/useLocalStorage';
import type { Course, Topic } from './types';
import Dashboard from './components/Dashboard';
import LearningView from './components/LearningView';
import SubjectInputForm from './components/SubjectInputForm';

const App: React.FC = () => {
  const [courses, setCourses] = useLocalStorage<Course[]>('courses', []);
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
  const [view, setView] = useState<'dashboard' | 'learning' | 'new_course'>('dashboard');

  const activeCourse = useMemo(() => {
    return courses.find(c => c.id === activeCourseId) || null;
  }, [courses, activeCourseId]);

  const handleStartLearning = useCallback((courseId: string) => {
    setActiveCourseId(courseId);
    setView('learning');
  }, []);

  const handleCreateCourse = useCallback((newCourse: Course) => {
    setCourses(prevCourses => [...prevCourses, newCourse]);
    setActiveCourseId(newCourse.id);
    setView('learning');
  }, [setCourses]);

  const handleGoToDashboard = useCallback(() => {
    setActiveCourseId(null);
    setView('dashboard');
  }, []);

  const handleGoToNewCourse = useCallback(() => {
    setView('new_course');
  }, []);

  const updateCourse = useCallback((updatedCourse: Course) => {
    setCourses(prevCourses =>
      prevCourses.map(c => (c.id === updatedCourse.id ? updatedCourse : c))
    );
  }, [setCourses]);
  
  const appContextValue = useMemo(() => ({
      courses,
      addCourse: handleCreateCourse,
      updateCourse,
      activeCourse,
      startLearning: handleStartLearning,
      goToDashboard: handleGoToDashboard,
  }), [courses, activeCourse, handleCreateCourse, updateCourse, handleStartLearning, handleGoToDashboard]);


  const renderView = () => {
    switch (view) {
      case 'learning':
        return activeCourse && <LearningView key={activeCourse.id} />;
      case 'new_course':
        return <SubjectInputForm onCourseCreated={handleCreateCourse} onCancel={handleGoToDashboard} />;
      case 'dashboard':
      default:
        return <Dashboard onStartNewCourse={handleGoToNewCourse} />;
    }
  };

  return (
    <AppContext.Provider value={appContextValue}>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 font-sans">
        {renderView()}
      </div>
    </AppContext.Provider>
  );
};

export default App;