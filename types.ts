
export type TopicStatus = 'locked' | 'unlocked' | 'completed';

export type TopicType = 'lesson' | 'checkpoint';

export interface Topic {
  id: string;
  title: string;
  type: TopicType;
  status: TopicStatus;
  content?: string;
  references?: string[];
}

export interface Course {
  id: string;
  subject: string;
  topics: Topic[];
  createdAt: string;
  icon?: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface Task {
  description: string;
  evaluationCriteria: string;
}

export interface TaskEvaluation {
  passed: boolean;
  feedback: string;
  score: number;
}

export interface ChatMessage {
    role: 'user' | 'model';
    content: string;
}