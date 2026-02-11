'use client'

import Image, { ImageProps } from 'next/image'
import supabaseLoader from '@/lib/supabase-loader'

interface SupabaseImageProps extends Omit<ImageProps, 'loader'> { }

export function SupabaseImage(props: SupabaseImageProps) {
    return <Image {...props} loader={supabaseLoader} />
}
