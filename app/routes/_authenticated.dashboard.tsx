import { createFileRoute, Outlet } from '@tanstack/react-router'
import { DashboardLayout } from '~/components/DashboardLayout'

export const Route = createFileRoute('/_authenticated/dashboard' as any)({
  component: DashboardRoute,
})

function DashboardRoute() {
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  )
}
