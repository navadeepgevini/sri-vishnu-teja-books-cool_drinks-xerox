import { createClient } from '@supabase/supabase-js'

// Xerox files are uploaded to Supabase Storage (free, no card; Firebase Storage needs a paid plan), and
// the WhatsApp message carries a link to each file. Loaded on demand (xerox page only), so the Supabase
// library never lands in the first-load bundle.
//
// Supabase setup: a PUBLIC bucket (limited to 25 MB and PDF / Word / image types) with an INSERT-only
// policy. Visitors can upload but cannot list, change or delete anything. Each upload goes into a folder
// with a random UUID in its name, so a file's link cannot be guessed; only the shop receives it.

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined
const bucket = (import.meta.env.VITE_SUPABASE_BUCKET as string | undefined) || 'Bucket_Files'

const supabase =
  url && key ? createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }) : null

export type UploadProgress = { index: number; percent: number }

// Some computers label files wrongly (often Word files); decide the type from the name instead.
const TYPE_BY_EXTENSION: Record<string, string> = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  heic: 'image/heic',
  heif: 'image/heif',
}

function contentTypeOf(file: File): string {
  const extension = file.name.split('.').pop()?.toLowerCase() ?? ''
  return TYPE_BY_EXTENSION[extension] ?? file.type ?? 'application/octet-stream'
}

/** Makes a file name safe for a storage path and keeps it short. */
function safeName(name: string): string {
  return name.replace(/[^\w.\- ]+/g, '_').replace(/\s+/g, '-').slice(-80)
}

/** Short code shown to the customer and the shop, e.g. XR-0922-7K3Q. */
export function makeOrderCode(date = new Date()): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no lookalike characters
  let tail = ''
  for (const value of crypto.getRandomValues(new Uint8Array(4))) tail += letters[value % letters.length]
  return `XR-${month}${day}-${tail}`
}

/** Uploads one after another (kinder to phone connections) and returns a link per file. */
export async function uploadPrintFiles(
  files: File[],
  orderCode: string,
  onProgress: (progress: UploadProgress) => void,
): Promise<string[]> {
  if (!supabase) throw new Error('File upload is not configured (VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY).')

  // The random part makes every link unguessable, since the bucket is public.
  const folder = `${orderCode}-${crypto.randomUUID()}`
  const links: string[] = []

  for (const [index, file] of files.entries()) {
    onProgress({ index, percent: 0 })
    const path = `${folder}/${index + 1}-${safeName(file.name)}`
    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { contentType: contentTypeOf(file), upsert: false })
    if (error) throw error
    onProgress({ index, percent: 100 })
    links.push(supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl)
  }

  return links
}
