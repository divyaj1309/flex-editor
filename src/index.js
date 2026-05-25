import React from 'react';
import { createRoot } from 'react-dom/client'; // Import createRoot from react-dom/client
import TextEditor from './TextEditor';
import './index.css';

const root = document.getElementById('root');

// Use createRoot from react-dom/client
const rootElement = createRoot(root);
rootElement.render(
  <React.StrictMode>
    <TextEditor />
  </React.StrictMode>
);
export default TextEditor;