"""
Competitor Price Tracker & Price Matching Engine.
Monitors competitor pricing, calculates price indices, and prevents uncompetitive positioning.
"""

from typing import List, Dict, Optional
from .models import CompetitorPrice, InventoryItem

class CompetitorTracker:
    def __init__(self, competitor_prices: List[CompetitorPrice]):
        self.prices_by_sku: Dict[str, List[CompetitorPrice]] = {}
        for cp in competitor_prices:
            self.prices_by_sku.setdefault(cp.sku, []).append(cp)

    def get_lowest_competitor_price(self, sku: str) -> Optional[float]:
        """Returns the lowest observed competitor price for a SKU."""
        prices = self.prices_by_sku.get(sku, [])
        if not prices:
            return None
        return min(cp.competitor_price for cp in prices)

    def analyze_price_gap(self, item: InventoryItem, proposed_promo_price: float) -> Dict[str, float]:
        """
        Analyzes price gap relative to competitors.
        Calculates Price Index: (Our Price / Competitor Price) * 100
        """
        lowest_comp = self.get_lowest_competitor_price(item.sku)
        if not lowest_comp:
            return {
                "competitor_found": False,
                "lowest_competitor_price": item.list_price,
                "price_index": 100.0,
                "undercut_gap_pct": 0.0
            }

        price_index = (proposed_promo_price / lowest_comp) * 100.0
        gap_pct = ((lowest_comp - proposed_promo_price) / lowest_comp) * 100.0

        return {
            "competitor_found": True,
            "lowest_competitor_price": lowest_comp,
            "price_index": round(price_index, 1),
            "undercut_gap_pct": round(gap_pct, 1)
        }

    def RecommendPriceMatch(self, item: InventoryItem, min_margin_pct: float) -> Optional[float]:
        """
        Recommends a competitive match price while strictly enforcing the parent company minimum margin floor.
        """
        lowest_comp = self.get_lowest_competitor_price(item.sku)
        if not lowest_comp:
            return None

        # Min allowed price given min margin floor
        # Margin % = (Price - Cost) / Price >= min_margin_pct / 100
        # Price * (1 - min_margin_pct / 100) >= Cost => Price >= Cost / (1 - min_margin_pct / 100)
        min_allowed_price = item.cost_price / (1.0 - (min_margin_pct / 100.0))

        # Match competitor price or respect min floor
        matched_price = max(lowest_comp * 0.98, min_allowed_price)
        return round(matched_price, 2)
