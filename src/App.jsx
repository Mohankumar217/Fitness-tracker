import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import AppShell from './components/AppShell';
import TodayPage from './pages/TodayPage';
import CalendarPage from './pages/CalendarPage';
import ProgressPage from './pages/ProgressPage';
import SettingsPage from './pages/SettingsPage';
import AddActivityModal from './components/AddActivityModal';
import OnboardingModal from './components/OnboardingModal';

function MainLayout() {
  const { isAddModalOpen, setIsAddModalOpen } = useApp();

  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<TodayPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/progress" element={<ProgressPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>

      {/* Global Modals */}
      <AddActivityModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
      <OnboardingModal />
    </AppShell>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <MainLayout />
      </BrowserRouter>
    </AppProvider>
  );
}
