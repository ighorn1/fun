import { useTableStore } from '../store/tableStore'

export function ChecklistTable() {
  const { headers, rows, toggleRow, toggleAll, checkedCount } = useTableStore()
  const total = rows.length
  const checked = checkedCount()
  const allChecked = total > 0 && checked === total
  const someChecked = checked > 0 && checked < total

  const copyAsText = () => {
    const lines: string[] = []
    const headerLine = ['[  ]', ...headers].join(' | ')
    lines.push(headerLine)
    lines.push('-'.repeat(headerLine.length))
    for (const row of rows) {
      const mark = row.checked ? '[x]' : '[ ]'
      lines.push([mark, ...row.cells.map((c) => c.value)].join(' | '))
    }
    navigator.clipboard.writeText(lines.join('\n'))
      .then(() => alert('Tableau copié dans le presse-papier !'))
      .catch(() => alert('Impossible de copier.'))
  }

  return (
    <div className="space-y-3">
      {/* Header bar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-600">
            <span className={`font-bold ${checked === total && total > 0 ? 'text-green-600' : 'text-blue-700'}`}>
              {checked}
            </span>
            {' / '}{total} coché{checked > 1 ? 's' : ''}
          </span>
          {total > 0 && (
            <div className="w-32 bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${(checked / total) * 100}%` }}
              />
            </div>
          )}
        </div>
        <button onClick={copyAsText} className="btn-secondary text-sm">
          Copier en texte
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="border-b border-gray-200 p-2 w-12">
                <div className="checkbox-cell">
                  <input
                    type="checkbox"
                    checked={allChecked}
                    ref={(el) => { if (el) el.indeterminate = someChecked }}
                    onChange={(e) => toggleAll(e.target.checked)}
                    className="w-5 h-5 rounded accent-blue-600 cursor-pointer"
                    title="Tout sélectionner"
                  />
                </div>
              </th>
              {headers.map((h, i) => (
                <th key={i} className="border-b border-gray-200 px-3 py-2 text-left font-semibold text-gray-700">
                  {h || <span className="text-gray-400 italic">—</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr
                key={ri}
                onClick={() => toggleRow(ri)}
                className={`
                  cursor-pointer transition-colors
                  ${row.checked ? 'bg-green-50 hover:bg-green-100' : 'hover:bg-gray-50'}
                `}
              >
                <td className="border-b border-gray-100 p-2">
                  <div className="checkbox-cell">
                    <input
                      type="checkbox"
                      checked={row.checked}
                      onChange={() => toggleRow(ri)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-5 h-5 rounded accent-blue-600 cursor-pointer"
                    />
                  </div>
                </td>
                {row.cells.map((cell, ci) => (
                  <td
                    key={ci}
                    className={`border-b border-gray-100 px-3 py-2 ${row.checked ? 'text-gray-500' : 'text-gray-800'}`}
                  >
                    {cell.value || <span className="text-gray-300">—</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
