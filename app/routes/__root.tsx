import { Outlet } from '@tanstack/react-router'
import { createRootRoute } from '@tanstack/react-router'
import { Header } from '~/components/Header'
import '~/styles/globals.css'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  const user = null // Simplified for now

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
