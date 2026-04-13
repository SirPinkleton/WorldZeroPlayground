import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './auth/AuthContext'
import { AdminModeProvider } from './auth/AdminModeContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AdminModeProvider>
          <App />
        </AdminModeProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
