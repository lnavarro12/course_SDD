import { M } from './messages'

const MAX_BYTES = 2 * 1024 * 1024
const MAX_WIDTH = 600

export function validateLogoFile(file: File): void {
  if ((file.type !== 'image/png' && file.type !== 'image/jpeg') || file.size > MAX_BYTES) {
    throw new Error(M.logoInvalid)
  }
}

function readAsDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(String(r.result))
    r.onerror = () => reject(r.error)
    r.readAsDataURL(file)
  })
}

/** Reduce a máx. 600 px de ancho manteniendo la proporción; devuelve un data URL PNG/JPG. */
export async function resizeLogo(file: File): Promise<string> {
  validateLogoFile(file)
  const src = await readAsDataUrl(file)
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image()
    i.onload = () => resolve(i)
    i.onerror = () => reject(new Error(M.logoInvalid))
    i.src = src
  })
  if (img.width <= MAX_WIDTH) return src
  const scale = MAX_WIDTH / img.width
  const canvas = document.createElement('canvas')
  canvas.width = MAX_WIDTH
  canvas.height = Math.round(img.height * scale)
  canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL(file.type === 'image/jpeg' ? 'image/jpeg' : 'image/png', 0.9)
}
