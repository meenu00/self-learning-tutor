
import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className = '', text }) => {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-4',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div
        className={`animate-spin rounded-full border-solid border-blue-500 border-t-transparent ${sizeClasses[size]} ${className}`}
      ></div>
      {text && <p className="text-sm text-gray-500 dark:text-gray-400 animate-pulse">{text}</p>}
    </div>
  );
};

export default Spinner;