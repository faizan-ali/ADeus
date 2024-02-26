'use client'

import type {UserData} from '@/app/page'
import Chat from '@/components/Chat'
import {Step1} from '@/components/onboarding/step1'
import Welcome from '@/components/onboarding/welcome'
import {useOverlay} from '@/providers/OverlayProvider'
import {SupabaseClient, User} from '@supabase/supabase-js'
import {UseQueryResult, useMutation, useQuery} from '@tanstack/react-query'
import {AnimatePresence} from 'framer-motion'
import {ArrowLeftIcon} from 'lucide-react'
import {useRouter, useSearchParams} from 'next/navigation'
import {useSupabase} from "@/utils/useSupabaseConfig";

export type Step = 1 | 2

export default function Onboarding() {
    const {setLoading, toast} = useOverlay()
    const router = useRouter()
    const query = useSearchParams()
    const step = query?.get('step')
    const {supabaseClient, user} = useSupabase()

    const getUserData = useQuery({
        queryKey: ['userdata', user?.id],
        queryFn: async () => {
            if (!user || !supabaseClient) return null

            setLoading(true)
            const {data, error} = await supabaseClient.from('user_data').select('*').eq('user_id', user.id)

            if (error) {
                setLoading(false)
                return toast.error('An error occurred. Please try again soon.')
            }

            console.log('User data returned', data)
            setLoading(false)
            return data
        }
    })

    const updateUserData = useMutation({
        mutationFn: async (data: UserData) => {
            const {error: insertError} = await supabaseClient!.from('user_data').insert([{user_id: user!.id, data}])
            if (insertError) throw insertError

            const {
                data: response,
                error
            } = await supabaseClient!.from('user_data').update({data}).eq('user_id', user!.id)

            console.log('Response from mutation', response)

            if (error) throw error
        },
        onError: error => {
            toast.error(error.message || 'An error occurred. Blame Nikita.')
            setLoading(false)
        },
        onSuccess: () => {
            void getUserData.refetch()
        }
    })

    const onNext = async () => {
        setLoading(true)
        updateUserData.mutate({hasOnboarded: true})
        setLoading(false)
        router.back()
    }

    return (
        <div>
            <div className='flex h-screen flex-col items-center justify-center max-w-3xl mx-auto overflow-x-hidden'>
                <div
                    className='absolute inset-x-0 top-10 -z-10 flex transform-gpu justify-center overflow-hidden blur-3xl'
                    aria-hidden='true'>
                    <div
                        className='aspect-[1108/632] w-[69.25rem] flex-none bg-gradient-to-r from-[#80caff] to-[#4f46e5] opacity-20'
                        style={{
                            clipPath:
                                'polygon(73.6% 51.7%, 91.7% 11.8%, 100% 46.4%, 97.4% 82.2%, 92.5% 84.9%, 75.7% 64%, 55.3% 47.5%, 46.5% 49.4%, 45% 62.9%, 50.3% 87.2%, 21.3% 64.1%, 0.1% 100%, 5.4% 51.1%, 21.4% 63.9%, 58.9% 0.2%, 73.6% 51.7%)'
                        }}
                    />
                </div>
                <AnimatePresence mode='wait'>
                    {step ? (
                        <button
                            className='group absolute left-2 sm:left-10 top-10 z-40 rounded-full p-2 transition-all hover:bg-gray-400'
                            onClick={onNext}>
                            <ArrowLeftIcon
                                className='h-8 w-8 text-gray-500 group-hover:text-gray-800 group-active:scale-90'/>
                        </button>
                    ) : (
                        <Welcome/>
                    )}

                    {step === 'step1' && <Step1/>}
                </AnimatePresence>
            </div>
        </div>
    )
}
