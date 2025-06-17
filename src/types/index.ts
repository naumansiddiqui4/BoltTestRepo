export interface UserProfile {
  id: string;
  name: string;
  level: 'naive' | 'intermediate' | 'expert';
  learningStyle: LearningStyle[];
  preferences: {
    autoTest: boolean;
    testFrequency: 'low' | 'medium' | 'high';
    explanationDepth: 'brief' | 'detailed' | 'comprehensive';
  };
}

export interface LearningStyle {
  type: 'relevant-resources' | 'text' | 'visual' | 'real-world' | 'practical';
  preference: number; // 1-5 scale
}

export interface Session {
  id: string;
  mode: 'video' | 'pdf' | 'web';
  content: {
    title: string;
    url?: string;
    file?: File;
    transcript?: string;
    summary?: string;
  };
  progress: {
    currentTime?: number;
    currentPage?: number;
    completed: boolean;
    chatHistory: ChatMessage[];
  };
  startedAt: Date;
  lastActivity: Date;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  context?: {
    timePosition?: number;
    pagePosition?: number;
    relatedContent?: string;
  };
}

export interface Assessment {
  id: string;
  sessionId: string;
  questions: Question[];
  results?: AssessmentResult;
  createdAt: Date;
}

export interface Question {
  id: string;
  type: 'multiple-choice' | 'multi-select' | 'true-false' | 'fill-blank';
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface AssessmentResult {
  score: number;
  totalQuestions: number;
  answers: {
    questionId: string;
    userAnswer: string | string[];
    correct: boolean;
    timeSpent: number;
  }[];
  completedAt: Date;
}