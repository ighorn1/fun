import axios from 'axios'

export interface Cell {
  value: string
}

export interface TableRow {
  cells: Cell[]
  checked: boolean
}

export interface ExtractedTable {
  table_index: number
  headers: string[]
  rows: TableRow[]
}

export interface UploadResponse {
  tables: ExtractedTable[]
  ollama_used: boolean
}

const api = axios.create({ baseURL: '/api' })

export const uploadPdf = (
  file: File,
  onProgress?: (pct: number) => void
): Promise<UploadResponse> => {
  const form = new FormData()
  form.append('file', file)
  return api
    .post<UploadResponse>('/upload', form, {
      onUploadProgress: (e) => {
        if (onProgress && e.total) {
          onProgress(Math.round((e.loaded * 100) / e.total))
        }
      },
    })
    .then((r) => r.data)
}
