'use client'

import { useEffect, useRef } from 'react'

export function DynamicTitle() {
    const originalTitle = useRef<string>('')
    const intervalRef = useRef<NodeJS.Timeout | null>(null)
    const messages = ['❤️ You left this...', '❤️ Come back!']

    useEffect(() => {
        let currentIndex = 0

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                // Store current title before changing
                originalTitle.current = document.title

                // Start cycling
                if (!intervalRef.current) {
                    intervalRef.current = setInterval(() => {
                        currentIndex = (currentIndex + 1) % messages.length
                        document.title = messages[currentIndex]
                    }, 2000)
                }

                // Set initial hidden title
                document.title = messages[0]
            } else {
                // Stop cycling and restore
                if (intervalRef.current) {
                    clearInterval(intervalRef.current)
                    intervalRef.current = null
                }
                if (originalTitle.current) {
                    document.title = originalTitle.current
                }
            }
        }

        // Add listener
        document.addEventListener('visibilitychange', handleVisibilityChange)

        // Cleanup
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current)
            document.removeEventListener('visibilitychange', handleVisibilityChange)
        }
    }, [])

    return null
}
