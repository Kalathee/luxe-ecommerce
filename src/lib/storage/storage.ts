import fs from "fs/promises"
import path from "path"
import crypto from "crypto"
import sharp from "sharp"

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads")

export interface UploadResult {
  url: string
  filename: string
  mimeType: string
  size: number
}

/**
 * Ensures the upload directory exists.
 */
async function ensureUploadDir() {
  try {
    await fs.access(UPLOAD_DIR)
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true })
  }
}

/**
 * Processes and saves an uploaded image.
 * 
 * - Converts to WebP
 * - Resizes if larger than 1920px width
 * - Compresses for web optimization
 * - Generates unique filename
 */
export async function saveImage(file: File): Promise<UploadResult> {
  await ensureUploadDir()

  const buffer = Buffer.from(await file.arrayBuffer())
  const hash = crypto.randomBytes(8).toString("hex")
  const timestamp = Date.now()
  const filename = `${timestamp}-${hash}.webp`
  const filePath = path.join(UPLOAD_DIR, filename)

  // Image Processing with Sharp
  const processedImage = await sharp(buffer)
    .resize({ width: 1920, withoutEnlargement: true }) // Resize if larger
    .webp({ quality: 80 }) // Convert to WebP + compress
    .toBuffer()

  await fs.writeFile(filePath, processedImage)

  return {
    url: `/uploads/${filename}`,
    filename,
    mimeType: "image/webp",
    size: processedImage.length,
  }
}

/**
 * Deletes a stored file.
 */
export async function deleteFile(filename: string) {
  const filePath = path.join(UPLOAD_DIR, filename)
  try {
    await fs.unlink(filePath)
  } catch (error) {
    console.error(`Failed to delete file: ${filename}`, error)
  }
}
