'use client'

import { Toaster } from '@/components/ui/sonner'
import { createContext, PropsWithChildren, useContext, useState } from 'react'
// @ts-expect-error This is fine
import { ThreeDots } from 'react-loader-spinner'
import { toast } from 'sonner'

interface Overlay {
  loading: boolean
  setLoading: (loading: boolean) => void
  toast: typeof toast
}

const defaultContext: Overlay = {
  loading: false,
  setLoading: () => {},
  toast
}

const OverlayContext = createContext<Overlay>(defaultContext)

export const OverlayProvider = ({ children }: PropsWithChildren) => {
  const [loading, setLoading] = useState(false)

  return (
    <>
      <Toaster position='top-center' />
      {loading && (
        <div className='fixed top-0 left-0 z-50 block h-full w-full bg-black opacity-75'>
          <div className='fixed inset-0 z-10 overflow-y-auto p-4 sm:p-6 md:p-20'>
            <div className='flex h-screen flex-col items-center justify-center'>
              <ThreeDots visible={true} height='120' width='120' color='#ceff00' radius='10' ariaLabel='three-dots-loading' />
              <div className='text-white sm:mb-52'>Loading...</div>
            </div>
          </div>
        </div>
      )}
      <OverlayContext.Provider value={{ loading, setLoading, toast }}>{children}</OverlayContext.Provider>
    </>
  )
}

export const useOverlay = () => useContext(OverlayContext)
