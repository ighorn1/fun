import pdfplumber
from io import BytesIO
from models.schemas import ExtractedTable, TableRow, Cell


def _is_table_empty(table: ExtractedTable) -> bool:
    if not table.rows:
        return True
    non_empty = sum(
        1 for row in table.rows for cell in row.cells if cell.value.strip()
    )
    total = sum(len(row.cells) for row in table.rows)
    return total == 0 or (non_empty / total) < 0.3


def extract_tables(pdf_bytes: bytes) -> tuple[list[ExtractedTable], str]:
    """
    Returns (tables, raw_text).
    raw_text is the full document text, used for Ollama fallback.
    """
    results = []
    raw_pages_text = []

    with pdfplumber.open(BytesIO(pdf_bytes)) as pdf:
        table_idx = 0
        for page in pdf.pages:
            page_text = page.extract_text() or ""
            raw_pages_text.append(page_text)

            # Try bordered tables first
            raw_tables = page.extract_tables()

            # If no bordered tables found, try text-based detection
            if not raw_tables:
                raw_tables = page.extract_tables(
                    table_settings={
                        "vertical_strategy": "text",
                        "horizontal_strategy": "text",
                    }
                )

            for raw_table in raw_tables:
                if not raw_table or len(raw_table) < 2:
                    continue

                headers = [str(c or "").strip() for c in raw_table[0]]
                # Filter completely empty header rows
                if not any(h for h in headers):
                    continue

                rows = []
                for raw_row in raw_table[1:]:
                    cells = [Cell(value=str(c or "").strip()) for c in raw_row]
                    rows.append(TableRow(cells=cells, checked=False))

                table = ExtractedTable(
                    table_index=table_idx,
                    headers=headers,
                    rows=rows,
                )
                results.append(table)
                table_idx += 1

    raw_text = "\n\n".join(raw_pages_text)
    return results, raw_text
