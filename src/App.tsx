import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navigation } from './components/layout/Navigation';
import { HomePage } from './pages/HomePage';
import { PlanInputPage } from './pages/PlanInputPage';
import { SwipePage } from './pages/SwipePage';
import { GeneratingPage } from './pages/GeneratingPage';
import { PlanResultPage } from './pages/PlanResultPage';
import { PlanEditPage } from './pages/PlanEditPage';
import { MemoryMapPage } from './pages/MemoryMapPage';
import { GalleryPage } from './pages/GalleryPage';
import { MemoryDetailPage } from './pages/MemoryDetailPage';
import { MemoryRecordPage } from './pages/MemoryRecordPage';
import { BadgesPage } from './pages/BadgesPage';

function AppContent() {
  return (
    <div className="max-w-md mx-auto w-full min-h-screen relative bg-white">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/plan/new" element={<PlanInputPage />} />
        <Route path="/plan/swipe" element={<SwipePage />} />
        <Route path="/plan/generating" element={<GeneratingPage />} />
        <Route path="/plan/result" element={<PlanResultPage />} />
        <Route path="/plan/edit" element={<PlanEditPage />} />
        <Route path="/memories" element={<MemoryMapPage />} />
        <Route path="/memories/:id" element={<MemoryDetailPage />} />
        <Route path="/plan/record" element={<MemoryRecordPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/badges" element={<BadgesPage />} />
      </Routes>
      <Navigation />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
