import type { MediaItemOut } from '../api/submissions'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

interface Props {
  media: MediaItemOut[]
}

export default function MediaGallery({ media }: Props) {
  if (media.length === 0) return null

  const sorted = [...media].sort((a, b) => a.display_order - b.display_order)

  return (
    <div className="flex flex-col gap-3">
      {sorted.map((item) => {
        const src = `${BASE_URL}/media/${item.file_path}`
        if (item.type === 'image') {
          return (
            <img
              key={item.id}
              src={src}
              alt=""
              className="w-full border-2 border-border object-cover max-h-96"
            />
          )
        }
        if (item.type === 'video') {
          return (
            <video
              key={item.id}
              src={src}
              controls
              className="w-full border-2 border-border"
            />
          )
        }
        if (item.type === 'audio') {
          return (
            <audio
              key={item.id}
              src={src}
              controls
              className="w-full"
            />
          )
        }
        return null
      })}
    </div>
  )
}
