import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';
import App from './App';
import './styles/index.css';

const container = document.getElementById('root');
if (container) {
  createRoot(container).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
