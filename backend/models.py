"""Pydantic data models for the Resilience AI simulation."""

from pydantic import BaseModel
from typing import Optional
from enum import Enum


class DisasterType(str, Enum):
    FLOOD = "flood"
    EARTHQUAKE = "earthquake"
    CYCLONE = "cyclone"
    GRID_FAILURE = "grid_failure"


class InfrastructureType(str, Enum):
    HOSPITAL = "hospital"
    POWER_STATION = "power_station"
    SHELTER = "shelter"
    ROAD = "road"
    FIRE_STATION = "fire_station"
    POLICE_STATION = "police_station"
    METRO_STATION = "metro_station"
    COMMUNICATIONS = "communications"
    WATER_PUMP = "water_pump"


class InfraStatus(str, Enum):
    OPERATIONAL = "operational"
    DEGRADED = "degraded"
    FAILED = "failed"


class Infrastructure(BaseModel):
    id: str
    name: str
    type: InfrastructureType
    lat: float
    lng: float
    status: InfraStatus = InfraStatus.OPERATIONAL
    capacity: int = 100
    current_load: int = 0
    damage: float = 0.0  # 0-100


class Road(BaseModel):
    id: str
    name: str
    points: list[list[float]]  # [[lat, lng], ...]
    status: InfraStatus = InfraStatus.OPERATIONAL
    blocked: bool = False
    damage: float = 0.0


class Zone(BaseModel):
    id: str
    name: str
    center: list[float]  # [lat, lng]
    radius: float  # meters
    polygon: list[list[float]]  # [[lat, lng], ...]
    risk_score: float = 0.0  # 0-100
    population: int = 0
    flood_prone: bool = False
    hazard_intensity: float = 0.0


class DisasterEvent(BaseModel):
    type: DisasterType
    epicenter_zone: str  # zone id
    intensity: float = 70.0  # 0-100
    lat: Optional[float] = None
    lng: Optional[float] = None


class UrgencyLevel(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class AgentRecommendation(BaseModel):
    agent: str
    action: str                           # Imperative verb phrase: what to do
    reason: str                           # Why this action is needed
    affected_zone: Optional[str] = None   # Which district(s) are affected
    confidence: float = 75.0             # 0-100 confidence score
    urgency: UrgencyLevel = UrgencyLevel.MEDIUM  # critical / high / medium / low
    expected_impact: Optional[str] = None  # Quantified expected outcome
    priority: int = 2                    # 1=highest, used for sorting
    target: Optional[str] = None         # Specific infra node ID if applicable


class CascadingEvent(BaseModel):
    step: int
    source: str
    target: str
    description: str
    icon: str = "⚠️"


class WhatIfIntervention(BaseModel):
    action: str  # "add_ambulances", "deploy_generator", "open_shelter"
    target_zone: Optional[str] = None
    amount: int = 1


class SimulationState(BaseModel):
    tick: int = 0
    running: bool = False
    disaster: Optional[DisasterEvent] = None
    zones: list[Zone] = []
    infrastructure: list[Infrastructure] = []
    roads: list[Road] = []
    recommendations: list[AgentRecommendation] = []
    cascading_events: list[CascadingEvent] = []
    agent_logs: list[dict] = []
    overall_risk: float = 0.0
    timestamp: str = ""
