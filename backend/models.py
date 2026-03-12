"""Pydantic data models for the Resilience AI simulation."""

from pydantic import BaseModel
from typing import Optional
from enum import Enum


class DisasterType(str, Enum):
    FLOOD = "flood"
    EARTHQUAKE = "earthquake"


class InfrastructureType(str, Enum):
    HOSPITAL = "hospital"
    POWER_STATION = "power_station"
    SHELTER = "shelter"
    ROAD = "road"


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


class AgentRecommendation(BaseModel):
    agent: str
    action: str
    priority: int  # 1=highest
    confidence: float  # 0-100
    target: Optional[str] = None
    details: Optional[str] = None


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
