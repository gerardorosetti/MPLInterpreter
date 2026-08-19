import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import IdeWorkspace from '@/IdeWorkspace';
import { LandingPage } from '@/LandingPage';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/workspace" element={<IdeWorkspace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
