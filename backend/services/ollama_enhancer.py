import os
import json
import httpx
from models.schemas import ExtractedTable, TableRow, Cell

OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3")


async def enhance_with_ollama(raw_text: str) -> list[ExtractedTable]:
    """
    Use Ollama to extract tables from raw PDF text when pdfplumber fails.
    Returns an empty list if Ollama is unreachable or returns invalid data.
    """
    if not raw_text.strip():
        return []

    prompt = (
        "Extract all tables from the following text. "
        "Return ONLY a valid JSON array (no markdown, no explanation) with this structure:\n"
        '[{"headers": ["col1", "col2"], "rows": [["val1", "val2"], ["val3", "val4"]]}]\n\n'
        f"Text:\n{raw_text[:4000]}"  # limit context length
    )

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{OLLAMA_HOST}/api/generate",
                json={
                    "model": OLLAMA_MODEL,
                    "prompt": prompt,
                    "stream": False,
                    "format": "json",
                },
            )
            response.raise_for_status()
            data = response.json()
            raw_response = data.get("response", "")

        parsed = json.loads(raw_response)
        if not isinstance(parsed, list):
            return []

        tables = []
        for idx, item in enumerate(parsed):
            if not isinstance(item, dict):
                continue
            headers = [str(h) for h in item.get("headers", [])]
            raw_rows = item.get("rows", [])
            rows = []
            for raw_row in raw_rows:
                if isinstance(raw_row, list):
                    cells = [Cell(value=str(c or "").strip()) for c in raw_row]
                else:
                    cells = [Cell(value=str(raw_row))]
                rows.append(TableRow(cells=cells, checked=False))

            if headers and rows:
                tables.append(
                    ExtractedTable(table_index=idx, headers=headers, rows=rows)
                )

        return tables

    except Exception:
        # Ollama is optional — silently return nothing on any error
        return []
