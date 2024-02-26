'use client'

import Chat from '@/components/Chat'
import LoginForm from '@/components/LoginForm'
import Onboarding from '@/components/Onboarding'
import { useOverlay } from '@/providers/OverlayProvider'
import { useSupabase } from '@/utils/useSupabaseConfig'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

export interface UserData {
    hasOnboarded?: boolean
}

export default function Index() {
    const [userData, setUserData] = useState<UserData | undefined>()
    const { setLoading, toast } = useOverlay()
    const { user, supabaseClient } = useSupabase()

    const getUserData = useQuery({
        queryKey: ['userdata', user?.id],
        queryFn: async () => {
            if (!user || !supabaseClient) return

            setLoading(true)
            const { data, error } = await supabaseClient.from('user_data').select('*').eq('user_id', user.id)

            if (error) {
                setLoading(false)
                return toast.error('An error occurred. Please try again soon.')
            }

            console.log('User data returned', data)
            setLoading(false)
            return data
        }
    })

    useEffect(() => {
        if (getUserData.data) {
            setUserData(getUserData.data?.[0]?.data as UserData)
        }
    }, [getUserData.data])

    if (!user || !supabaseClient) {
        return <LoginForm />
    }

    if (!userData?.hasOnboarded) {
        // @ts-expect-error Sigh
        return <Onboarding supabaseClient={supabaseClient} user={user} userData={userData} getUserData={getUserData} />
    }

    // @ts-expect-error Sigh
    return <Chat supabaseClient={supabaseClient} />
}
