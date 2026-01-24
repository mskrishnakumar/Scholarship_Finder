import { useNavigate } from 'react-router-dom'

export default function StudentDashboard() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <h1 className="text-lg font-semibold text-gray-900">Scholarship Finder</h1>
          </div>
          <button
            onClick={() => navigate('/')}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome, Student</h2>
        <p className="text-gray-600 mb-8">Find scholarships through chat or guided search.</p>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">Chat with AI</h3>
            <p className="text-sm text-gray-500 mb-4">
              Ask questions in natural language about scholarships you may be eligible for.
            </p>
            <div className="text-sm text-gray-400 italic">Coming soon...</div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">Guided Search</h3>
            <p className="text-sm text-gray-500 mb-4">
              Answer a few questions and we'll find matching scholarships for you.
            </p>
            <div className="text-sm text-gray-400 italic">Coming soon...</div>
          </div>
        </div>
      </main>
    </div>
  )
}
