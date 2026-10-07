"""
Autonomous Retail Promotion Planner Package.
ET AI Hackathon Problem Statement 3.
"""

from .models import (
    InventoryItem,
    CompetitorPrice,
    HolidayEvent,
    CustomerSegment,
    ParentConstraints,
    PromotionMechanism,
    PromotionDecision,
    PromotionStrategyPlan,
    SimulationResult,
)
from .optimization_engine import OptimizationEngine
from .cannibalization_engine import CannibalizationEngine
from .competitor_tracker import CompetitorTracker
from .geo_adapter import GeoAdapter
from .simulation_engine import SimulationEngine
from .gemini_agent import GeminiAgenticPlanner

__version__ = "1.0.0"
