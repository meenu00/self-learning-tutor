
import React, { useState, useEffect } from 'react';
import { generateTask, evaluateTask } from '../services/geminiService';
import type { Topic, Task, TaskEvaluation } from '../types';
import Spinner from './Spinner';
import Icon from './Icon';

interface TaskModalProps {
  topic: Topic;
  subject: string;
  onClose: () => void;
  onComplete: () => void;
}

const TaskModal: React.FC<TaskModalProps> = ({ topic, subject, onClose, onComplete }) => {
  const [task, setTask] = useState<Task | null>(null);
  const [submission, setSubmission] = useState('');
  const [evaluation, setEvaluation] = useState<TaskEvaluation | null>(null);
  const [view, setView] = useState<'task' | 'evaluating' | 'result'>('task');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTask = async () => {
      setView('evaluating'); // Use evaluating state for loading task as well
      setError(null);
      try {
        const taskDetails = await generateTask(topic.title, subject);
        setTask(taskDetails);
        setView('task');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load task.');
        setView('task'); // Go back to task view to show error
      }
    };
    fetchTask();
  }, [topic, subject]);

  const handleSubmit = async () => {
    if (!task || !submission) return;
    setView('evaluating');
    setError(null);
    try {
      const result = await evaluateTask(task.description, submission, topic.title);
      setEvaluation(result);
      setView('result');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to evaluate task.');
      setView('task');
    }
  };
  
  const renderContent = () => {
    switch (view) {
      case 'evaluating':
        return <div className="h-96 flex items-center justify-center"><Spinner size="lg" text={task ? "Evaluating your submission..." : "Generating your task..."} /></div>;
      
      case 'result':
        if (!evaluation) return null;
        return (
          <div className="text-center p-8 flex flex-col items-center">
            {evaluation.passed ? <Icon name="check" className="w-20 h-20 text-green-500 bg-green-100 dark:bg-green-900/50 rounded-full p-3" /> :
             <Icon name="x" className="w-20 h-20 text-red-500 bg-red-100 dark:bg-red-900/50 rounded-full p-3" />}
            <h2 className="text-3xl font-bold mt-4">{evaluation.passed ? 'Checkpoint Passed!' : 'Needs Improvement'}</h2>
            <div className="mt-2 text-lg">Score: <span className="font-bold">{evaluation.score}/100</span></div>
            <div className="mt-4 text-left w-full p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                <p className="font-semibold">Feedback:</p>
                <p className="text-gray-600 dark:text-gray-300">{evaluation.feedback}</p>
            </div>
            <button
              onClick={evaluation.passed ? onComplete : () => setView('task')}
              className={`mt-6 px-8 py-3 font-semibold text-white rounded-lg ${evaluation.passed ? 'bg-blue-600 hover:bg-blue-700' : 'bg-orange-500 hover:bg-orange-600'}`}
            >
              {evaluation.passed ? 'Continue to Next Topic' : 'Try Again'}
            </button>
          </div>
        );

      case 'task':
      default:
        return (
          <div className="p-6 md:p-8">
            {task ? (
              <>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{task.description}</h2>
                <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                    <p className="font-semibold">Evaluation Criteria:</p>
                    <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{task.evaluationCriteria}</p>
                </div>
                <textarea
                  value={submission}
                  onChange={(e) => setSubmission(e.target.value)}
                  placeholder="Paste your code or write your solution here..."
                  rows={10}
                  className="w-full mt-6 p-4 font-mono text-sm bg-gray-900 text-gray-200 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                <div className="mt-6 flex justify-end">
                  <button onClick={handleSubmit} disabled={!submission} className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400">
                    Submit for Evaluation
                  </button>
                </div>
              </>
            ) : (
                <div className="text-gray-500 p-4">{error || 'No task details available.'}</div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-xl font-bold">Checkpoint: {topic.title}</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
            <Icon name="x" className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-grow overflow-y-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default TaskModal;