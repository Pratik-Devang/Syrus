"""Weather Agent – Predicts hazard spread and generates risk heatmap."""

import random
from agents.base_agent import BaseAgent
from models import AgentRecommendation, DisasterType


class WeatherAgent(BaseAgent):
    name = "Weather Agent"

    def __init__(self):
        super().__init__()
        self.state = {"wind_speed": 0, "rainfall": 0, "seismic_activity": 0}

    def analyze(self, zones, infrastructure, roads, disaster, other_agent_data=None):
        recommendations = []
        if not disaster:
            return recommendations

        if disaster.type == DisasterType.FLOOD:
            self.state["rainfall"] = disaster.intensity * 0.8 + random.uniform(-5, 10)
            self.state["wind_speed"] = random.uniform(20, 80)
        else:
            self.state["seismic_activity"] = disaster.intensity * 0.9 + random.uniform(-5, 5)

        # Spread hazard to nearby zones
        epicenter = None
        for z in zones:
            if z.id == disaster.epicenter_zone:
                epicenter = z
                break

        if epicenter:
            for zone in zones:
                dist = ((zone.center[0] - epicenter.center[0])**2 + (zone.center[1] - epicenter.center[1])**2)**0.5
                spread_factor = max(0, 1 - dist / 0.05)  # decay over ~5km
                base_intensity = disaster.intensity * spread_factor

                if disaster.type == DisasterType.FLOOD and zone.flood_prone:
                    base_intensity *= 1.4

                zone.hazard_intensity = min(100, base_intensity + random.uniform(-3, 5))
                zone.risk_score = min(100, zone.hazard_intensity * 0.7 + zone.population / 200)

            # Recommendations
            high_risk = [z for z in zones if z.risk_score > 60]
            if high_risk:
                worst = max(high_risk, key=lambda z: z.risk_score)
                recommendations.append(AgentRecommendation(
                    agent=self.name,
                    action=f"EVACUATE zone {worst.name} – risk score {worst.risk_score:.0f}",
                    priority=1,
                    confidence=min(95, worst.risk_score + 10),
                    target=worst.id,
                    details=f"Hazard intensity: {worst.hazard_intensity:.1f}, Population: {worst.population}"
                ))
                self.log(f"🌧️ High risk detected in {worst.name} (score: {worst.risk_score:.0f})")

            if len(high_risk) > 2:
                recommendations.append(AgentRecommendation(
                    agent=self.name,
                    action=f"ALERT: {len(high_risk)} zones above critical risk threshold",
                    priority=2,
                    confidence=85,
                    details=f"Zones: {', '.join(z.name for z in high_risk)}"
                ))
                self.log(f"⚠️ {len(high_risk)} zones above critical risk")

        return recommendations
