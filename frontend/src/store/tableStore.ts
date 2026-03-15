import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { TableRow } from '../api/client'

interface TableState {
  headers: string[]
  rows: TableRow[]
  setTable: (headers: string[], rows: TableRow[]) => void
  toggleRow: (index: number) => void
  toggleAll: (checked: boolean) => void
  checkedCount: () => number
  reset: () => void
}

export const useTableStore = create<TableState>()(
  persist(
    (set, get) => ({
      headers: [],
      rows: [],

      setTable: (headers, rows) => set({ headers, rows }),

      toggleRow: (index) =>
        set((state) => ({
          rows: state.rows.map((row, i) =>
            i === index ? { ...row, checked: !row.checked } : row
          ),
        })),

      toggleAll: (checked) =>
        set((state) => ({
          rows: state.rows.map((row) => ({ ...row, checked })),
        })),

      checkedCount: () => get().rows.filter((r) => r.checked).length,

      reset: () => set({ headers: [], rows: [] }),
    }),
    {
      name: 'pdf-checklist-state',
    }
  )
)
