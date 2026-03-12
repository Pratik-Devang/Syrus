"""Power Agent – Predicts grid failure, prioritizes critical facilities, suggests load shedding."""

import random
from agents.base_agent import BaseAgent
from models import AgentRecommendation, InfraStatus


class PowerAgent(BaseAgent):
    name = "Power Agent"

    def __init__(self):
        super().__init__()
        self.state = {"grid_stress": 0, "failed_stations": [], "load_shedding_active": False}

    def analyze(self, zones, infrastructure, roads, disaster, other_agent_data=None):
        recommendations = []
        if not disaster:
            return recommendations

        power_stations = [i for i in infrastructure if i.type.value == "power_station"]
        hospitals = [i for i in infrastructure if i.type.value == "hospital"]
        self.state["failed_stations"] = []

        # Compute grid stress from zone hazard intensity
        total_hazard = sum(z.hazard_intensity for z in zones)
        avg_hazard = total_hazard / max(len(zones), 1)
        self.state["grid_stress"] = min(100, avg_hazard * 1.2 + random.uniform(-5, 10))

        for station in power_stations:
            # Check if station is in a high-risk zone
            station_risk = 0
            for zone in zones:
                dist = ((station.lat - zone.center[0])**2 + (station.lng - zone.center[1])**2)**0.5
                if dist < 0.015:
                    station_risk = max(station_risk, zone.hazard_intensity)

            if station_risk > 55:
                station.damage = min(100, station.damage + station_risk * 0.3 + random.uniform(0, 8))
                if station.damage > 70:
                    station.status = InfraStatus.FAILED
                    self.state["failed_stations"].append(station.id)
                    self.log(f"⚡ {station.name} FAILED (damage: {station.damage:.0f}%)")
                elif station.damage > 40:
                    station.status = InfraStatus.DEGRADED
                    self.log(f"⚠️ {station.name} degraded (damage: {station.damage:.0f}%)")

        # Hospital overload = extra power demand
        overloaded_hosps = []
        if other_agent_data and "medical" in other_agent_data:
            overloaded_hosps = other_agent_data["medical"].get("overloaded_hospitals", [])

        if self.state["failed_stations"]:
            self.state["load_shedding_active"] = True
            recommendations.append(AgentRecommendation(
                agent=self.name,
                action=f"ACTIVATE load shedding – {len(self.state['failed_stations'])} station(s) failed",
                priority=1,
                confidence=92,
                details=f"Grid stress: {self.state['grid_stress']:.0f}%"
            ))

            # Prioritize power to hospitals
            if hospitals:
                recommendations.append(AgentRecommendation(
                    agent=self.name,
                    action="PRIORITIZE power to hospitals and shelters",
                    priority=1,
                    confidence=95,
                    details="Critical facilities must maintain power supply"
                ))
                self.log("🔌 Prioritizing power to critical facilities")

        if self.state["grid_stress"] > 70 and not self.state["failed_stations"]:
            recommendations.append(AgentRecommendation(
                agent=self.name,
                action=f"WARNING: Grid stress at {self.state['grid_stress']:.0f}% – preemptive load reduction recommended",
                priority=2,
                confidence=80,
                details="Reduce non-essential power consumption"
            ))

        if overloaded_hosps:
            recommendations.append(AgentRecommendation(
                agent=self.name,
                action="DEPLOY backup generators to overloaded hospitals",
                priority=1,
                confidence=88,
                details=f"{len(overloaded_hosps)} hospital(s) need backup power"
            ))
            self.log(f"🔋 Requesting generators for {len(overloaded_hosps)} hospitals")

        return recommendations
