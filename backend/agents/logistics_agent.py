"""Logistics Agent – Allocates supplies and optimizes delivery routes."""

import random
from agents.base_agent import BaseAgent
from models import AgentRecommendation, InfraStatus


class LogisticsAgent(BaseAgent):
    name = "Logistics Agent"

    def __init__(self):
        super().__init__()
        self.state = {
            "supplies": {"water": 1000, "food": 800, "medical_kits": 200, "blankets": 500},
            "allocated": {},
            "deliveries_pending": 0
        }

    def analyze(self, zones, infrastructure, roads, disaster, other_agent_data=None):
        recommendations = []
        if not disaster:
            return recommendations

        shelters = [i for i in infrastructure if i.type.value == "shelter"]
        high_risk_zones = [z for z in zones if z.risk_score > 40]
        blocked_roads = []

        if other_agent_data and "traffic" in other_agent_data:
            blocked_roads = other_agent_data["traffic"].get("blocked_roads", [])

        # Allocate supplies to shelters near high-risk zones
        for shelter in shelters:
            if shelter.status == InfraStatus.FAILED:
                continue

            nearby_population = 0
            for zone in high_risk_zones:
                dist = ((shelter.lat - zone.center[0])**2 + (shelter.lng - zone.center[1])**2)**0.5
                if dist < 0.02:
                    nearby_population += int(zone.population * zone.risk_score / 100 * 0.3)

            if nearby_population > 0:
                shelter.current_load = min(shelter.capacity, shelter.current_load + nearby_population // 5)
                water_needed = nearby_population * 2
                food_needed = nearby_population * 1.5
                self.state["supplies"]["water"] = max(0, self.state["supplies"]["water"] - int(water_needed * 0.1))
                self.state["supplies"]["food"] = max(0, self.state["supplies"]["food"] - int(food_needed * 0.1))
                self.state["deliveries_pending"] += 1

                if shelter.current_load > shelter.capacity * 0.8:
                    self.log(f"📦 Shelter {shelter.name} at {(shelter.current_load/shelter.capacity)*100:.0f}% capacity")

        # Supply warnings
        for item, qty in self.state["supplies"].items():
            if qty < 100:
                recommendations.append(AgentRecommendation(
                    agent=self.name,
                    action=f"RESUPPLY: {item} critically low ({qty} units remaining)",
                    priority=2,
                    confidence=90,
                    details=f"Request emergency resupply of {item}"
                ))
                self.log(f"📉 {item} supply critically low: {qty} units")

        # Delivery route optimization
        if blocked_roads and self.state["deliveries_pending"] > 0:
            recommendations.append(AgentRecommendation(
                agent=self.name,
                action=f"REROUTE {self.state['deliveries_pending']} supply deliveries around blocked roads",
                priority=2,
                confidence=82,
                details=f"Blocked roads: {len(blocked_roads)}, finding alternate routes"
            ))
            self.log(f"🚛 Rerouting {self.state['deliveries_pending']} deliveries")

        if high_risk_zones:
            recommendations.append(AgentRecommendation(
                agent=self.name,
                action=f"DISTRIBUTE supplies to {len(shelters)} active shelters",
                priority=3,
                confidence=85,
                details=f"Water: {self.state['supplies']['water']}, Food: {self.state['supplies']['food']}, Med kits: {self.state['supplies']['medical_kits']}"
            ))

        return recommendations
