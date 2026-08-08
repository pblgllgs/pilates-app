const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string | undefined
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string | undefined

export async function uploadProfilePhoto(file: File): Promise<string> {
  if (!cloudName || !uploadPreset) {
    throw new Error("Cloudinary no está configurado.")
  }
  const body = new FormData()
  body.append("file", file)
  body.append("upload_preset", uploadPreset)
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body,
  })
  if (!res.ok) throw new Error("Error al subir la foto a Cloudinary.")
  const data = await res.json()
  return data.secure_url as string
}
