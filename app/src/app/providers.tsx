'use client'

import { OverlayProvider } from '@/providers/OverlayProvider'
import { ThemeProvider } from '@/providers/ThemeProvider'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <OverlayProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute='class' defaultTheme='light' enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </QueryClientProvider>
    </OverlayProvider>
  )
}
