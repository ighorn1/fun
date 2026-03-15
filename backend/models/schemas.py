from pydantic import BaseModel
from typing import List, Optional


class Cell(BaseModel):
    value: str


class TableRow(BaseModel):
    cells: List[Cell]
    checked: bool = False


class ExtractedTable(BaseModel):
    table_index: int
    headers: List[str]
    rows: List[TableRow]


class UploadResponse(BaseModel):
    tables: List[ExtractedTable]
    ollama_used: bool = False


class ChecklistState(BaseModel):
    headers: List[str]
    rows: List[TableRow]


class ExportRequest(BaseModel):
    format: str  # "html" | "text"
    checklist: ChecklistState
