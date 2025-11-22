// app/hr/page.tsx
'use client'
import { useState } from 'react'
import HRDashboard from '../components/HRDashboard'

export default function HRPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      const res = await fetch('/api/auth/hr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      })

      if (res.ok) {
        setIsAuthenticated(true)
      } else {
        setError('Invalid password')
      }
    } catch (error) {
      setError('Authentication failed')
    }
  }

  if (!isAuthenticated) {
    return (
      <section className="pt-28 md:pt-32">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm border p-6">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">HR Dashboard Access</h1>
              <p className="text-gray-600">Enter your HR credentials to continue</p>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  HR Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter HR password"
                  required
                />
              </div>
              
              {error && (
                <div className="text-red-600 text-sm text-center">{error}</div>
              )}
              
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Access Dashboard
              </button>
            </form>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="pt-28 md:pt-32">
      <div className="max-w-7xl">
        <div className="mb-8">
          <h1 className="hero-title mb-4">HR Burnout Dashboard</h1>
          <p className="text-lg text-slate-300 max-w-3xl leading-relaxed">
            Monitor employee burnout risk across your organization with real-time insights, 
            department analytics, and blockchain-verified audit trails.
          </p>
        </div>
        <HRDashboard />
      </div>
    </section>
  )
}