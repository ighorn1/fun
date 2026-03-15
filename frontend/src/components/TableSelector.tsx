import type { ExtractedTable } from '../api/client'

interface Props {
  tables: ExtractedTable[]
  onSelect: (table: ExtractedTable) => void
}

export function TableSelector({ tables, onSelect }: Props) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-800">
        {tables.length} tableau{tables.length > 1 ? 'x' : ''} trouvé{tables.length > 1 ? 's' : ''} — choisissez-en un :
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {tables.map((table) => (
          <button
            key={table.table_index}
            onClick={() => onSelect(table)}
            className="text-left border rounded-xl p-4 hover:border-blue-500 hover:bg-blue-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <p className="font-medium text-gray-800 mb-2">
              Tableau {table.table_index + 1}
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr>
                    {table.headers.map((h, i) => (
                      <th key={i} className="border border-gray-200 bg-gray-100 px-2 py-1 text-left font-medium text-gray-600">
                        {h || '—'}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {table.rows.slice(0, 3).map((row, ri) => (
                    <tr key={ri}>
                      {row.cells.map((cell, ci) => (
                        <td key={ci} className="border border-gray-200 px-2 py-1 text-gray-500">
                          {cell.value || '—'}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {table.rows.length > 3 && (
                    <tr>
                      <td
                        colSpan={table.headers.length}
                        className="border border-gray-200 px-2 py-1 text-center text-gray-400 italic"
                      >
                        +{table.rows.length - 3} ligne{table.rows.length - 3 > 1 ? 's' : ''}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
