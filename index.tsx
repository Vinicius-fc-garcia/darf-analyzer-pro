import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

try {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  console.error("Critical rendering error:", error);
  rootElement.innerHTML = `<div style="color:white; padding: 20px;">
    <h1>Erro Crítico</h1>
    <pre>${error instanceof Error ? error.message : JSON.stringify(error)}</pre>
  </div>`;
}
