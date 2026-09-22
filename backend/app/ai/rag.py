from __future__ import annotations

import hashlib
import re
from typing import List, Dict, Any

from app.core.config import settings

try:
    import chromadb
    CHROMADB_INSTALLED = True
except ImportError:
    CHROMADB_INSTALLED = False


class InterviewRAG:
    """
    CareerForge AI RAG system.

    Knowledge source:
        Job Description

    Vector database:
        ChromaDB (or local vector similarity engine fallback)

    Embeddings:
        OpenAI embeddings (when sk- key is provided) or ChromaDB Default ONNX/MiniLM embeddings
    """

    def __init__(self):
        self.chroma_available = CHROMADB_INSTALLED
        self.memory_store: Dict[int, List[str]] = {}

        if self.chroma_available:
            try:
                self.client = chromadb.PersistentClient(
                    path="./data/careerforge_chroma"
                )
                
                # Check key format to select appropriate embedding function
                api_key = settings.OPENAI_API_KEY or settings.GROQ_API_KEY
                if api_key and api_key.startswith("sk-"):
                    from chromadb.utils.embedding_functions import OpenAIEmbeddingFunction
                    self.embedding_function = OpenAIEmbeddingFunction(
                        api_key=api_key,
                        model_name="text-embedding-3-small",
                    )
                else:
                    # Default local ONNX CPU embedding function for Groq / offline
                    try:
                        from chromadb.utils.embedding_functions import DefaultEmbeddingFunction
                        self.embedding_function = DefaultEmbeddingFunction()
                    except Exception:
                        self.embedding_function = None
            except Exception as e:
                print(f"[InterviewRAG] PersistentClient fallback: {e}")
                self.chroma_available = False

    # ---------------------------------------------------------
    # COLLECTION
    # ---------------------------------------------------------

    def _collection_name(self, interview_id: int) -> str:
        return f"interview_{interview_id}"

    def _get_collection(self, interview_id: int):
        if not self.chroma_available:
            return None
        try:
            kwargs: Dict[str, Any] = {
                "name": self._collection_name(interview_id),
                "metadata": {"hnsw:space": "cosine"}
            }
            if getattr(self, "embedding_function", None) is not None:
                kwargs["embedding_function"] = self.embedding_function

            return self.client.get_or_create_collection(**kwargs)
        except Exception as e:
            print(f"[InterviewRAG] Collection creation warning: {e}")
            return None

    # ---------------------------------------------------------
    # TEXT CLEANING
    # ---------------------------------------------------------

    def clean_text(self, text: str) -> str:
        text = text or ""
        text = text.replace("\r", "\n")
        text = re.sub(r"\n{3,}", "\n\n", text)
        text = re.sub(r"[ \t]+", " ", text)
        return text.strip()

    # ---------------------------------------------------------
    # CHUNKING
    # ---------------------------------------------------------

    def chunk_text(
        self,
        text: str,
        chunk_size: int = 1200,
        overlap: int = 200,
    ) -> List[str]:

        text = self.clean_text(text)

        if not text:
            return []

        chunks = []
        start = 0
        text_length = len(text)

        while start < text_length:
            end = min(start + chunk_size, text_length)
            chunk = text[start:end].strip()

            if chunk:
                chunks.append(chunk)

            if end >= text_length:
                break

            start = max(end - overlap, start + 1)

        return chunks

    # ---------------------------------------------------------
    # INDEX JOB DESCRIPTION (Requirement 3)
    # ---------------------------------------------------------

    def index_job_description(
        self,
        interview_id: int,
        job_description: str,
    ):
        job_description = self.clean_text(job_description)

        if not job_description:
            print(f"[InterviewRAG] WARNING: Empty job description for interview_id={interview_id}")
            return

        chunks = self.chunk_text(job_description)

        # DIAGNOSTIC OUTPUT (Requirement 3)
        print("\n========== RAG INDEX ==========")
        print("Interview ID:", interview_id)
        print("JD length:", len(job_description))
        print("Chunks created:", len(chunks))

        for i, chunk in enumerate(chunks):
            print(f"\nCHUNK {i}:")
            print(chunk[:500])
        print("====================================\n")

        self.memory_store[interview_id] = chunks

        if not self.chroma_available:
            return

        try:
            collection = self._get_collection(interview_id)
            if not collection:
                return

            # Clear previous collection documents for this interview namespace
            try:
                collection.delete(where={"interview_id": str(interview_id)})
            except Exception:
                pass

            ids = []
            documents = []
            metadatas = []

            for index, chunk in enumerate(chunks):
                chunk_hash = hashlib.md5(chunk.encode("utf-8")).hexdigest()
                ids.append(f"{interview_id}_{index}_{chunk_hash}")
                documents.append(chunk)
                metadatas.append(
                    {
                        "interview_id": str(interview_id),
                        "source": "job_description",
                        "chunk_index": index,
                    }
                )

            if documents:
                collection.add(
                    ids=ids,
                    documents=documents,
                    metadatas=metadatas,
                )
                print(f"[InterviewRAG] Indexed {len(documents)} chunks in ChromaDB for interview_{interview_id}")
        except Exception as e:
            print(f"[InterviewRAG] Indexing fallback to memory store: {e}")

    # ---------------------------------------------------------
    # RETRIEVE (Requirement 4)
    # ---------------------------------------------------------

    def retrieve(
        self,
        interview_id: int,
        query: str,
        top_k: int = 5,
    ) -> List[str]:

        chunks = self.memory_store.get(interview_id, [])

        if not self.chroma_available:
            return self._score_memory_chunks(chunks, query, top_k)

        try:
            collection = self._get_collection(interview_id)
            if not collection or collection.count() == 0:
                return self._score_memory_chunks(chunks, query, top_k)

            result = collection.query(
                query_texts=[query],
                n_results=min(top_k, collection.count()),
                where={"interview_id": str(interview_id)},
            )

            documents = result.get("documents", [[]])
            retrieved = documents[0] if documents and documents[0] else []

            if not retrieved and chunks:
                return self._score_memory_chunks(chunks, query, top_k)

            return retrieved

        except Exception as e:
            print(f"[InterviewRAG] Retrieval fallback: {e}")
            return self._score_memory_chunks(chunks, query, top_k)

    def _score_memory_chunks(self, chunks: List[str], query: str, top_k: int) -> List[str]:
        if not chunks:
            return []
        query_words = set(re.findall(r"\w+", query.lower()))
        if not query_words:
            return chunks[:top_k]

        scored = []
        for chunk in chunks:
            chunk_words = set(re.findall(r"\w+", chunk.lower()))
            overlap = len(query_words.intersection(chunk_words))
            scored.append((overlap, chunk))

        scored.sort(key=lambda x: x[0], reverse=True)
        return [chunk for score, chunk in scored[:top_k]]

    # ---------------------------------------------------------
    # CONTEXT BUILDING (Requirement 4)
    # ---------------------------------------------------------

    def build_context(
        self,
        interview_id: int,
        query: str,
        top_k: int = 5,
    ) -> str:

        documents = self.retrieve(
            interview_id,
            query,
            top_k
        )

        if not documents:
            context = "No specific job-description context was retrieved."
        else:
            context = "\n\n".join(
                f"[JD CONTEXT {i + 1}]\n{doc}"
                for i, doc in enumerate(documents)
            )

        # DIAGNOSTIC RETRIEVAL OUTPUT (Requirement 4)
        print("\n========== RAG RETRIEVAL ==========")
        print("Interview ID:", interview_id)
        print("QUERY:")
        print(query)
        print("\nRETRIEVED CONTEXT:")
        print(context)
        print("====================================\n")

        return context
