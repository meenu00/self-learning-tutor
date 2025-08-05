
import React, { useState } from 'react';
import { generateCourseOutline } from '../services/geminiService';
import type { Course } from '../types';
import Spinner from './Spinner';
import Icon from './Icon';

interface SubjectInputFormProps {
  onCourseCreated: (course: Course) => void;
  onCancel: () => void;
}

const SubjectInputForm: React.FC<SubjectInputFormProps> = ({ onCourseCreated, onCancel }) => {
  const [subject, setSubject] = useState('');
  const [topics, setTopics] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject) {
      setError('Please enter a subject to learn.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const outline = await generateCourseOutline(subject, topics);
      const newCourse: Course = {
        ...outline,
        id: `course-${Date.now()}`,
        createdAt: new Date().toISOString(),
        topics: outline.topics.map((topic, index) => ({
          ...topic,
          id: `topic-${Date.now()}-${index}`,
          status: index === 0 ? 'unlocked' : 'locked',
        })),
      };
      onCourseCreated(newCourse);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 transform transition-all">
        <div className="text-center mb-8">
            <div className="flex justify-center items-center gap-3">
                <Icon name="robot" className="w-10 h-10 text-blue-500"/>
                <h1 className="text-4xl font-bold text-gray-800 dark:text-white">Create Your Learning Path</h1>
            </div>
          <p className="text-gray-500 dark:text-gray-400 mt-2">What do you want to master next?</p>
        </div>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Spinner size="lg" text="Crafting your personalized course... this can take a moment." />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., Web Development with React"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                required
              />
            </div>
            <div>
              <label htmlFor="topics" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Optional Syllabus / Topics
              </label>
              <textarea
                id="topics"
                value={topics}
                onChange={(e) => setTopics(e.target.value)}
                placeholder="e.g., Introduction to HTML, CSS basics, JavaScript fundamentals..."
                rows={4}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
               <p className="text-xs text-gray-400 mt-1">Provide a list of topics from your syllabus to customize the learning path.</p>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="flex items-center justify-between pt-4">
              <button type="button" onClick={onCancel} className="px-6 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-8 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 font-semibold shadow-lg transform hover:scale-105 transition"
              >
                <Icon name="sparkles" className="w-5 h-5" />
                Generate Path
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SubjectInputForm;