"use client"

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

export default function LoginTestPage() {
  const { user, loading, login } = useAuth()
  const [testResult, setTestResult] = useState<string>('')
  const router = useRouter()

  const testLogin = async () => {
    setTestResult('Testing login...')
    
    try {
      const result = await login('patient@clinic.local', 'patient123')
      setTestResult(`Login result: ${JSON.stringify(result, null, 2)}`)
      
      // Wait a bit and then try to navigate
      setTimeout(() => {
        setTestResult(prev => prev + '\n\nNavigating to patient dashboard...')
        router.push('/patient/dashboard')
      }, 500)
      
    } catch (error) {
      setTestResult(`Error: ${error}`)
    }
  }

  return (
    <div className="min-h-screen p-8" style={{backgroundColor: 'var(--background)'}}>
      <h1 className="text-2xl font-bold mb-4" style={{color: 'var(--foreground)'}}>Login Test</h1>
      
      <div className="space-y-4">
        <div>
          <strong>Current Loading:</strong> {loading ? 'true' : 'false'}
        </div>
        
        <div>
          <strong>Current User:</strong> {user ? JSON.stringify(user, null, 2) : 'null'}
        </div>
        
        <button 
          onClick={testLogin}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Test Login as Patient
        </button>
        
        {testResult && (
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <pre style={{color: '#000'}}>{testResult}</pre>
          </div>
        )}
      </div>
    </div>
  )
}