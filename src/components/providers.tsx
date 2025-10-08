"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactNode, useState } from "react"
import { ThemeProvider } from "./theme-provider"
import { AuthProvider } from "@/contexts/AuthContext"

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        refetchOnWindowFocus: false,
      },
    },
  }))

  return (
    <ThemeProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}