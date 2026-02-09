import { createFileRoute, redirect } from '@tanstack/react-router'
import { getCurrentUser } from '~/utils/auth.server'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ context }) => {
    const user = await getCurrentUser()
    if (!user) {
      throw redirect({
        to: '/login',
      })
    }
    return { user }
  },
})
