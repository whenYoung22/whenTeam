// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'

// import '@/index.css'   
// import App from '@/App.tsx'

// createRoot(document.getElementById('root')!).render(
//   <StrictMode>
//     <App />
//   </StrictMode>,
// )


import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { message } from 'antd'

import '@/index.css'   
import App from '@/App.tsx'

// 全局配置 message 默认停留时长
message.config({
  duration: 1.5,
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)