import { Providers } from '@/app/providers'
import '@/styles/globals.css'
import type { Metadata } from 'next'
import React from 'react'

export const metadata: Metadata = {
  title: 'Orukal',
  description: 'Your PA in the cloud.'
}

export default function RootLayout({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='en'>
      <body>
        <Providers>
          <div className='flex flex-col lg:flex-row bg-gray-50 dark:bg-black min-h-screen'>
            <main className='grow w-full overflow-y-auto bg-white dark:bg-gray-900 ring-gray-200 dark:ring-gray-800 dark:border-none lg:m-2 rounded-xl ring-1 items-center justify-center !p-6'>
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  )
}
