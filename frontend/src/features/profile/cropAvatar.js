export const AVATAR_SIZE = 256
export const AVATAR_TYPES = ['image/png', 'image/jpeg', 'image/webp']

const WEBP_QUALITY = 0.85

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      URL.revokeObjectURL(url)
      resolve(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Не получилось открыть фото'))
    }
    image.src = url
  })
}

export async function cropAvatar(file) {
  if (!AVATAR_TYPES.includes(file.type)) {
    throw new Error('Подойдёт фото в формате PNG, JPEG или WebP')
  }
  const image = await loadImage(file)
  const side = Math.min(image.naturalWidth, image.naturalHeight)
  const canvas = document.createElement('canvas')
  canvas.width = AVATAR_SIZE
  canvas.height = AVATAR_SIZE
  canvas
    .getContext('2d')
    .drawImage(
      image,
      (image.naturalWidth - side) / 2,
      (image.naturalHeight - side) / 2,
      side,
      side,
      0,
      0,
      AVATAR_SIZE,
      AVATAR_SIZE,
    )
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', WEBP_QUALITY))
  if (!blob) throw new Error('Не получилось сжать фото')
  return blob
}
