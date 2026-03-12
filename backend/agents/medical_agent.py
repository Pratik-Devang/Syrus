
import random
from agents.base_agent import BaseAgent
from models import AgentRecommendation, InfraStatus


class MedicalAgent(BaseAgent):
    name = "Medical Agent"

    def __init__(self):
        super().__init__()
        self.state = {"total_injured": 0, "triaged": 0, "overloaded_hospitals": []}

    def analyze(self, zones, infrastructure, roads, disaster, other_agent_data=None):
        recommendations = []
        if not disaster:
            return recommendations

        hospitals = [i for i in infrastructure if i.type.value == "hospital"]
        self.state["overloaded_hospitals"] = []

        # Estimate injured from high-risk zones
        total_injured = 0
        for zone in zones:
            if zone.risk_score > 30:
                injured = int(zone.population * (zone.risk_score / 100) * 0.15 + random.uniform(0, 10))
                total_injured += injured

        self.state["total_injured"] = total_injured
        self.state["triaged"] = int(total_injured * 0.7)

        # Distribute injured to hospitals
        if total_injured > 0 and hospitals:
            per_hospital = total_injured // max(len(hospitals), 1)
            for hosp in hospitals:
                if hosp.status == InfraStatus.FAILED:
                    hosp.current_load = 0
                    continue

                incoming = per_hospital + random.randint(-5, 10)
                hosp.current_load = min(hosp.capacity * 2, hosp.current_load + max(0, incoming))
                load_pct = (hosp.current_load / hosp.capacity) * 100

                if load_pct > 100:
                    hosp.status = InfraStatus.DEGRADED
                    self.state["overloaded_hospitals"].append(hosp.id)
                    hosp.damage = min(100, hosp.damage + 5)
                    self.log(f"🏥 {hosp.name} OVERLOADED at {load_pct:.0f}% capacity")

                    recommendations.append(AgentRecommendation(
                        agent=self.name,
                        action=f"REDIRECT patients from {hosp.name} ({load_pct:.0f}% capacity)",
                        priority=1,
                        confidence=90,
                        target=hosp.id,
                        details=f"Current load: {hosp.current_load}/{hosp.capacity}"
                    ))
                elif load_pct > 70:
                    self.log(f"⚠️ {hosp.name} approaching capacity ({load_pct:.0f}%)")

        if total_injured > 50:
            recommendations.append(AgentRecommendation(
                agent=self.name,
                action=f"DEPLOY field medical units – {total_injured} estimated casualties",
                priority=1,
                confidence=85,
                details=f"Triaged: {self.state['triaged']}, Pending: {total_injured - self.state['triaged']}"
            ))
            self.log(f"🚨 {total_injured} estimated casualties across affected zones")

        # Check if blocked roads affect hospital access
        if other_agent_data and "traffic" in other_agent_data:
            blocked = other_agent_data["traffic"].get("blocked_roads", [])
            if blocked:
                recommendations.append(AgentRecommendation(
                    agent=self.name,
                    action="REQUEST air medical transport – ground routes compromised",
                    priority=2,
                    confidence=78,
                    details=f"Road blockages affecting ambulance routes"
                ))

        return recommendations
