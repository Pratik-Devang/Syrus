"""Traffic Agent – Computes safest routes, detects road blockages, reroutes vehicles."""

import random
from agents.base_agent import BaseAgent
from models import AgentRecommendation, InfraStatus


class TrafficAgent(BaseAgent):
    name = "Traffic Agent"

    def __init__(self):
        super().__init__()
        self.state = {"blocked_roads": [], "rerouted_vehicles": 0}

    def analyze(self, zones, infrastructure, roads, disaster, other_agent_data=None):
        recommendations = []
        if not disaster:
            return recommendations

        self.state["blocked_roads"] = []
        blocked_count = 0

        for road in roads:
            # Check if road passes through high-risk zones
            road_risk = 0
            for point in road.points:
                for zone in zones:
                    dist = ((point[0] - zone.center[0])**2 + (point[1] - zone.center[1])**2)**0.5
                    if dist < zone.radius / 111000:  # rough degree conversion
                        road_risk = max(road_risk, zone.hazard_intensity)

            if road_risk > 50:
                damage = min(100, road_risk * 0.8 + random.uniform(0, 15))
                road.damage = damage
                if damage > 65:
                    road.blocked = True
                    road.status = InfraStatus.FAILED
                    blocked_count += 1
                    self.state["blocked_roads"].append(road.id)
                    self.log(f"🚧 Road {road.name} BLOCKED (damage: {damage:.0f}%)")
                elif damage > 35:
                    road.status = InfraStatus.DEGRADED
                    self.log(f"⚠️ Road {road.name} degraded (damage: {damage:.0f}%)")
            else:
                road.damage = max(0, road.damage - 5)
                if road.damage < 20:
                    road.blocked = False
                    road.status = InfraStatus.OPERATIONAL

        if blocked_count > 0:
            recommendations.append(AgentRecommendation(
                agent=self.name,
                action=f"REROUTE: {blocked_count} road(s) blocked – activate alternate routes",
                priority=2,
                confidence=88,
                details=f"Blocked roads: {', '.join(self.state['blocked_roads'])}"
            ))

        # Check if blocked roads cut off hospitals
        hospitals = [i for i in infrastructure if i.type.value == "hospital"]
        for hosp in hospitals:
            nearby_blocked = 0
            for road in roads:
                if road.blocked:
                    for point in road.points:
                        dist = ((point[0] - hosp.lat)**2 + (point[1] - hosp.lng)**2)**0.5
                        if dist < 0.01:
                            nearby_blocked += 1
                            break
            if nearby_blocked > 0:
                recommendations.append(AgentRecommendation(
                    agent=self.name,
                    action=f"CRITICAL: Routes to {hosp.name} compromised",
                    priority=1,
                    confidence=92,
                    target=hosp.id,
                    details=f"{nearby_blocked} access road(s) blocked near hospital"
                ))
                self.log(f"🚑 Access to {hosp.name} compromised!")

        return recommendations
