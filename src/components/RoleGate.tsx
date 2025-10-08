"use client"

import { ReactNode } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface RoleGateProps {
  allowedRoles: ('PATIENT' | 'DOCTOR' | 'ADMIN')[]
  children: ReactNode
  fallback?: ReactNode
}

export default function RoleGate({ allowedRoles, children, fallback }: RoleGateProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user || !user.role || !allowedRoles.includes(user.role as any)) {
    return fallback || (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}