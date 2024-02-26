'use client'

import {STAGGER_CHILD_VARIANTS} from '@/components/onboarding/welcome'
import {Brain} from '@/icons/brain'
import {useOverlay} from '@/providers/OverlayProvider'
import {useSupabase} from '@/utils/useSupabaseConfig'
import {CarbonConnect, IntegrationName} from 'carbon-connect'
import {ActionType, OnSuccessData} from 'carbon-connect/src'
import {motion} from 'framer-motion'
import {useRouter} from 'next/navigation'
import {useEffect, useState} from 'react'

export function Step1() {
    const {user} = useSupabase()
    const router = useRouter()
    const [showCarbon, setShowCarbon] = useState(false)
    const [completedImport, setCompletedImport] = useState(false)
    const {toast} = useOverlay()

    useEffect(() => {
        if (router && completedImport) {
            router.push('/chat')
        }
    }, [completedImport, router])

    const tokenFetcher = async () => {
        if (!user) return toast.error('An error occurred. Blame Nikita.')
        console.log(user.id)
        return await fetch(`/api/token?id=${user.id}`).then(_ => _.json())
    }

    const onToggleCarbon = (open: boolean) => {
        console.log('Toggling carbon', open)
        setShowCarbon(open)
        setCompletedImport(true)
    }

    const onSuccess = (data: OnSuccessData) => {
        if (data.action === ActionType.ADD) {
            console.log('User added file', data.data?.files, data.data?.sync_status)
        }
        console.log(data)
    }

    return (
        <motion.div
            className='z-10 mx-5 flex flex-col items-center space-y-10 text-center sm:mx-auto'
            variants={STAGGER_CHILD_VARIANTS}
            initial='hidden'
            animate='show'
            exit='hidden'
            transition={{duration: 0.3, type: 'spring'}}
        >
            <motion.div variants={STAGGER_CHILD_VARIANTS} className='flex flex-col items-center space-y-10 text-center'>
                <p className='text-2xl font-bold tracking-tighter text-foreground'>Orakul</p>
                <h1 className='font-display max-w-md text-2xl font-semibold transition-colors '>Let&apos;s begin by
                    connecting to your knowledge stores</h1>
            </motion.div>

            <motion.div variants={STAGGER_CHILD_VARIANTS} className='flex flex-col items-center space-y-10 text-center'>
                <h1 className='font-display max-w-md text-lg font-light transition-colors '>The more the sources, the
                    better the experience.</h1>
            </motion.div>

            <motion.button
                variants={STAGGER_CHILD_VARIANTS}
                className='text-foreground rounded-md border border-border transition-colors hover:bg-gray-200 hover:dark:bg-gray-800 min-h-[200px] md:grid-cols-3 flex flex-col items-center justify-center overflow-hidden p-5 space-y-5 md:p-10 min-h-[200px]'
                onClick={() => setShowCarbon(true)}
            >
                <Brain/>
                <div>Connect</div>
            </motion.button>
            {user && (
                <CarbonConnect
                    orgName='Orakul'
                    brandIcon='https://www.svgrepo.com/show/156615/brain.svg'
                    embeddingModel='OPENAI'
                    tokenFetcher={tokenFetcher}
                    tags={{userEmail: user.email!, userId: user.id}}
                    maxFileSize={10000000}
                    enabledIntegrations={[
                        {
                            id: IntegrationName.LOCAL_FILES,
                            chunkSize: 10000,
                            overlapSize: 500,
                            maxFileSize: 200000000,
                            allowMultipleFiles: true,
                            maxFilesCount: 5,
                            generateSparseVectors: true
                        },
                        {
                            id: IntegrationName.DROPBOX,
                            chunkSize: 10000,
                            overlapSize: 500,
                            generateSparseVectors: true
                        },
                        {
                            id: IntegrationName.WEB_SCRAPER,
                            chunkSize: 1500,
                            overlapSize: 20,
                            generateSparseVectors: true
                        },
                        {
                            id: IntegrationName.GOOGLE_DRIVE,
                            chunkSize: 1000,
                            overlapSize: 20,
                            generateSparseVectors: true
                        },
                        {
                            id: IntegrationName.GMAIL,
                            chunkSize: 10000,
                            overlapSize: 500,
                            generateSparseVectors: true
                        }
                    ]}
                    onSuccess={onSuccess}
                    onError={error => {
                        console.error('Carbon Error: ', error)
                        toast.error('An error occurred. Blame Nikita.')
                    }}
                    primaryBackgroundColor='#F2F2F2'
                    primaryTextColor='#555555'
                    secondaryBackgroundColor='#f2f2f2'
                    secondaryTextColor='#000000'
                    allowMultipleFiles
                    open={showCarbon}
                    setOpen={onToggleCarbon}
                    chunkSize={1500}
                    overlapSize={20}
                    enableToasts
                    generateSparseVectors
                />
            )}
        </motion.div>
    )
}
