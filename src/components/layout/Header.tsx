import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, User, Settings, LogOut } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import LearningPreferencesSettings from '../UserProfile/LearningPreferencesSettings';

export default function Header() {
  const { state } = useApp();
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const handleSettingsClick = () => {
    setShowSettingsModal(true);
  };

  const handleCloseSettings = () => {
    setShowSettingsModal(false);
  };

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-2 rounded-lg">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Personal Teaching Assistant</h1>
                <p className="text-xs text-gray-500">Intelligent Learning Platform</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {state.currentUser && (
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{state.currentUser.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{state.currentUser.level} Level</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" onClick={handleSettingsClick}>
                      <Settings className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <LogOut className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
              {!state.currentUser && (
                <Button variant="outline" size="sm">
                  <User className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.header>

      <Modal
        isOpen={showSettingsModal}
        onClose={handleCloseSettings}
        title="Learning Preferences"
        size="lg"
      >
        <LearningPreferencesSettings onSave={handleCloseSettings} />
      </Modal>
    </>
  );
}