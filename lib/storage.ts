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
        const fileExt = file.name.split('.').pop()
        const fileName = path || `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
        const filePath = fileName

        // Upload the file
        const { error: uploadError, data } = await supabase.storage
            .from(bucket)
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: true
            })

        if (uploadError) {
            // If the error is "Bucket not found", we might need the user to create it, 
            // but for now we'll throw the error.
            throw uploadError
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(filePath)

        return { success: true, url: publicUrl }
    } catch (error: any) {
        console.error('Storage Upload Error:', error)
        return { success: false, error: error.message || 'Failed to upload image' }
    }
}
