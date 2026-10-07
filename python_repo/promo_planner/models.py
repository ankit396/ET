from enum import Enum
from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field

class PromotionMechanism(str, Enum):
    PERCENTAGE_OFF = "Percentage Off"
    BUY_ONE_GET_ONE = "Buy One Get One (BOGO)"
    TIERED_BUNDLE = "Tiered Bundle Discount"
    FLASH_SALE = "Flash Sale (Limited Duration)"
    LOYALTY_EXCLUSIVE = "Loyalty Member Exclusive"

class InventoryItem(BaseModel):
    sku: str
    name: str
    category: str
    cost_price: float = Field(..., description="Cost price per unit")
    list_price: float = Field(..., description="Regular selling price")
    current_stock: int = Field(..., description="Current warehouse/store inventory")
    min_safety_stock: int = Field(default=50, description="Minimum stock buffer")
    shelf_life_days: Optional[int] = Field(default=None, description="Expiration/seasonality deadline")
    substitute_skus: List[str] = Field(default_factory=list, description="SKUs that directly substitute this product")
    complementary_skus: List[str] = Field(default_factory=list, description="SKUs frequently purchased together")
    price_elasticity: float = Field(default=-1.8, description="Estimated price elasticity of demand (< -1 is elastic)")

class CompetitorPrice(BaseModel):
    sku: str
    competitor_name: str
    competitor_price: float
    is_promoted: bool = False

class HolidayEvent(BaseModel):
    event_name: str
    regions: List[str]
    start_day: int
    duration_days: int
    demand_multiplier: float = 1.3

class CustomerSegment(BaseModel):
    segment_id: str
    name: str
    share_of_wallet: float
    price_sensitivity: float  # Scale 0.0 to 1.0
    preferred_categories: List[str]

class ParentConstraints(BaseModel):
    min_margin_pct: float = Field(default=15.0, description="Minimum net margin percentage requirement")
    max_marketing_budget: float = Field(default=50000.0, description="Maximum total promo budget allocation")
    inventory_clearance_target_pct: float = Field(default=30.0, description="Target clearance % for overstocked items")
    max_cannibalization_threshold_pct: float = Field(default=12.0, description="Max allowed revenue cannibalization %")

class PromotionDecision(BaseModel):
    sku: str
    product_name: str
    category: str
    mechanism: PromotionMechanism
    recommended_discount_pct: float
    promo_price: float
    duration_days: int
    target_segments: List[str]
    geo_regions: List[str]
    projected_sales_units: int
    projected_revenue: float
    projected_profit: float
    margin_pct: float
    cannibalization_impact_usd: float
    complementary_revenue_boost_usd: float
    stockout_risk_level: str  # "Low", "Medium", "High"
    reasoning: str

class PromotionStrategyPlan(BaseModel):
    plan_id: str
    created_at: str
    parent_constraints: ParentConstraints
    decisions: List[PromotionDecision]
    total_projected_revenue: float
    total_projected_profit: float
    total_marketing_spend: float
    average_margin_pct: float
    total_cannibalization_loss_usd: float
    overall_roi_multiplier: float
    executive_summary: str
    geo_customization_notes: str
    competitor_counter_actions: List[str]

class DailySimState(BaseModel):
    day: int
    sku: str
    units_sold: int
    revenue: float
    profit: float
    remaining_stock: int
    competitor_price_match: bool

class SimulationResult(BaseModel):
    scenario_name: str
    simulation_days: int
    baseline_revenue: float
    promoted_revenue: float
    revenue_uplift_pct: float
    baseline_profit: float
    promoted_profit: float
    profit_uplift_pct: float
    inventory_cleared_units: int
    total_cannibalization_usd: float
    daily_breakdown: List[DailySimState]
