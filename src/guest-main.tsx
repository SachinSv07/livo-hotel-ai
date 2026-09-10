import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { GuestConcierge } from './components/guest/GuestConcierge';
import './index.css';

const roomToken = window.location.pathname.match(/^\/guest\/([^/]+)\/?$/i)?.[1] ?? null;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GuestConcierge roomToken={roomToken ? decodeURIComponent(roomToken) : null} />
  </StrictMode>,
);