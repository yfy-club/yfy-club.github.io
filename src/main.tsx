import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import App from './App.tsx'
import './styles/global.css'

const root = document.getElementById('root')!

const tree = (
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
)

/*
 * 预渲染产物里 #root 已经有内容（见 scripts/prerender.ts），接管它而不是重画一遍；
 * dev server 下 #root 是空的，正常挂载。
 */
if (root.firstElementChild) hydrateRoot(root, tree)
else createRoot(root).render(tree)
