import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import 'regenerator-runtime/runtime'
import { Toaster } from 'sonner'
import Content from './components/Content'
import { AuthProvider } from './components/contexts/Auth'
import { CalendarProvider } from './components/contexts/Calendar'
import { LLMProvider } from './components/contexts/LLM'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CalendarProvider>
          <LLMProvider>
            <Content />
            <Toaster />
          </LLMProvider>
        </CalendarProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
