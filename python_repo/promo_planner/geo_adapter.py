"""
Geographic Adaptation & Regional Store Cluster Engine.
Tailors promotion intensity and segment targeting based on geographic nuances and regional calendar events.
"""

from typing import List, Dict
from .models import HolidayEvent

class GeoAdapter:
    DEFAULT_REGIONS = ["North Metro", "South Suburban", "East Tech Hub", "West Coastal", "Central Rural"]

    def __init__(self, holidays: List[HolidayEvent]):
        self.holidays = holidays

    def get_regional_demand_multipliers(self, target_day_start: int, duration_days: int) -> Dict[str, float]:
        """
        Calculates region-specific demand multipliers based on overlapping local holidays/events.
        """
        region_multipliers = {region: 1.0 for region in self.DEFAULT_REGIONS}

        for holiday in self.holidays:
            # Check overlap in days
            holiday_end = holiday.start_day + holiday.duration_days
            target_end = target_day_start + duration_days

            if max(holiday.start_day, target_day_start) < min(holiday_end, target_end):
                # Holiday overlaps with promo period
                for region in holiday.regions:
                    if region == "ALL":
                        for r in region_multipliers:
                            region_multipliers[r] = max(region_multipliers[r], holiday.demand_multiplier)
                    elif region in region_multipliers:
                        region_multipliers[region] = max(region_multipliers[region], holiday.demand_multiplier)

        return region_multipliers

    def customize_regional_targets(self, category: str, region_multipliers: Dict[str, float]) -> List[str]:
        """
        Filters and selects optimal target geographic regions based on demand strength.
        """
        selected_regions = []
        for region, mult in region_multipliers.items():
            if mult >= 1.15:  # High demand boost in this region
                selected_regions.append(f"{region} (High Boost x{mult:.2f})")
            else:
                selected_regions.append(region)
        return selected_regions
