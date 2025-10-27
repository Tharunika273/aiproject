from __future__ import annotations

from typing import Dict, List
from threading import Lock


class CartStore:
    def __init__(self) -> None:
        self._session_to_items: Dict[str, Dict[str, int]] = {}
        self._lock = Lock()

    def add(self, session_id: str, product_id: str, quantity: int = 1) -> None:
        with self._lock:
            if session_id not in self._session_to_items:
                self._session_to_items[session_id] = {}
            self._session_to_items[session_id][product_id] = (
                self._session_to_items[session_id].get(product_id, 0) + max(1, int(quantity))
            )

    def remove(self, session_id: str, product_id: str) -> None:
        with self._lock:
            if session_id in self._session_to_items and product_id in self._session_to_items[session_id]:
                del self._session_to_items[session_id][product_id]

    def get(self, session_id: str) -> Dict[str, int]:
        with self._lock:
            return dict(self._session_to_items.get(session_id, {}))