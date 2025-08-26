
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { locales } from './locales'; // Import locales

// This is a workaround to inject locales into App.tsx without creating a new file
// In a real project, locales.ts would be its own file.
(App as any).locales = locales;


const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
