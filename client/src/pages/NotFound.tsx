import { useNavigate } from 'react-router-dom'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-amber-50 flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="mx-auto w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mb-6">
          <ExclamationTriangleIcon className="w-10 h-10 text-teal-600" />
        </div>

        {/* 404 Text */}
        <h1 className="text-6xl font-bold text-gray-900 mb-2">404</h1>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Page Not Found
        </h2>

        {/* Description */}
        <p className="text-gray-600 mb-8">
          Sorry, the page you are looking for does not exist or has been moved.
        </p>

        {/* Back to Home Button */}
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 px-6 py-3 text-white font-medium rounded-lg transition-colors hover:opacity-90 focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
          style={{ backgroundColor: '#14B8A6' }}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          Go Home
        </button>
      </div>
    </div>
  )
}
