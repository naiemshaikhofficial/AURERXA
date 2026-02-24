'use client'

import { useTheme } from 'next-themes'
import { Toaster as Sonner } from 'sonner'

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-neutral-900 group-[.toaster]:backdrop-blur-xl group-[.toaster]:text-white group-[.toaster]:border-amber-500/50 group-[.toaster]:border-2 group-[.toaster]:shadow-[0_20px_50px_rgba(0,0,0,0.8)] group-[.toaster]:rounded-none group-[.toaster]:font-premium-sans group-[.toaster]:text-[12px] group-[.toaster]:tracking-[0.1em] group-[.toaster]:p-4',
          description: 'group-[.toast]:text-white/70 group-[.toast]:font-serif group-[.toast]:text-xs',
          actionButton:
            'group-[.toast]:bg-amber-500 group-[.toast]:text-neutral-950 group-[.toast]:rounded-none group-[.toast]:font-bold',
          cancelButton:
            'group-[.toast]:bg-neutral-800 group-[.toast]:text-white group-[.toast]:rounded-none',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
