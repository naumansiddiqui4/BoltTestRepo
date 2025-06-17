import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Clock, Award } from 'lucide-react';
import { Question, AssessmentResult } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import Button from '../ui/Button';

interface QuizInterfaceProps {
  questions: Question[];
  onComplete: (result: AssessmentResult) => void;
  timeLimit?: number;
}

export default function QuizInterface({ questions, onComplete, timeLimit }: QuizInterfaceProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [timeLeft, setTimeLeft] = useState(timeLimit || 0);
  const [showResult, setShowResult] = useState(false);
  const [startTime] = useState(Date.now());

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  React.useEffect(() => {
    if (timeLimit && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, timeLimit]);

  const handleAnswer = (questionId: string, answer: string | string[]) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleNext = () => {
    if (isLastQuestion) {
      handleComplete();
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handleComplete = () => {
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    const results = questions.map(question => {
      const userAnswer = answers[question.id];
      const isCorrect = Array.isArray(question.correctAnswer)
        ? Array.isArray(userAnswer) && 
          question.correctAnswer.length === userAnswer.length &&
          question.correctAnswer.every(ans => userAnswer.includes(ans))
        : userAnswer === question.correctAnswer;

      return {
        questionId: question.id,
        userAnswer: userAnswer || '',
        correct: isCorrect,
        timeSpent: totalTime / questions.length, // Simplified
      };
    });

    const score = results.filter(r => r.correct).length;
    
    const result: AssessmentResult = {
      score,
      totalQuestions: questions.length,
      answers: results,
      completedAt: new Date(),
    };

    onComplete(result);
    setShowResult(true);
  };

  const renderQuestion = (question: Question) => {
    const userAnswer = answers[question.id];

    switch (question.type) {
      case 'multiple-choice':
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <label key={index} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={userAnswer === option}
                  onChange={(e) => handleAnswer(question.id, e.target.value)}
                  className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'multi-select':
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <label key={index} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  value={option}
                  checked={Array.isArray(userAnswer) && userAnswer.includes(option)}
                  onChange={(e) => {
                    const currentAnswers = Array.isArray(userAnswer) ? userAnswer : [];
                    const newAnswers = e.target.checked
                      ? [...currentAnswers, option]
                      : currentAnswers.filter(ans => ans !== option);
                    handleAnswer(question.id, newAnswers);
                  }}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'true-false':
        return (
          <div className="space-y-3">
            {['True', 'False'].map((option) => (
              <label key={option} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={userAnswer === option}
                  onChange={(e) => handleAnswer(question.id, e.target.value)}
                  className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'fill-blank':
        return (
          <input
            type="text"
            value={typeof userAnswer === 'string' ? userAnswer : ''}
            onChange={(e) => handleAnswer(question.id, e.target.value)}
            placeholder="Enter your answer..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        );

      default:
        return null;
    }
  };

  if (showResult) {
    const score = questions.filter(q => {
      const userAnswer = answers[q.id];
      return Array.isArray(q.correctAnswer)
        ? Array.isArray(userAnswer) && 
          q.correctAnswer.length === userAnswer.length &&
          q.correctAnswer.every(ans => userAnswer.includes(ans))
        : userAnswer === q.correctAnswer;
    }).length;

    const percentage = Math.round((score / questions.length) * 100);

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-6"
      >
        <Card variant="glass">
          <CardContent className="text-center py-8">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <Award className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Quiz Complete!</h2>
            <p className="text-3xl font-bold text-green-600 mb-2">{percentage}%</p>
            <p className="text-gray-600">You scored {score} out of {questions.length} questions correctly</p>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardHeader>
            <CardTitle>Question Review</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {questions.map((question, index) => {
              const userAnswer = answers[question.id];
              const isCorrect = Array.isArray(question.correctAnswer)
                ? Array.isArray(userAnswer) && 
                  question.correctAnswer.length === userAnswer.length &&
                  question.correctAnswer.every(ans => userAnswer.includes(ans))
                : userAnswer === question.correctAnswer;

              return (
                <div key={question.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                  <div className="flex items-start space-x-3 mb-2">
                    {isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 mb-1">
                        Question {index + 1}: {question.question}
                      </p>
                      <p className="text-sm text-gray-600 mb-1">
                        Your answer: {Array.isArray(userAnswer) ? userAnswer.join(', ') : userAnswer || 'Not answered'}
                      </p>
                      <p className="text-sm text-green-600">
                        Correct answer: {Array.isArray(question.correctAnswer) ? question.correctAnswer.join(', ') : question.correctAnswer}
                      </p>
                      {!isCorrect && (
                        <p className="text-sm text-gray-500 mt-2 italic">
                          {question.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
          <div className="w-32 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>
        {timeLimit && timeLeft > 0 && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{currentQuestion.question}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  currentQuestion.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                  currentQuestion.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {currentQuestion.difficulty}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {renderQuestion(currentQuestion)}
              
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  disabled={currentQuestionIndex === 0}
                  onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                >
                  Previous
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={!answers[currentQuestion.id]}
                >
                  {isLastQuestion ? 'Complete Quiz' : 'Next Question'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}