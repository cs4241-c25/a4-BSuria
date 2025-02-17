import React, { useState, StrictMode } from 'react';
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Login from './Login.jsx'
import Pages from './Pages.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Pages />
  </StrictMode>,
)
