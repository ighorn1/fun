import { useRef, useState } from 'react'

interface Props {
  onFile: (file: File, progress: (pct: number) => void) => void
  loading: boolean
}

export function UploadZone({ onFile, loading }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [progress, setProgress] = useState(0)

  const handle = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      alert('Veuillez sélectionner un fichier PDF.')
      return
    }
    setProgress(0)
    onFile(file, setProgress)
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handle(file)
  }

  return (
    <div
      onDrop={onDrop}
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onClick={() => !loading && inputRef.current?.click()}
      className={`
        relative flex flex-col items-center justify-center gap-3 p-10
        border-2 border-dashed rounded-2xl cursor-pointer transition-colors
        ${dragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:bg-blue-50 hover:border-blue-400'}
        ${loading ? 'opacity-60 cursor-wait' : ''}
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handle(file)
          e.target.value = ''
        }}
      />

      <svg className="w-14 h-14 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>

      {loading ? (
        <div className="w-full max-w-xs">
          <p className="text-sm text-gray-500 text-center mb-1">Analyse en cours…</p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : (
        <>
          <p className="text-base font-medium text-gray-700">
            Glissez un PDF ici ou cliquez pour choisir
          </p>
          <p className="text-sm text-gray-400">Fichier PDF contenant un tableau — max 10 Mo</p>
        </>
      )}
    </div>
  )
}
