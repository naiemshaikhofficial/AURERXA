'use client'

import React from 'react'
import Script from 'next/script'
import { useConsent } from '@/context/consent-context'

export function TrackingScripts() {
    const { consentStatus } = useConsent()

    // Only load scripts if consent is granted
    if (consentStatus !== 'granted') return null

    return (
        <>
            {/* Meta Pixel (Facebook) Placeholder */}
            {/* Replace PIXEL_ID with actual ID when available */}
            <Script
                id="fb-pixel"
                strategy="lazyOnload"
                dangerouslySetInnerHTML={{
                    __html: `
                        !function(f,b,e,v,n,t,s)
                        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                        n.queue=[];t=b.createElement(e);t.async=!0;
                        t.src=v;s=b.getElementsByTagName(e)[0];
                        s.parentNode.insertBefore(t,s)}(window, document,'script',
                        'https://connect.facebook.net/en_US/fbevents.js');
                        fbq('init', 'PIXEL_ID');
                        fbq('track', 'PageView');
                    `,
                }}
            />

            {/* Google Tag Manager (GTM) Placeholder */}
            {/* Replace GTM_ID with actual ID when available */}
            <Script
                id="gtm-script"
                strategy="lazyOnload"
                dangerouslySetInnerHTML={{
                    __html: `
                        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                        })(window,document,'script','dataLayer','GTM_ID');
                    `,
                }}
            />
        </>
    )
}
