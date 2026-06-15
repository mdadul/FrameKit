import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import { DEFAULT_WORKSPACE } from '@/lib/constants'
import { applyKonvaPixelRatio } from '@/lib/canvas/perf/konva-config'
import './index.css'

applyKonvaPixelRatio(DEFAULT_WORKSPACE.highDpiCanvas)

const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
