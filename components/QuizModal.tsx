
import React, { useState, useEffect, useCallback } from 'react';
import { generateQuiz } from '../services/geminiService';
import type { Topic, QuizQuestion } from '../types';
import Spinner from './Spinner';
import Icon from './Icon';

interface QuizModalProps {
  topic: Topic;
  onClose: () => void;
  onComplete: () => void;
}

const QuizModal: React.FC<QuizModalProps> = ({ topic, onClose, onComplete }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      if (!topic.content) return;
      setIsLoading(true);
      setError(null);
      try {
        const quizQuestions = await generateQuiz(topic.content, topic.title);
        setQuestions(quizQuestions);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load quiz.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuiz();
  }, [topic]);

  const handleAnswerSelect = (answer: string) => {
    if (isAnswered) return;
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer) return;
    setIsAnswered(true);
    if (selectedAnswer === questions[currentQuestionIndex].correctAnswer) {
      setScore(s => s + 1);
    }
  };
  
  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(i => i + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
        // Quiz finished
        if (score / questions.length >= 0.7) { // 70% passing score
            onComplete();
        } else {
            // Handled by result screen
        }
    }
  };
  
  const currentQuestion = questions[currentQuestionIndex];
  const isQuizFinished = currentQuestionIndex >= questions.length -1 && isAnswered;

  const renderContent = () => {
    if (isLoading) return <div className="h-96 flex items-center justify-center"><Spinner size="lg" text="Preparing your quiz..."/></div>;
    if (error) return <div className="p-4 text-red-500">{error}</div>;
    
    if (questions.length === 0) {
        return <div className="h-96 flex items-center justify-center text-gray-500">Could not generate a quiz for this topic.</div>;
    }
    
    if (isQuizFinished) {
        const pass = score / questions.length >= 0.7;
        return (
            <div className="text-center p-8 flex flex-col items-center">
                 {pass ? <Icon name="check" className="w-20 h-20 text-green-500 bg-green-100 dark:bg-green-900/50 rounded-full p-3"/> :
                          <Icon name="x" className="w-20 h-20 text-red-500 bg-red-100 dark:bg-red-900/50 rounded-full p-3"/>}
                <h2 className="text-3xl font-bold mt-4">{pass ? 'Topic Completed!' : 'Needs Review'}</h2>
                <p className="text-lg mt-2">You scored {score} out of {questions.length}.</p>
                <p className="text-gray-500 dark:text-gray-400 mt-1">{pass ? 'Great job! You can now proceed to the next topic.' : 'Review the material and try the quiz again to proceed.'}</p>
                <button
                    onClick={pass ? onComplete : onClose}
                    className={`mt-6 px-8 py-3 font-semibold text-white rounded-lg ${pass ? 'bg-blue-600 hover:bg-blue-700' : 'bg-orange-500 hover:bg-orange-600'}`}
                >
                    {pass ? 'Continue Learning' : 'Review Topic'}
                </button>
            </div>
        )
    }

    return (
      <div className="p-6 md:p-8">
        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Question {currentQuestionIndex + 1} of {questions.length}</p>
        <h2 className="text-2xl font-bold mt-2 text-gray-800 dark:text-white">{currentQuestion.question}</h2>
        <div className="mt-6 space-y-4">
          {currentQuestion.options.map(option => {
            const isCorrect = option === currentQuestion.correctAnswer;
            const isSelected = option === selectedAnswer;
            let buttonClass = 'bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600';
            if (isAnswered && isCorrect) buttonClass = 'bg-green-100 dark:bg-green-900/50 border-green-500 text-green-800 dark:text-green-300';
            if (isAnswered && isSelected && !isCorrect) buttonClass = 'bg-red-100 dark:bg-red-900/50 border-red-500 text-red-800 dark:text-red-300';
            if (!isAnswered && isSelected) buttonClass = 'bg-blue-100 dark:bg-blue-900/50 border-blue-500';

            return (
              <button
                key={option}
                onClick={() => handleAnswerSelect(option)}
                disabled={isAnswered}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${buttonClass} ${isAnswered ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {option}
              </button>
            );
          })}
        </div>
        {isAnswered && (
            <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-900 rounded-lg">
                <p className="font-semibold">Explanation:</p>
                <p className="text-gray-600 dark:text-gray-300">{currentQuestion.explanation}</p>
            </div>
        )}
        <div className="mt-8 flex justify-end">
            {isAnswered ? (
                 <button onClick={handleNext} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">
                    Next
                 </button>
            ): (
                 <button onClick={handleSubmitAnswer} disabled={!selectedAnswer} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400">
                    Submit
                 </button>
            )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
            <h3 className="text-xl font-bold">Quiz: {topic.title}</h3>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                <Icon name="x" className="w-5 h-5"/>
            </button>
        </div>
        <div className="flex-grow overflow-y-auto">
            {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default QuizModal;