import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { ConfigProvider } from 'antd'

// Fonts (replaces next/font/google Poppins + Inter)
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import '@fontsource/poppins/400.css'
import '@fontsource/poppins/500.css'
import '@fontsource/poppins/600.css'
import '@fontsource/poppins/700.css'

import './index.css'
import App from './App.jsx'
import { store } from './store/index.js'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#DB4444',
            colorInfo: '#DB4444',
            colorText: '#000000',
            colorBorder: '#e5e5e5',
            colorBgContainer: '#ffffff',
            colorFillAlter: '#F5F5F5',
            borderRadius: 4,
            fontFamily: 'Inter, system-ui, sans-serif',
            controlHeight: 36,
            controlHeightLG: 48,
            controlOutline: 'rgba(219, 68, 68, 0.2)',
          },
          components: {
            Button: { primaryShadow: 'none', defaultShadow: 'none', borderRadius: 4 },
            Input: { activeShadow: 'none', hoverBorderColor: '#999999' },
            Checkbox: { colorPrimary: '#000000', colorPrimaryHover: '#222222' },
            Radio: { colorPrimary: '#000000', colorPrimaryHover: '#222222' },
          },
        }}
      >
        <BrowserRouter>
          <App />
          <Toaster position="top-right" />
        </BrowserRouter>
      </ConfigProvider>
    </Provider>
  </StrictMode>,
)
