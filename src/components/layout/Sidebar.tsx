import React from 'react';
import { motion } from 'framer-motion';
import { Home, Video, FileText, Globe, BarChart3, History, MessageSquare } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '../../utils/cn';

const navigation = [
  { name: 'Dashboard', icon: Home, href: '/' },
  { name: 'Video Learning', icon: Video, href: '/video' },
  { name: 'PDF Documents', icon: FileText, href: '/pdf' },
  { name: 'Web Content', icon: Globe, href: '/web' },
  { name: 'Analytics', icon: BarChart3, href: '/analytics' },
  { name: 'History', icon: History, href: '/history' },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="bg-white border-r border-gray-200 w-64 min-h-screen"
    >
      <nav className="p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <motion.button
              key={item.name}
              onClick={() => navigate(item.href)}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                'w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-all duration-200',
                isActive
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-purple-600'
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </motion.button>
          );
        })}
      </nav>

      <div className="p-4 mt-8 border-t border-gray-200">
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-3">
            <MessageSquare className="w-5 h-5 text-purple-600" />
            <span className="font-medium text-gray-900">AI Assistant</span>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Start a conversation to get personalized help with your learning.
          </p>
          <button className="w-full bg-white text-purple-600 border border-purple-200 px-3 py-2 rounded-lg text-sm font-medium hover:bg-purple-50 transition-colors">
            Open Chat
          </button>
        </div>
      </div>
    </motion.aside>
  );
}