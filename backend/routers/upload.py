from fastapi import APIRouter, UploadFile, File, HTTPException
from services.pdf_extractor import extract_tables, _is_table_empty
from services.ollama_enhancer import enhance_with_ollama
from models.schemas import UploadResponse

router = APIRouter()

MAX_SIZE = 10 * 1024 * 1024  # 10 MB


@router.post("/upload", response_model=UploadResponse)
async def upload_pdf(file: UploadFile = File(...)):
    if file.content_type not in ("application/pdf", "application/octet-stream"):
        # Some browsers send octet-stream for PDFs
        if not (file.filename or "").lower().endswith(".pdf"):
            raise HTTPException(400, "Only PDF files are accepted")

    data = await file.read()
    if len(data) > MAX_SIZE:
        raise HTTPException(413, "File exceeds 10 MB limit")

    tables, raw_text = extract_tables(data)

    # Check if extraction was good enough
    good_tables = [t for t in tables if not _is_table_empty(t)]
    ollama_used = False

    if not good_tables:
        # Fallback to Ollama
        ollama_tables = await enhance_with_ollama(raw_text)
        if ollama_tables:
            good_tables = ollama_tables
            ollama_used = True

    if not good_tables:
        raise HTTPException(
            422,
            "No tables found in this PDF. "
            "Make sure the PDF contains a real table (not a scanned image).",
        )

    return UploadResponse(tables=good_tables, ollama_used=ollama_used)
