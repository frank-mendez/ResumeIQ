import { Link } from '@tanstack/react-router'

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-sm min-h-screen">
          <nav className="mt-8 px-4">
            <Link
              to="/dashboard"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
              activeProps={{ className: 'bg-blue-50 text-blue-600' }}
            >
              Overview
            </Link>
            <Link
              to="/dashboard/resumes"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md mt-2"
              activeProps={{ className: 'bg-blue-50 text-blue-600' }}
            >
              My Resumes
            </Link>
            <Link
              to="/dashboard/upload"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md mt-2"
              activeProps={{ className: 'bg-blue-50 text-blue-600' }}
            >
              Upload Resume
            </Link>
            <Link
              to="/dashboard/subscription"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md mt-2"
              activeProps={{ className: 'bg-blue-50 text-blue-600' }}
            >
              Subscription
            </Link>
            <Link
              to="/dashboard/settings"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md mt-2"
              activeProps={{ className: 'bg-blue-50 text-blue-600' }}
            >
              Settings
            </Link>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  )
}
