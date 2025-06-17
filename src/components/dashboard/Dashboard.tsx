import React from 'react';
import { motion } from 'framer-motion';
import { Video, FileText, Globe, Play, BookOpen, TrendingUp, Clock, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import Button from '../ui/Button';

const learningModes = [
  {
    id: 'video',
    title: 'Video Learning',
    description: 'Learn from YouTube videos with interactive transcripts and AI-powered Q&A',
    icon: Video,
    color: 'from-red-500 to-pink-600',
    features: ['Auto-pause for questions', 'Transcript following', 'Context-aware chat'],
    path: '/video',
  },
  {
    id: 'pdf',
    title: 'PDF Documents',
    description: 'Read and learn from PDF documents with intelligent assistance',
    icon: FileText,
    color: 'from-blue-500 to-cyan-600',
    features: ['Progress tracking', 'Contextual Q&A', 'Smart summaries'],
    path: '/pdf',
  },
  {
    id: 'web',
    title: 'Web Content',
    description: 'Extract knowledge from web articles and online resources',
    icon: Globe,
    color: 'from-green-500 to-emerald-600',
    features: ['Clean reading view', 'Content extraction', 'Real-time assistance'],
    path: '/web',
  },
];

const stats = [
  { label: 'Sessions Completed', value: '12', icon: Play, color: 'text-blue-600' },
  { label: 'Hours Learned', value: '47', icon: Clock, color: 'text-green-600' },
  { label: 'Topics Mastered', value: '8', icon: Target, color: 'text-purple-600' },
  { label: 'Avg. Score', value: '87%', icon: TrendingUp, color: 'text-orange-600' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { state } = useApp();

  return (
    <div className="p-6 space-y-8">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="space-y-2"
      >
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back{state.currentUser ? `, ${state.currentUser.name}` : ''}!
        </h1>
        <p className="text-gray-600">
          Ready to continue your learning journey? Choose a mode below to get started.
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat, index) => (
          <Card key={stat.label} variant="glass" hover>
            <CardContent className="flex items-center space-x-4">
              <div className={`p-3 rounded-lg bg-gray-50 ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Learning Modes */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-6"
      >
        <h2 className="text-2xl font-bold text-gray-900">Choose Your Learning Mode</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {learningModes.map((mode, index) => (
            <motion.div
              key={mode.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <Card variant="glass" hover className="h-full">
                <CardHeader>
                  <div className={`bg-gradient-to-r ${mode.color} p-3 rounded-lg w-fit`}>
                    <mode.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="mt-4">{mode.title}</CardTitle>
                  <CardDescription>{mode.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {mode.features.map((feature) => (
                      <li key={feature} className="flex items-center space-x-2 text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full" 
                    onClick={() => navigate(mode.path)}
                  >
                    Start Learning
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recent Sessions */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Recent Sessions</h2>
          <Button variant="outline" size="sm" onClick={() => navigate('/history')}>
            View All
          </Button>
        </div>
        
        {state.sessions.length === 0 ? (
          <Card variant="glass">
            <CardContent className="text-center py-12">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No sessions yet</h3>
              <p className="text-gray-600 mb-6">Start your first learning session to see your progress here.</p>
              <Button onClick={() => navigate('/video')}>
                Start Learning
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {state.sessions.slice(0, 3).map((session) => (
              <Card key={session.id} variant="glass" hover>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    {session.mode === 'video' && <Video className="w-4 h-4 text-red-500" />}
                    {session.mode === 'pdf' && <FileText className="w-4 h-4 text-blue-500" />}
                    {session.mode === 'web' && <Globe className="w-4 h-4 text-green-500" />}
                    <span className="truncate">{session.content.title}</span>
                  </CardTitle>
                  <CardDescription>
                    {new Date(session.lastActivity).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      session.progress.completed 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {session.progress.completed ? 'Completed' : 'In Progress'}
                    </span>
                    <Button variant="ghost" size="sm">
                      Resume
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}