'use client'

import {motion} from 'framer-motion'
import {useRouter, useSearchParams} from 'next/navigation'
import {Button} from '../ui/button'
import {useSupabase} from "@/utils/useSupabaseConfig";
import {useOverlay} from "@/providers/OverlayProvider";
import {useEffect} from "react";

export const STAGGER_CHILD_VARIANTS = {
    hidden: {opacity: 0, y: 20},
    show: {opacity: 1, y: 0, transition: {duration: 0.4, type: 'spring'}}
}

export default function Welcome() {
    const router = useRouter()

    return (
        <motion.div className='z-10' exit={{opacity: 0, scale: 0.95}} transition={{duration: 0.3, type: 'spring'}}>
            <motion.div
                variants={{
                    show: {
                        transition: {
                            staggerChildren: 0.2
                        }
                    }
                }}
                initial='hidden'
                animate='show'
                className='mx-5 flex flex-col items-center space-y-10 text-center sm:mx-auto'
            >
                <motion.h1 className='font-display text-4xl font-bold text-foreground transition-colors sm:text-5xl'
                           variants={STAGGER_CHILD_VARIANTS}>
                    Welcome to <span className='font-bold tracking-tighter'>Orakul</span>
                </motion.h1>
                <motion.div className='max-w-md text-accent-foreground/80 transition-colors sm:text-lg'
                            variants={STAGGER_CHILD_VARIANTS}>
                    Orakul gives you the power to live a life uncoupled from the limitations of memory.
                </motion.div>
                <motion.div className='text-accent-foreground/80 transition-colors text-sm'
                            variants={STAGGER_CHILD_VARIANTS}>
                    {'>'} By understanding your unique personality based on your documents, emails, conversations,
                    Orakul can help you make better decisions, faster.
                </motion.div>
                <motion.div variants={STAGGER_CHILD_VARIANTS}>
                    <Button className='px-10 font-medium text-base' variant='outline'
                            onClick={() => router.push('/onboarding?step=step1')}>
                        Get Started
                    </Button>
                </motion.div>
            </motion.div>
        </motion.div>
    )
}
