import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import GameApp from './game/GameApp';
import './site.css';

function openConnectionGuide() {
  window.location.hash = '#/academy/live';
  window.scrollTo({ top: 0, behavior: 'instant' });
}
createRoot(document.getElementById('root')!).render(<StrictMode><GameApp onOpenLab={openConnectionGuide}/></StrictMode>);
