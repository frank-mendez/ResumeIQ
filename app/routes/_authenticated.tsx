import { createFileRoute } from '@tanstack:react-router'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async () => {
    // Authentication check would go here
    return { user: null }
  },
})
