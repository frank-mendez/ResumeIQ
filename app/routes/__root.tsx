import { Outlet } from '@tanstack/react-router'
import { createRootRoute } from '@tanstack/react-router'
import { Header } from '~/components/Header'
import { getCurrentUser } from '~/utils/auth.server'
import '~/styles/globals.css'

export const Route = createRootRoute({
  beforeLoad: async () => {
    const user = await getCurrentUser().catch(() => null)
    return { user }
  },
  component: RootComponent,
})

function RootComponent() {
  const { user } = Route.useRouteContext()

  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>ResumeIQ - AI Resume Analyzer</title>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <Header user={user} />
        <Outlet />
      </body>
    </html>
  )
}
