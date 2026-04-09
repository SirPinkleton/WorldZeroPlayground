import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { createCharacter, uploadCharacterAvatar } from '../api/characters'
import { extractError } from '../utils/errors'

export default function CreateCharacter() {
  const { refetch } = useAuth()
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [location, setLocation] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarUrl, setAvatarUrl] = useState('')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null
    setAvatarFile(f)
    if (f) {
      setAvatarUrl('')
      setAvatarPreview(URL.createObjectURL(f))
    } else {
      setAvatarPreview(null)
    }
  }

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAvatarUrl(e.target.value)
    if (e.target.value) {
      setAvatarFile(null)
      setAvatarPreview(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (username.length < 3 || username.length > 30)
      errs.username = 'Username must be 3–30 characters.'
    if (!displayName.trim() || displayName.length > 50)
      errs.displayName = 'Display name is required (max 50 characters).'
    if (bio.length > 500)
      errs.bio = 'Bio must be 500 characters or fewer.'
    if (location.length > 100)
      errs.location = 'Location must be 100 characters or fewer.'
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!validate()) return

    setSubmitting(true)
    try {
      const character = await createCharacter({
        username,
        display_name: displayName,
        bio: bio || undefined,
        location: location || undefined,
        avatar_url: avatarUrl || undefined,
      })

      if (avatarFile) {
        await uploadCharacterAvatar(character.id, avatarFile)
      }

      await refetch()
      navigate(`/characters/${character.id}`)
    } catch (err) {
      setError(extractError(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page max-w-xl mx-auto py-10">
      {/* Flavor text */}
      <div className="mb-8 border-2 border-border p-4 shadow-sketch bg-card font-body text-sm leading-relaxed">
        <p className="text-muted">
          The first task reads: <span className="line-through">"Take a picture of yourself."</span>
        </p>
        <p className="mt-2">
          This is the only time a <em>sous rature</em> gesture will be made, so let us remind you:
          you may be your character, but your character need not be you.
        </p>
      </div>

      <h1 className="font-display text-4xl font-bold mb-6">Create your character</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Avatar */}
        <div className="flex flex-col gap-2">
          <label className="font-body text-sm font-semibold">Avatar</label>
          <div className="flex items-center gap-4">
            {avatarPreview && (
              <img
                src={avatarPreview}
                alt="Avatar preview"
                className="w-16 h-16 object-cover border-2 border-border shadow-sketch-sm"
              />
            )}
            {!avatarPreview && avatarUrl && (
              <img
                src={avatarUrl}
                alt="Avatar preview"
                className="w-16 h-16 object-cover border-2 border-border shadow-sketch-sm"
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
            )}
            <div className="flex flex-col gap-2 flex-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="font-body text-sm file:mr-3 file:border-2 file:border-border file:bg-card file:px-3 file:py-1 file:font-body file:text-xs file:shadow-sketch-sm file:cursor-pointer hover:file:bg-paper"
              />
              <div className="flex items-center gap-2">
                <span className="font-body text-xs text-muted">or paste a URL</span>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={handleUrlChange}
                  placeholder="https://..."
                  className="flex-1 border-2 border-border bg-card px-2 py-1 font-body text-xs shadow-sketch-sm focus:outline-none focus:border-ink"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Username */}
        <div className="flex flex-col gap-1">
          <label className="font-body text-sm font-semibold">
            Username <span className="text-red-600">*</span>
            <span className="ml-2 font-normal text-muted text-xs">permanent — cannot be changed</span>
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="your_handle"
            minLength={3}
            maxLength={30}
            required
            className="border-2 border-border bg-card px-3 py-2 font-body text-sm shadow-sketch-sm focus:outline-none focus:border-ink"
          />
          {fieldErrors.username && (
            <p className="font-body text-xs text-red-600">{fieldErrors.username}</p>
          )}
        </div>

        {/* Display Name */}
        <div className="flex flex-col gap-1">
          <label className="font-body text-sm font-semibold">
            Display name <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="The name others will see"
            maxLength={50}
            required
            className="border-2 border-border bg-card px-3 py-2 font-body text-sm shadow-sketch-sm focus:outline-none focus:border-ink"
          />
          {fieldErrors.displayName && (
            <p className="font-body text-xs text-red-600">{fieldErrors.displayName}</p>
          )}
        </div>

        {/* Bio */}
        <div className="flex flex-col gap-1">
          <label className="font-body text-sm font-semibold">
            Bio <span className="text-muted font-normal text-xs">optional</span>
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Who is your character?"
            maxLength={500}
            rows={3}
            className="border-2 border-border bg-card px-3 py-2 font-body text-sm shadow-sketch-sm focus:outline-none focus:border-ink resize-none"
          />
          <span className="font-body text-xs text-muted self-end">{bio.length}/500</span>
          {fieldErrors.bio && (
            <p className="font-body text-xs text-red-600">{fieldErrors.bio}</p>
          )}
        </div>

        {/* Location */}
        <div className="flex flex-col gap-1">
          <label className="font-body text-sm font-semibold">
            Location <span className="text-muted font-normal text-xs">optional</span>
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Where in the world?"
            maxLength={100}
            className="border-2 border-border bg-card px-3 py-2 font-body text-sm shadow-sketch-sm focus:outline-none focus:border-ink"
          />
          {fieldErrors.location && (
            <p className="font-body text-xs text-red-600">{fieldErrors.location}</p>
          )}
        </div>

        {error && (
          <p className="font-body text-sm text-red-600 border-2 border-red-300 px-3 py-2">
            {error}
          </p>
        )}

        <button type="submit" disabled={submitting} className="btn-primary self-start">
          {submitting ? 'Creating...' : 'Create character →'}
        </button>
      </form>
    </div>
  )
}
