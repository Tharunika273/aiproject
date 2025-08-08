from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List, Optional, Tuple
import re
import math
import csv
from pathlib import Path
from collections import Counter, defaultdict


@dataclass
class SearchFilters:
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    category: Optional[str] = None
    brand: Optional[str] = None


class ProductCatalog:
    def __init__(self, csv_path: str) -> None:
        self.rows: List[dict] = []
        self._load_csv(csv_path)
        self._build_index()

    def _load_csv(self, csv_path: str) -> None:
        path = Path(csv_path)
        with path.open(newline='', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                row['id'] = str(row.get('id') or len(self.rows))
                row['name'] = (row.get('name') or '').strip()
                row['category'] = (row.get('category') or '').strip()
                row['brand'] = (row.get('brand') or '').strip()
                try:
                    row['price'] = float(row.get('price') or 0.0)
                except ValueError:
                    row['price'] = 0.0
                try:
                    row['rating'] = float(row.get('rating') or 0.0)
                except ValueError:
                    row['rating'] = 0.0
                row['description'] = (row.get('description') or '').strip()
                row['image_url'] = row.get('image_url') or None
                self.rows.append(row)

    def _tokenize(self, text: str) -> List[str]:
        text = text.lower()
        # keep alphanumerics and spaces
        text = re.sub(r"[^a-z0-9\s]", " ", text)
        tokens = [t for t in text.split() if t]
        return tokens

    def _build_index(self) -> None:
        # Build documents
        docs: List[List[str]] = []
        for r in self.rows:
            full_text = f"{r['name']} {r['category']} {r['brand']} {r['description']}"
            docs.append(self._tokenize(full_text))

        # Document frequencies
        df: Dict[str, int] = defaultdict(int)
        for tokens in docs:
            for term in set(tokens):
                df[term] += 1
        n_docs = len(docs)
        # IDF with smoothing
        self.idf: Dict[str, float] = {
            term: math.log((1 + n_docs) / (1 + freq)) + 1.0 for term, freq in df.items()
        }
        # TF-IDF vectors and norms
        self.doc_vectors: List[Dict[str, float]] = []
        self.doc_norms: List[float] = []
        for tokens in docs:
            tf = Counter(tokens)
            vec: Dict[str, float] = {}
            for term, count in tf.items():
                idf = self.idf.get(term, 0.0)
                vec[term] = (count / max(1, len(tokens))) * idf
            norm = math.sqrt(sum(v * v for v in vec.values())) or 1e-9
            self.doc_vectors.append(vec)
            self.doc_norms.append(norm)

        # Caches for filters
        self._categories = sorted(set(r['category'] for r in self.rows if r['category']))
        self._brands = sorted(set(r['brand'] for r in self.rows if r['brand']))

    def get_product_by_id(self, product_id: str) -> Optional[dict]:
        for r in self.rows:
            if str(r['id']) == str(product_id):
                return r
        return None

    def list_categories(self) -> List[str]:
        return self._categories

    def list_brands(self) -> List[str]:
        return self._brands

    def parse_filters(self, text: str) -> SearchFilters:
        text_lower = text.lower()
        min_price = None
        max_price = None

        m = re.search(r"(under|below)\s*\$?\s*(\d+(?:\.\d{1,2})?)", text_lower)
        if m:
            max_price = float(m.group(2))
        m = re.search(r"(over|above)\s*\$?\s*(\d+(?:\.\d{1,2})?)", text_lower)
        if m:
            min_price = float(m.group(2))
        m = re.search(r"between\s*\$?\s*(\d+(?:\.\d{1,2})?)\s*(and|to)\s*\$?\s*(\d+(?:\.\d{1,2})?)", text_lower)
        if m:
            a = float(m.group(1)); b = float(m.group(3))
            min_price, max_price = (min(a, b), max(a, b))
        m = re.search(r"\$\s*(\d+(?:\.\d{1,2})?)", text_lower)
        if m and min_price is None and max_price is None:
            max_price = float(m.group(1))

        category = None
        for cat in self.list_categories():
            if cat and cat.lower() in text_lower:
                category = cat
                break
        brand = None
        for b in self.list_brands():
            if b and b.lower() in text_lower:
                brand = b
                break

        return SearchFilters(min_price=min_price, max_price=max_price, category=category, brand=brand)

    def _apply_filters(self, indices: List[int], filters: SearchFilters) -> List[int]:
        result: List[int] = []
        for idx in indices:
            row = self.rows[idx]
            price_ok = True
            if filters.min_price is not None and row['price'] < filters.min_price:
                price_ok = False
            if filters.max_price is not None and row['price'] > filters.max_price:
                price_ok = False
            category_ok = True if not filters.category else row['category'].lower() == filters.category.lower()
            brand_ok = True if not filters.brand else row['brand'].lower() == filters.brand.lower()
            if price_ok and category_ok and brand_ok:
                result.append(idx)
        return result

    def _similarity(self, qvec: Dict[str, float], qnorm: float, dvec: Dict[str, float], dnorm: float) -> float:
        if not qvec or not dvec:
            return 0.0
        # iterate over smaller dict
        if len(qvec) > len(dvec):
            qvec, dvec = dvec, qvec
            qnorm, dnorm = dnorm, qnorm
        dot = 0.0
        for term, qv in qvec.items():
            dv = dvec.get(term)
            if dv is not None:
                dot += qv * dv
        return dot / (qnorm * dnorm + 1e-9)

    def search(self, query: str, top_k: int = 5) -> Tuple[List[dict], SearchFilters]:
        filters = self.parse_filters(query)
        if not query.strip():
            # default: top rated, tie-breaker by price asc
            items = sorted(self.rows, key=lambda r: (-r['rating'], r['price']))[:top_k]
            return items, filters

        tokens = self._tokenize(query)
        tf = Counter(tokens)
        qvec: Dict[str, float] = {}
        for term, count in tf.items():
            idf = self.idf.get(term, math.log((1 + len(self.rows)) / 1) + 1.0)
            qvec[term] = (count / max(1, len(tokens))) * idf
        qnorm = math.sqrt(sum(v * v for v in qvec.values())) or 1e-9

        sims: List[Tuple[int, float]] = []
        for i, dvec in enumerate(self.doc_vectors):
            sim = self._similarity(qvec, qnorm, dvec, self.doc_norms[i])
            sims.append((i, sim))
        sims.sort(key=lambda x: x[1], reverse=True)
        ranked_indices = [i for i, _ in sims]

        filtered = self._apply_filters(ranked_indices, filters) or ranked_indices
        top_indices = filtered[:top_k]
        return [self.rows[i] for i in top_indices], filters

    @staticmethod
    def format_products_for_reply(products: List[dict]) -> str:
        lines = []
        for p in products[:3]:
            lines.append(
                f"- {p['name']} — ${p['price']:.2f} ({p['rating']:.1f}★) | {p['brand']} | {p['category']}\n  {p['description'][:160]}..."
            )
        return "\n".join(lines)