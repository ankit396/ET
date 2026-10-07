export interface InventoryItem {
  sku: string;
  name: string;
  category: string;
  cost_price: number;
  list_price: number;
  current_stock: number;
  min_safety_stock: number;
  shelf_life_days?: number;
  substitute_skus?: string[];
  complementary_skus?: string[];
  price_elasticity: number;
}

export interface CompetitorPrice {
  sku: string;
  competitor_name: string;
  competitor_price: number;
  is_promoted: boolean;
}

export interface HolidayEvent {
  event_name: string;
  regions: string[];
  start_day: number;
  duration_days: number;
  demand_multiplier: number;
}

export interface CustomerSegment {
  segment_id: string;
  name: string;
  share_of_wallet: number;
  price_sensitivity: number;
  preferred_categories: string[];
}

export interface ParentConstraints {
  min_margin_pct: number;
  max_marketing_budget: number;
  inventory_clearance_target_pct: number;
  max_cannibalization_threshold_pct: number;
}

export interface PromotionDecision {
  sku: string;
  product_name: string;
  category: string;
  mechanism: string;
  recommended_discount_pct: number;
  promo_price: number;
  duration_days: number;
  target_segments: string[];
  geo_regions: string[];
  projected_sales_units: number;
  projected_revenue: number;
  projected_profit: number;
  margin_pct: number;
  cannibalization_impact_usd: number;
  complementary_revenue_boost_usd: number;
  stockout_risk_level: string;
  reasoning: string;
}

export interface PromotionStrategyPlan {
  plan_id: string;
  created_at: string;
  parent_constraints: ParentConstraints;
  decisions: PromotionDecision[];
  total_projected_revenue: number;
  total_projected_profit: number;
  total_marketing_spend: number;
  average_margin_pct: number;
  total_cannibalization_loss_usd: number;
  overall_roi_multiplier: number;
  executive_summary: string;
  geo_customization_notes: string;
  competitor_counter_actions: string[];
}

export interface DailySimState {
  day: number;
  sku: string;
  units_sold: number;
  revenue: number;
  profit: number;
  remaining_stock: number;
  competitor_price_match: boolean;
}

export interface SimulationResult {
  scenario_name: string;
  simulation_days: number;
  baseline_revenue: number;
  promoted_revenue: number;
  revenue_uplift_pct: number;
  baseline_profit: number;
  promoted_profit: number;
  profit_uplift_pct: number;
  inventory_cleared_units: number;
  total_cannibalization_usd: number;
  daily_breakdown: DailySimState[];
}

export interface RepoFile {
  path: string;
  content: string;
}
