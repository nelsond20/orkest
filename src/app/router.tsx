import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from './layout/AppLayout'
import { WorkflowListPage } from '../pages/WorkflowListPage'
import { EditorPlaceholderPage } from '../pages/EditorPlaceholderPage'
import { SimulatorPlaceholderPage } from '../pages/SimulatorPlaceholderPage'
import { HistoryPlaceholderPage } from '../pages/HistoryPlaceholderPage'

export const appRouter = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <WorkflowListPage /> },
      { path: 'editor/:id', element: <EditorPlaceholderPage /> },
      { path: 'runs/:workflowId', element: <SimulatorPlaceholderPage /> },
      { path: 'history', element: <HistoryPlaceholderPage /> }
    ]
  }
])
