import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import { X, Check } from 'lucide-react'

// Helper function to create an HTML image
const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))
    image.setAttribute('crossOrigin', 'anonymous')
    image.src = url
  })

// Helper function to extract the cropped area as a Blob/File
async function getCroppedImg(imageSrc, pixelCrop) {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    return null
  }

  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  )

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) return
      // Create a File object
      const file = new File([blob], 'cropped.webp', { type: 'image/webp' })
      resolve(file)
    }, 'image/webp', 0.9)
  })
}

export default function ImageCropperModal({ imageSrc, aspectRatio = 1, onCropComplete, onCancel }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [isCropping, setIsCropping] = useState(false)

  const onCropCompleteHandler = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const handleSave = async () => {
    try {
      setIsCropping(true)
      const croppedFile = await getCroppedImg(imageSrc, croppedAreaPixels)
      onCropComplete(croppedFile)
    } catch (e) {
      console.error(e)
    } finally {
      setIsCropping(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[var(--surface)] w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[80vh]">
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <h3 className="font-bold text-lg text-[var(--fg)]">Crop Image</h3>
          <button onClick={onCancel} className="p-2 text-[var(--fg-muted)] hover:bg-[var(--border)] rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="relative flex-1 bg-black/10">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspectRatio}
            onCropChange={setCrop}
            onCropComplete={onCropCompleteHandler}
            onZoomChange={setZoom}
          />
        </div>
        
        <div className="p-6 border-t border-[var(--border)] flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1 w-full flex items-center gap-4">
            <span className="text-sm font-medium text-[var(--fg-muted)]">Zoom</span>
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => setZoom(e.target.value)}
              className="flex-1 accent-[var(--accent)]"
            />
          </div>
          <button
            onClick={handleSave}
            disabled={isCropping}
            className="w-full sm:w-auto px-6 py-2.5 bg-[var(--accent)] text-white rounded-full font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isCropping ? 'Cropping...' : (
              <>
                <Check size={18} /> Apply Crop
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
