"use client"

import { useAuth } from '@/contexts/AuthContext'

export default function DebugPage() {
  const { user, loading } = useAuth()

  return (
    <div className="min-h-screen p-8" style={{backgroundColor: 'var(--background)'}}>
      <h1 className="text-2xl font-bold mb-4" style={{color: 'var(--foreground)'}}>Debug Auth State</h1>
      
      <div className="space-y-4">
        <div>
          <strong>Loading:</strong> {loading ? 'true' : 'false'}
        </div>
        
        <div>
          <strong>User:</strong> {user ? JSON.stringify(user, null, 2) : 'null'}
        </div>
        
        <div>
          <strong>Timestamp:</strong> {new Date().toISOString()}
        </div>
      </div>
      
      <div className="mt-8">
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Refresh Page
        </button>
      </div>
    </div>
  )
}