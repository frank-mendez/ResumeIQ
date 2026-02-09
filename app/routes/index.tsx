import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/' as any)({
  component: Home,
})

function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">
              Transform Your Resume with AI
            </h1>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Get instant feedback on your resume's ATS compatibility, identify
              gaps, and receive actionable suggestions to land your dream job.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                to="/signup"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100"
              >
                Get Started Free
              </Link>
              <Link
                to="/pricing"
                className="bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-800 border border-white"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose ResumeIQ?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-blue-600 text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold mb-2">ATS Optimization</h3>
              <p className="text-gray-600">
                Ensure your resume passes Applicant Tracking Systems with our
                advanced ATS scoring algorithm.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-blue-600 text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold mb-2">AI-Powered Analysis</h3>
              <p className="text-gray-600">
                Get detailed feedback powered by cutting-edge AI to improve
                your resume's effectiveness.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-blue-600 text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold mb-2">Instant Results</h3>
              <p className="text-gray-600">
                Upload your resume and get comprehensive analysis in seconds,
                not hours.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Optimize Your Resume?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of job seekers who have improved their resumes with
            ResumeIQ.
          </p>
          <Link
            to="/signup"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700"
          >
            Start Your Free Trial
          </Link>
        </div>
      </section>
    </div>
  )
}
