import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './core/Auth/AuthContext.jsx'

import LoginSignupPage from './core/Auth/LoginSignupPage.jsx'
import LogoutPage from './core/Auth/LogoutPage.jsx'
import LobbyScreen from './core/lobby/lobby.jsx'
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/login" element={<LoginSignupPage />} />
          <Route path="/logout" element={<LogoutPage />} />
          <Route path="/lobby" element={<LobbyScreen />} />
        </Routes>
        </Router>
      </AuthProvider>
    </StrictMode>,
)