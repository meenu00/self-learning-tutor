
import { createContext } from 'react';
import type { Course } from '../types';

interface AppContextType {
  courses: Course[];
  addCourse: (course: Course) => void;
  updateCourse: (course: Course) => void;
  activeCourse: Course | null;
  startLearning: (courseId: string) => void;
  goToDashboard: () => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);