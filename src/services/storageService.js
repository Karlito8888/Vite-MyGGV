import { supabase } from './baseService'

/**
 * Storage Service
 * Gère l'upload et la suppression de fichiers dans Supabase Storage
 */

const DEFAULT_BUCKET = 'service-photos'

/**
 * Upload un fichier vers Supabase Storage
 * @param {File} file - Fichier à uploader
 * @param {string} folder - Dossier de destination (ex: 'uploads')
 * @param {string} bucket - Nom du bucket (ex: 'service-photos', 'business-inside-photos', 'business-outside-photos')
 * @returns {Promise<{url: string|null, error: Error|null}>}
 */
export async function uploadFile(file, folder, bucket = DEFAULT_BUCKET) {
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
    const filePath = `${folder}/${fileName}`

    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) throw error

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath)

    return { url: publicUrl, error: null }
  } catch (error) {
    console.error('Error uploading file:', error)
    return { url: null, error }
  }
}

/**
 * Upload plusieurs fichiers
 * @param {FileList|Array<File>} files - Fichiers à uploader
 * @param {string} folder - Dossier de destination
 * @param {string} bucket - Nom du bucket
 * @returns {Promise<{urls: Array<string>, errors: Array<Error>}>}
 */
export async function uploadMultipleFiles(files, folder, bucket = DEFAULT_BUCKET) {
  const results = await Promise.allSettled(
    Array.from(files).map(file => uploadFile(file, folder, bucket))
  )

  const urls = []
  const errors = []

  results.forEach(result => {
    if (result.status === 'fulfilled' && result.value.url) {
      urls.push(result.value.url)
    } else if (result.status === 'rejected' || result.value.error) {
      errors.push(result.reason || result.value.error)
    }
  })

  return { urls, errors }
}

/**
 * Supprime un fichier de Supabase Storage
 * @param {string} url - URL publique du fichier
 * @param {string} bucket - Nom du bucket
 * @returns {Promise<{success: boolean, error: Error|null}>}
 */
export async function deleteFile(url, bucket = DEFAULT_BUCKET) {
  try {
    // Extraire le chemin du fichier depuis l'URL
    const urlParts = url.split(`${bucket}/`)
    if (urlParts.length < 2) {
      throw new Error('Invalid file URL')
    }
    const filePath = urlParts[1]

    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath])

    if (error) throw error

    return { success: true, error: null }
  } catch (error) {
    console.error('Error deleting file:', error)
    return { success: false, error }
  }
}

/**
 * Supprime plusieurs fichiers
 * @param {Array<string>} urls - URLs des fichiers à supprimer
 * @param {string} bucket - Nom du bucket
 * @returns {Promise<{successCount: number, errorCount: number}>}
 */
export async function deleteMultipleFiles(urls, bucket = DEFAULT_BUCKET) {
  const results = await Promise.allSettled(
    urls.map(url => deleteFile(url, bucket))
  )

  let successCount = 0
  let errorCount = 0

  results.forEach(result => {
    if (result.status === 'fulfilled' && result.value.success) {
      successCount++
    } else {
      errorCount++
    }
  })

  return { successCount, errorCount }
}

/**
 * Obtient l'URL publique d'un fichier
 * @param {string} filePath - Chemin du fichier dans le bucket
 * @param {string} bucket - Nom du bucket
 * @returns {string}
 */
export function getPublicUrl(filePath, bucket = DEFAULT_BUCKET) {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath)

  return data.publicUrl
}
