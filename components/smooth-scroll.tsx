'use client'

import { ReactNode } from 'react'
// import Lenis from 'lenis' // Disabled for "Normal" native scroll feel

export function SmoothScroll({ children }: { children: ReactNode }) {
    // Lenis Disabled - Returning to native scroll for maximum performance and "normal" feel
    /*
    useEffect(() => {
        // ... (Lenis code removed)
    }, [])
    */

    return <>{children}</>
}
