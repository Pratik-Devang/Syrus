from agents.base_agent import BaseAgent
from models import AgentRecommendation


class CommandAgent(BaseAgent):
    name = "Command Agent"

    def __init__(self):
        super().__init__()
        self.state = {"action_plan": [], "conflicts_resolved": 0}

    def analyze(self, zones, infrastructure, roads, disaster, other_agent_data=None):
        recommendations = []
        if not disaster:
            return recommendations

        all_recs = []
        if other_agent_data:
            for agent_name, data in other_agent_data.items():
                if "recommendations" in data:
                    all_recs.extend(data["recommendations"])

        if not all_recs:
            return recommendations

        conflict_count = 0
        seen_targets = {}
        resolved_recs = []

        for rec in all_recs:
            if isinstance(rec, dict):
                rec = AgentRecommendation(**rec)

            key = rec.target or rec.action[:30]
            if key in seen_targets:
                existing = seen_targets[key]
                # Keep higher priority (lower number = higher priority)
                if rec.priority < existing.priority:
                    resolved_recs.remove(existing)
                    resolved_recs.append(rec)
                    seen_targets[key] = rec
                    conflict_count += 1
                elif rec.priority == existing.priority and rec.confidence > existing.confidence:
                    resolved_recs.remove(existing)
                    resolved_recs.append(rec)
                    seen_targets[key] = rec
                    conflict_count += 1
            else:
                resolved_recs.append(rec)
                seen_targets[key] = rec

        self.state["conflicts_resolved"] = conflict_count
        if conflict_count > 0:
            self.log(f"🤝 Resolved {conflict_count} inter-agent conflict(s)")

        # Rank top 5 priority actions
        resolved_recs.sort(key=lambda r: (r.priority, -r.confidence))
        top_actions = resolved_recs[:5]
        self.state["action_plan"] = [r.dict() for r in top_actions]

        # Generate final crisis action plan
        overall_risk = sum(z.risk_score for z in zones) / max(len(zones), 1)
        avg_confidence = sum(r.confidence for r in top_actions) / max(len(top_actions), 1)

        recommendations.append(AgentRecommendation(
            agent=self.name,
            action="CRISIS ACTION PLAN UPDATED",
            priority=1,
            confidence=avg_confidence,
            details=f"Overall risk: {overall_risk:.0f}% | {len(top_actions)} priority actions | {conflict_count} conflicts resolved"
        ))

        # Add the top 5 as individual recommendations
        for i, action in enumerate(top_actions):
            recommendations.append(AgentRecommendation(
                agent=self.name,
                action=f"[PRIORITY {i+1}] {action.action}",
                priority=action.priority,
                confidence=action.confidence,
                target=action.target,
                details=f"Source: {action.agent} | {action.details or ''}"
            ))

        self.log(f"📋 Crisis plan updated: {len(top_actions)} priority actions, risk {overall_risk:.0f}%")

        return recommendations
