CHUNK_SIZE = 1500   # characters ≈ 512 tokens
OVERLAP = 300       # characters ≈ 128 tokens


def _split_text(text: str) -> list[str]:
    """Split text into chunks with overlap, respecting paragraph/newline boundaries."""
    paragraphs: list[str] = []
    for para in text.split("\n\n"):
        stripped = para.strip()
        if stripped:
            paragraphs.append(stripped)

    chunks: list[str] = []
    current = ""

    for para in paragraphs:
        if not current:
            current = para
            continue
        if len(current) + len(para) + 2 <= CHUNK_SIZE:
            current += "\n\n" + para
        else:
            chunks.append(current)
            # start next chunk with overlap from end of current
            overlap_text = current[-OVERLAP:] if len(current) > OVERLAP else current
            current = overlap_text + "\n\n" + para

    if current:
        chunks.append(current)

    return chunks


def chunk_page(page_number: int | None, text: str, base_index: int) -> list[dict]:
    """Returns list of chunk dicts with page_number and chunk_index."""
    raw_chunks = _split_text(text)
    result = []
    for i, content in enumerate(raw_chunks):
        result.append(
            {
                "page_number": page_number,
                "chunk_index": base_index + i,
                "content": content,
            }
        )
    return result


def chunk_document(pages: list[tuple[int | None, str]]) -> list[dict]:
    """Chunk an entire document from (page_number, text) pairs."""
    all_chunks: list[dict] = []
    for page_number, text in pages:
        chunks = chunk_page(page_number, text, len(all_chunks))
        all_chunks.extend(chunks)
    return all_chunks
