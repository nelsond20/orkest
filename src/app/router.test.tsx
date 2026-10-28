import { describe, expect, it } from 'vitest'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import { appRouter } from './router'

function renderAt(path: string) {
  const routes = appRouter.routes
  const router = createMemoryRouter(routes, {
    initialEntries: [path]
  })

  render(<RouterProvider router={router} />)
}

describe('app router', () => {
  it('renders workflow list route', async () => {
    renderAt('/')
    expect(await screen.findByText('New Workflow')).toBeInTheDocument()
  })
})
