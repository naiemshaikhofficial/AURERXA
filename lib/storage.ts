import { supabase } from './supabase'

/**
 * Uploads an image to Supabase Storage bucket.
 * @param file The file object (already compressed)
 * @param bucket The storage bucket name
 * @param path The path within the bucket (default: random filename)
 * @returns The public URL of the uploaded image
 */
export async function uploadToSupabase(
    file: File,
    bucket: string = 'products',
    path?: string
) {
    try {
        console.log(`Storage: Attempting upload to bucket "${bucket}"...`)
        const fileExt = file.name.split('.').pop()
        const fileName = path || `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
        const filePath = fileName

        // Upload the file
        console.log(`Storage: Uploading path "${filePath}" with size ${file.size} bytes...`)
        const { error: uploadError, data } = await supabase.storage
            .from(bucket)
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: true
            })

        if (uploadError) {
            console.error('Storage: Supabase upload error:', uploadError)
            throw uploadError
        }

        console.log('Storage: Upload successful, getting public URL...')
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(filePath)

        console.log('Storage: Public URL generated:', publicUrl)
        return { success: true, url: publicUrl }
    } catch (error: any) {
        console.error('Storage: Caught error:', error)
        return { success: false, error: error.message || 'Failed to upload image' }
    }
}
