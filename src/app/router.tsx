import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from './layout/AppLayout'
import { WorkflowListPage } from '../features/editor/WorkflowListPage'
import { EditorPage } from '../features/editor/EditorPage'
import { SimulatorPlaceholderPage } from '../pages/SimulatorPlaceholderPage'
import { HistoryPlaceholderPage } from '../pages/HistoryPlaceholderPage'

export const appRouter = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <WorkflowListPage /> },
      { path: 'editor/:id', element: <EditorPage /> },
      { path: 'runs/:workflowId', element: <SimulatorPlaceholderPage /> },
      { path: 'history', element: <HistoryPlaceholderPage /> }
    ]
  }
])
