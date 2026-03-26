import fitz  # pymupdf
import markdown as md
from bs4 import BeautifulSoup


def extract_pdf(data: bytes) -> list[tuple[int, str]]:
    """Returns list of (page_number, text) tuples (1-indexed)."""
    doc = fitz.open(stream=data, filetype="pdf")
    pages = []
    for i, page in enumerate(doc, start=1):
        text = page.get_text()
        if text.strip():
            pages.append((i, text))
    return pages


def extract_txt(data: bytes) -> list[tuple[None, str]]:
    text = data.decode("utf-8", errors="replace")
    return [(None, text)]


def extract_md(data: bytes) -> list[tuple[None, str]]:
    raw = data.decode("utf-8", errors="replace")
    html = md.markdown(raw)
    text = BeautifulSoup(html, "html.parser").get_text()
    return [(None, text)]


def extract(data: bytes, file_type: str) -> list[tuple[int | None, str]]:
    if file_type == "pdf":
        return extract_pdf(data)
    if file_type == "txt":
        return extract_txt(data)
    if file_type == "md":
        return extract_md(data)
    raise ValueError(f"Unsupported file type: {file_type}")
