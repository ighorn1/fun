import { useState } from 'react'
import { UploadZone } from './components/UploadZone'
import { TableSelector } from './components/TableSelector'
import { ChecklistTable } from './components/ChecklistTable'
import { uploadPdf, type ExtractedTable, type UploadResponse } from './api/client'
import { useTableStore } from './store/tableStore'

type Step = 'upload' | 'select' | 'checklist'

export default function App() {
  const [step, setStep] = useState<Step>('upload')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tables, setTables] = useState<ExtractedTable[]>([])
  const [ollamaUsed, setOllamaUsed] = useState(false)

  const { setTable, reset } = useTableStore()

  const handleFile = async (file: File, progress: (pct: number) => void) => {
    setLoading(true)
    setError(null)
    try {
      const result: UploadResponse = await uploadPdf(file, progress)
      setTables(result.tables)
      setOllamaUsed(result.ollama_used)

      if (result.tables.length === 1) {
        const t = result.tables[0]
        setTable(t.headers, t.rows)
        setStep('checklist')
      } else {
        setStep('select')
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        'Une erreur est survenue lors de l\'analyse du fichier.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectTable = (table: ExtractedTable) => {
    setTable(table.headers, table.rows)
    setStep('checklist')
  }

  const handleReset = () => {
    reset()
    setTables([])
    setError(null)
    setStep('upload')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-900 mb-1">PDF Checklist</h1>
          <p className="text-gray-500 text-sm">
            Transformez un tableau PDF en liste à cocher interactive
          </p>
        </header>

        {/* Ollama badge */}
        {ollamaUsed && (
          <div className="mb-4 flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-lg px-4 py-2 text-sm text-purple-700">
            <span>🤖</span>
            <span>Tableau extrait avec l'aide d'Ollama AI</span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Steps */}
        {step === 'upload' && (
          <UploadZone onFile={handleFile} loading={loading} />
        )}

        {step === 'select' && (
          <div>
            <TableSelector tables={tables} onSelect={handleSelectTable} />
            <button onClick={handleReset} className="mt-4 btn-secondary text-sm">
              ← Choisir un autre fichier
            </button>
          </div>
        )}

        {step === 'checklist' && (
          <div>
            <ChecklistTable />
            <button onClick={handleReset} className="mt-6 btn-secondary text-sm">
              ← Nouveau fichier
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
