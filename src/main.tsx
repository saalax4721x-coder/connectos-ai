import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {NexusCommandCenter} from './nexus/NexusCommandCenter';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <NexusCommandCenter />
  </StrictMode>,
);
