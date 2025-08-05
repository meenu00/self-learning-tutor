
import React from 'react';

type IconName = 'robot' | 'arrow-right' | 'chevron-down' | 'chevron-right' | 'check' | 'x' | 'book' | 'target' | 'back' | 'plus' | 'send' | 'sparkles';

interface IconProps {
  name: IconName;
  className?: string;
}

const ICONS: Record<IconName, React.ReactNode> = {
  robot: <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-2 2-2-2z" />,
  'arrow-right': <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />,
  'chevron-down': <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />,
  'chevron-right': <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />,
  check: <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />,
  x: <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />,
  book: <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />,
  target: <React.Fragment>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </React.Fragment>,
  back: <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />,
  plus: <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />,
  send: <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />,
  sparkles: <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.293 2.293a1 1 0 01-1.414 1.414L12 6.414l-2.293 2.293a1 1 0 01-1.414-1.414L10 5m0 14l2.293-2.293a1 1 0 011.414 1.414L12 17.586l2.293-2.293a1 1 0 011.414 1.414L14 19m-4-5l2.293-2.293a1 1 0 011.414 1.414L12 13.586l2.293-2.293a1 1 0 011.414 1.414L14 15" />,
};

const Icon: React.FC<IconProps> = ({ name, className = 'w-6 h-6' }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      {ICONS[name]}
    </svg>
  );
};

export default Icon;