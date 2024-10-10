import { hydrateRoot } from 'react-dom/client';
import App from './App'; // Your main React component

// Find the root element that the server rendered
const container = document.getElementById('root');

// Hydrate the app
hydrateRoot(container, <App />);
