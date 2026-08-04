from pydantic import BaseModel
from typing import List, Dict

class MonthlyRevenueItem(BaseModel):
    month: str
    revenue: float
    bookings: int

class StatusBreakdownItem(BaseModel):
    status: str
    count: int

class DashboardAnalyticsResponse(BaseModel):
    total_rooms: int
    available_rooms: int
    total_bookings: int
    confirmed_bookings: int
    pending_bookings: int
    completed_bookings: int
    cancelled_bookings: int
    total_revenue: float
    occupancy_rate: float
    total_users: int
    monthly_revenue: List[MonthlyRevenueItem]
    status_breakdown: List[StatusBreakdownItem]
