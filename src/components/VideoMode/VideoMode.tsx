import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, MessageSquare, FileText, Zap, AlertCircle } from 'lucide-react';
import ReactPlayer from 'react-player/youtube';
import { useApp } from '../../contexts/AppContext';
import { Session, ChatMessage } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import ChatInterface from '../Chat/ChatInterface';

// Helper function to extract video ID from various YouTube URL formats
const extractVideoId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
};

// Helper function to create a clean YouTube URL
const createYouTubeUrl = (videoId: string): string => {
  return `https://www.youtube.com/watch?v=${videoId}`;
};

// Helper function to validate YouTube URL
const isValidYouTubeUrl = (url: string): boolean => {
  return extractVideoId(url) !== null;
};

export default function VideoMode() {
  const { state, dispatch } = useApp();
  const [videoUrl, setVideoUrl] = useState('');
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [showTranscript, setShowTranscript] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [playerError, setPlayerError] = useState<string | null>(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);

  const handleStartSession = () => {
    if (!videoUrl || !state.currentUser) return;

    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
      setPlayerError('Invalid YouTube URL. Please enter a valid YouTube video URL.');
      return;
    }

    // Create a clean YouTube URL
    const cleanUrl = createYouTubeUrl(videoId);
    
    const session: Session = {
      id: `session-${Date.now()}`,
      mode: 'video',
      content: {
        title: `YouTube Video - ${videoId}`,
        url: cleanUrl,
        transcript: mockTranscript,
        summary: mockSummary,
      },
      progress: {
        currentTime: 0,
        completed: false,
        chatHistory: [],
      },
      startedAt: new Date(),
      lastActivity: new Date(),
    };

    setCurrentSession(session);
    setPlayerError(null);
    dispatch({ type: 'START_SESSION', payload: session });
  };

  const handleProgress = (progress: { playedSeconds: number }) => {
    setCurrentTime(progress.playedSeconds);
    if (currentSession) {
      const updatedSession = {
        ...currentSession,
        progress: {
          ...currentSession.progress,
          currentTime: progress.playedSeconds,
        },
        lastActivity: new Date(),
      };
      setCurrentSession(updatedSession);
      dispatch({ type: 'UPDATE_SESSION', payload: updatedSession });
    }
  };

  const handlePlayerReady = () => {
    setIsPlayerReady(true);
    setPlayerError(null);
  };

  const handlePlayerError = (error: any) => {
    console.error('Player error:', error);
    setPlayerError('Failed to load video. Please check the URL and try again.');
    setIsPlayerReady(false);
  };

  const handleChatToggle = () => {
    if (isPlaying) {
      setIsPlaying(false);
    }
    setShowChat(!showChat);
  };

  const handleSendMessage = (message: string) => {
    if (!currentSession) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: new Date(),
      context: {
        timePosition: currentTime,
        relatedContent: getContextualContent(currentTime),
      },
    };

    dispatch({ 
      type: 'ADD_CHAT_MESSAGE', 
      payload: { sessionId: currentSession.id, message: userMessage } 
    });

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: generatePersonalizedResponse(message, currentTime, state.currentUser!),
        timestamp: new Date(),
        context: {
          timePosition: currentTime,
        },
      };

      dispatch({ 
        type: 'ADD_CHAT_MESSAGE', 
        payload: { sessionId: currentSession.id, message: aiResponse } 
      });
    }, 1000);
  };

  if (!currentSession) {
    return (
      <div className="p-6">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="max-w-2xl mx-auto space-y-6"
        >
          <div className="text-center space-y-4">
            <div className="bg-gradient-to-br from-red-500 to-pink-600 p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
              <Play className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Video Learning Mode</h1>
            <p className="text-gray-600">
              Learn from YouTube videos with AI-powered assistance, interactive transcripts, and contextual Q&A.
            </p>
          </div>

          <Card variant="glass">
            <CardHeader>
              <CardTitle>Start a New Video Session</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="YouTube Video URL"
                placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                value={videoUrl}
                onChange={(e) => {
                  setVideoUrl(e.target.value);
                  setPlayerError(null);
                }}
                error={playerError}
                helper="Paste any YouTube video URL to begin learning"
              />
              
              {playerError && (
                <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <p className="text-sm text-red-700">{playerError}</p>
                </div>
              )}

              <Button 
                onClick={handleStartSession}
                disabled={!videoUrl || !isValidYouTubeUrl(videoUrl)}
                className="w-full"
              >
                Start Learning Session
              </Button>

              {videoUrl && !isValidYouTubeUrl(videoUrl) && (
                <p className="text-sm text-amber-600 text-center">
                  Please enter a valid YouTube URL
                </p>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card variant="glass">
              <CardContent className="text-center p-4">
                <MessageSquare className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <h3 className="font-medium text-gray-900 mb-1">Interactive Chat</h3>
                <p className="text-sm text-gray-600">Ask questions about the current content</p>
              </CardContent>
            </Card>
            <Card variant="glass">
              <CardContent className="text-center p-4">
                <FileText className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-medium text-gray-900 mb-1">Live Transcript</h3>
                <p className="text-sm text-gray-600">Follow along with synchronized text</p>
              </CardContent>
            </Card>
            <Card variant="glass">
              <CardContent className="text-center p-4">
                <Zap className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-medium text-gray-900 mb-1">Smart Summaries</h3>
                <p className="text-sm text-gray-600">Get key insights and takeaways</p>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">{currentSession.content.title}</h1>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTranscript(!showTranscript)}
            >
              <FileText className="w-4 h-4 mr-2" />
              Transcript
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSummary(!showSummary)}
            >
              <Zap className="w-4 h-4 mr-2" />
              Summary
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleChatToggle}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              {showChat ? 'Hide Chat' : 'Open Chat'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card variant="glass">
              <CardContent className="p-0">
                <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
                  {playerError ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white">
                      <div className="text-center space-y-4">
                        <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
                        <div>
                          <p className="text-lg font-medium">Video Load Error</p>
                          <p className="text-sm text-gray-300 mt-2">{playerError}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setCurrentSession(null);
                            setPlayerError(null);
                          }}
                          className="bg-white text-gray-900 hover:bg-gray-100"
                        >
                          Try Another Video
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <ReactPlayer
                      url={currentSession.content.url}
                      width="100%"
                      height="100%"
                      playing={isPlaying}
                      onProgress={handleProgress}
                      onReady={handlePlayerReady}
                      onError={handlePlayerError}
                      controls={true}
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      config={{
                        youtube: {
                          playerVars: {
                            showinfo: 1,
                            origin: window.location.origin,
                          }
                        }
                      }}
                    />
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPlaying(!isPlaying)}
                disabled={!isPlayerReady}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setCurrentSession(null);
                  setPlayerError(null);
                  setIsPlayerReady(false);
                }}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                New Video
              </Button>
            </div>

            {showTranscript && (
              <Card variant="glass">
                <CardHeader>
                  <CardTitle>Video Transcript</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="max-h-64 overflow-y-auto text-sm text-gray-700 leading-relaxed">
                    {currentSession.content.transcript}
                  </div>
                </CardContent>
              </Card>
            )}

            {showSummary && (
              <Card variant="glass">
                <CardHeader>
                  <CardTitle>Video Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-700 leading-relaxed">
                    {currentSession.content.summary}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-4">
            <Card variant="glass">
              <CardHeader>
                <CardTitle>Session Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{Math.round((currentTime / 600) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((currentTime / 600) * 100, 100)}%` }}
                    />
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <p>Current Time: {formatTime(currentTime)}</p>
                  <p>Chat Messages: {currentSession.progress.chatHistory.length}</p>
                  <p>Status: {isPlayerReady ? 'Ready' : 'Loading...'}</p>
                </div>
              </CardContent>
            </Card>

            {showChat && (
              <ChatInterface
                messages={currentSession.progress.chatHistory}
                onSendMessage={handleSendMessage}
                isLoading={false}
              />
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Helper functions and mock data
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const getContextualContent = (timePosition: number): string => {
  // This would normally extract content from the transcript at the current time
  return `Content at ${formatTime(timePosition)}`;
};

const generatePersonalizedResponse = (message: string, timePosition: number, user: any): string => {
  // This would normally call an LLM API with personalized prompts
  const responses = [
    `Based on your ${user.level} level understanding, let me explain this concept from the video at ${formatTime(timePosition)}...`,
    `Great question! At this point in the video, the speaker is discussing... Let me break this down for you.`,
    `I notice you're asking about this topic. Given your learning preferences, here's how I'd explain it...`,
  ];
  return responses[Math.floor(Math.random() * responses.length)];
};

const mockTranscript = `
Welcome to this comprehensive introduction to machine learning. In this video, we'll explore the fundamental concepts that form the backbone of artificial intelligence and data science.

Machine learning is a subset of artificial intelligence that enables computers to learn and make decisions from data without being explicitly programmed for every scenario. Think of it as teaching a computer to recognize patterns, much like how humans learn from experience.

There are three main types of machine learning: supervised learning, unsupervised learning, and reinforcement learning. Supervised learning uses labeled data to train models, like teaching a child to recognize animals by showing them pictures with labels. Unsupervised learning finds hidden patterns in data without labels, similar to letting someone explore a new city without a map to discover interesting places.

The process typically involves collecting data, preprocessing it, choosing an appropriate algorithm, training the model, and then evaluating its performance. This iterative process helps create models that can make accurate predictions on new, unseen data.

Real-world applications include recommendation systems, image recognition, natural language processing, and autonomous vehicles. Each application requires different approaches and considerations.
`;

const mockSummary = `
This video provides a foundational overview of machine learning concepts:

Key Topics Covered:
• Definition of machine learning as a subset of AI
• Three main types: supervised, unsupervised, and reinforcement learning
• Typical ML workflow: data collection, preprocessing, algorithm selection, training, and evaluation
• Real-world applications and use cases

Main Takeaways:
• Machine learning enables computers to learn from data without explicit programming
• Different types of learning approaches serve different purposes
• The field has wide-ranging applications across industries
• Understanding the basic workflow is essential for practical implementation

This serves as an excellent starting point for anyone new to machine learning concepts.
`;