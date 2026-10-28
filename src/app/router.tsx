import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from './layout/AppLayout'
import { WorkflowListPage } from '../features/editor/WorkflowListPage'
import { EditorPage } from '../features/editor/EditorPage'
import { SimulatorPage } from '../features/simulator/SimulatorPage'
import { HistoryPage } from '../features/history/HistoryPage'

export const appRouter = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <WorkflowListPage /> },
      { path: 'editor/:id', element: <EditorPage /> },
      { path: 'runs/:workflowId', element: <SimulatorPage /> },
      { path: 'history', element: <HistoryPage /> }
    ]
  }
])
