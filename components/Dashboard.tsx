
import React, { useContext } from 'react';
import { AppContext } from '../contexts/AppContext';
import Icon from './Icon';

interface DashboardProps {
  onStartNewCourse: () => void;
}

const CourseCard: React.FC<{ course: import('../types').Course; onResume: () => void; }> = ({ course, onResume }) => {
  const completedTopics = course.topics.filter(t => t.status === 'completed').length;
  const progress = Math.round((completedTopics / course.topics.length) * 100);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className="p-6">
        <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
                 <div className="text-4xl">{course.icon || '🎓'}</div>
                <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{course.subject}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {completedTopics} / {course.topics.length} topics completed
                    </p>
                </div>
            </div>
          <button onClick={onResume} className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900 transition-transform transform hover:scale-105">
            {progress > 0 ? 'Resume' : 'Start'}
          </button>
        </div>
        <div className="mt-4">
          <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ onStartNewCourse }) => {
  const context = useContext(AppContext);

  if (!context) {
    return <div>Loading...</div>;
  }
  
  const { courses, startLearning } = context;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800/50 backdrop-blur-sm shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Icon name="robot" className="w-8 h-8 text-blue-500" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Learning</h1>
          </div>
          <button
            onClick={onStartNewCourse}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900 transition-transform transform hover:scale-105"
          >
            <Icon name="plus" className="w-5 h-5" />
            New Course
          </button>
        </div>
      </header>

      <main className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map(course => (
                <CourseCard key={course.id} course={course} onResume={() => startLearning(course.id)} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 px-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
              <Icon name="book" className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500" />
              <h2 className="mt-4 text-2xl font-semibold text-gray-900 dark:text-white">Your learning journey starts here.</h2>
              <p className="mt-2 text-gray-500 dark:text-gray-400">Create your first personalized course to get started.</p>
              <div className="mt-6">
                <button
                  onClick={onStartNewCourse}
                  className="inline-flex items-center gap-2 px-6 py-3 text-base font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-transform transform hover:scale-105"
                >
                  <Icon name="plus" className="w-5 h-5" />
                  Create a New Course
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;