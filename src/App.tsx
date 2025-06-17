import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider, useApp } from './contexts/AppContext';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import Dashboard from './components/Dashboard/Dashboard';
import VideoMode from './components/VideoMode/VideoMode';
import ProfileSetup from './components/UserProfile/ProfileSetup';

function AppContent() {
  const { state } = useApp();

  if (!state.currentUser) {
    return <ProfileSetup />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/video" element={<VideoMode />} />
            <Route path="/pdf" element={<div className="p-6"><h1>PDF Mode - Coming Soon</h1></div>} />
            <Route path="/web" element={<div className="p-6"><h1>Web Mode - Coming Soon</h1></div>} />
            <Route path="/analytics" element={<div className="p-6"><h1>Analytics - Coming Soon</h1></div>} />
            <Route path="/history" element={<div className="p-6"><h1>History - Coming Soon</h1></div>} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <Router>
        <AppContent />
      </Router>
    </AppProvider>
  );
}

export default App;