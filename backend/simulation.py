"""Disaster Simulation Engine – Tick-based simulation with cascading failures."""

import copy
import random
from datetime import datetime

from models import (
    Zone, Infrastructure, Road, InfrastructureType, InfraStatus,
    DisasterEvent, DisasterType, SimulationState, CascadingEvent,
)
from agents import (
    WeatherAgent, TrafficAgent, MedicalAgent,
    PowerAgent, LogisticsAgent, CommandAgent,
)


def build_city():
    """Build a realistic city layout centered around lat 28.61, lng 77.23 (New Delhi area)."""
    CENTER = [28.6139, 77.2090]

    zones = [
        Zone(id="z1", name="Central District", center=[28.6139, 77.2090], radius=800,
             polygon=[[28.618, 77.204], [28.618, 77.214], [28.610, 77.214], [28.610, 77.204]],
             population=12000, flood_prone=False),
        Zone(id="z2", name="Riverside Zone", center=[28.6200, 77.2200], radius=700,
             polygon=[[28.624, 77.215], [28.624, 77.225], [28.616, 77.225], [28.616, 77.215]],
             population=8000, flood_prone=True),
        Zone(id="z3", name="Industrial Area", center=[28.6050, 77.2300], radius=900,
             polygon=[[28.610, 77.225], [28.610, 77.235], [28.600, 77.235], [28.600, 77.225]],
             population=5000, flood_prone=False),
        Zone(id="z4", name="South Residential", center=[28.6000, 77.2100], radius=750,
             polygon=[[28.604, 77.205], [28.604, 77.215], [28.596, 77.215], [28.596, 77.205]],
             population=15000, flood_prone=True),
        Zone(id="z5", name="North Commercial", center=[28.6280, 77.2000], radius=650,
             polygon=[[28.632, 77.195], [28.632, 77.205], [28.624, 77.205], [28.624, 77.195]],
             population=9000, flood_prone=False),
        Zone(id="z6", name="East Suburbs", center=[28.6150, 77.2400], radius=850,
             polygon=[[28.620, 77.235], [28.620, 77.245], [28.610, 77.245], [28.610, 77.235]],
             population=11000, flood_prone=True),
        Zone(id="z7", name="West Heritage", center=[28.6200, 77.1900], radius=600,
             polygon=[[28.624, 77.185], [28.624, 77.195], [28.616, 77.195], [28.616, 77.185]],
             population=7000, flood_prone=False),
        Zone(id="z8", name="Lake District", center=[28.6300, 77.2300], radius=700,
             polygon=[[28.634, 77.225], [28.634, 77.235], [28.626, 77.235], [28.626, 77.225]],
             population=6000, flood_prone=True),
    ]

    infrastructure = [
        # Hospitals
        Infrastructure(id="h1", name="City General Hospital", type=InfrastructureType.HOSPITAL,
                       lat=28.6150, lng=77.2100, capacity=200),
        Infrastructure(id="h2", name="Riverside Medical Center", type=InfrastructureType.HOSPITAL,
                       lat=28.6210, lng=77.2220, capacity=150),
        Infrastructure(id="h3", name="South Emergency Clinic", type=InfrastructureType.HOSPITAL,
                       lat=28.6010, lng=77.2120, capacity=100),
        # Power Stations
        Infrastructure(id="p1", name="Central Power Grid", type=InfrastructureType.POWER_STATION,
                       lat=28.6080, lng=77.2280, capacity=500),
        Infrastructure(id="p2", name="West Substation", type=InfrastructureType.POWER_STATION,
                       lat=28.6190, lng=77.1920, capacity=300),
        Infrastructure(id="p3", name="North Power Hub", type=InfrastructureType.POWER_STATION,
                       lat=28.6290, lng=77.2020, capacity=400),
        # Shelters
        Infrastructure(id="s1", name="Central Evacuation Shelter", type=InfrastructureType.SHELTER,
                       lat=28.6130, lng=77.2060, capacity=500),
        Infrastructure(id="s2", name="South Community Center", type=InfrastructureType.SHELTER,
                       lat=28.5990, lng=77.2090, capacity=350),
        Infrastructure(id="s3", name="North Stadium Shelter", type=InfrastructureType.SHELTER,
                       lat=28.6300, lng=77.2000, capacity=600),
        Infrastructure(id="s4", name="East School Shelter", type=InfrastructureType.SHELTER,
                       lat=28.6140, lng=77.2380, capacity=250),
    ]

    roads = [
        Road(id="r1", name="Main Highway N-S", points=[
            [28.630, 77.210], [28.625, 77.210], [28.620, 77.210],
            [28.615, 77.210], [28.610, 77.210], [28.605, 77.210], [28.600, 77.210]
        ]),
        Road(id="r2", name="East-West Corridor", points=[
            [28.615, 77.190], [28.615, 77.200], [28.615, 77.210],
            [28.615, 77.220], [28.615, 77.230], [28.615, 77.240]
        ]),
        Road(id="r3", name="Ring Road North", points=[
            [28.628, 77.195], [28.630, 77.205], [28.630, 77.215],
            [28.628, 77.225], [28.625, 77.230]
        ]),
        Road(id="r4", name="Riverside Drive", points=[
            [28.622, 77.215], [28.620, 77.220], [28.618, 77.225],
            [28.616, 77.228], [28.614, 77.232]
        ]),
        Road(id="r5", name="Industrial Connector", points=[
            [28.610, 77.220], [28.608, 77.225], [28.605, 77.228],
            [28.602, 77.230], [28.600, 77.232]
        ]),
        Road(id="r6", name="South Link Road", points=[
            [28.602, 77.205], [28.600, 77.210], [28.598, 77.215]
        ]),
        Road(id="r7", name="Heritage Boulevard", points=[
            [28.622, 77.188], [28.620, 77.192], [28.618, 77.196],
            [28.616, 77.200]
        ]),
    ]

    return zones, infrastructure, roads


class SimulationEngine:
    """Tick-based disaster simulation engine."""

    def __init__(self):
        self.zones, self.infrastructure, self.roads = build_city()
        self.tick = 0
        self.running = False
        self.disaster = None
        self.agents = {
            "weather": WeatherAgent(),
            "traffic": TrafficAgent(),
            "medical": MedicalAgent(),
            "power": PowerAgent(),
            "logistics": LogisticsAgent(),
            "command": CommandAgent(),
        }
        self.recommendations = []
        self.cascading_events = []
        self.agent_logs = []
        self.timeline = []  # history of states

    def start(self, disaster: DisasterEvent):
        """Start a simulation with the given disaster event."""
        self.disaster = disaster
        self.running = True
        self.tick = 0
        # Reset all infrastructure
        for infra in self.infrastructure:
            infra.status = InfraStatus.OPERATIONAL
            infra.damage = 0.0
            infra.current_load = 0
        for road in self.roads:
            road.status = InfraStatus.OPERATIONAL
            road.blocked = False
            road.damage = 0.0
        for zone in self.zones:
            zone.risk_score = 0.0
            zone.hazard_intensity = 0.0
        for agent in self.agents.values():
            agent.logs.clear()
            agent.state = agent.__class__().state
        self.recommendations = []
        self.cascading_events = []
        self.agent_logs = []
        self.timeline = []

    def step(self) -> SimulationState:
        """Run one simulation tick."""
        if not self.running or not self.disaster:
            return self.get_state()

        self.tick += 1

        # Gradually increase disaster intensity over time
        if self.disaster.intensity < 95:
            self.disaster.intensity = min(100, self.disaster.intensity + random.uniform(0.5, 2.5))

        # 1. Weather Agent – updates zone hazard intensities
        weather_recs = self.agents["weather"].analyze(
            self.zones, self.infrastructure, self.roads, self.disaster
        )

        # 2. Traffic Agent – updates road statuses
        traffic_recs = self.agents["traffic"].analyze(
            self.zones, self.infrastructure, self.roads, self.disaster
        )

        # 3. Medical Agent – uses traffic data
        medical_recs = self.agents["medical"].analyze(
            self.zones, self.infrastructure, self.roads, self.disaster,
            other_agent_data={"traffic": self.agents["traffic"].state}
        )

        # 4. Power Agent – uses medical data
        power_recs = self.agents["power"].analyze(
            self.zones, self.infrastructure, self.roads, self.disaster,
            other_agent_data={"medical": self.agents["medical"].state}
        )

        # 5. Logistics Agent – uses traffic data
        logistics_recs = self.agents["logistics"].analyze(
            self.zones, self.infrastructure, self.roads, self.disaster,
            other_agent_data={"traffic": self.agents["traffic"].state}
        )

        # 6. Command Agent – aggregates all
        all_agent_data = {
            "weather": {"recommendations": [r.dict() for r in weather_recs], **self.agents["weather"].state},
            "traffic": {"recommendations": [r.dict() for r in traffic_recs], **self.agents["traffic"].state},
            "medical": {"recommendations": [r.dict() for r in medical_recs], **self.agents["medical"].state},
            "power": {"recommendations": [r.dict() for r in power_recs], **self.agents["power"].state},
            "logistics": {"recommendations": [r.dict() for r in logistics_recs], **self.agents["logistics"].state},
        }
        command_recs = self.agents["command"].analyze(
            self.zones, self.infrastructure, self.roads, self.disaster,
            other_agent_data=all_agent_data
        )

        # Merge recommendations
        self.recommendations = weather_recs + traffic_recs + medical_recs + power_recs + logistics_recs + command_recs

        # Collect agent logs
        for agent in self.agents.values():
            for log in agent.get_logs():
                log["tick"] = self.tick
                log["timestamp"] = datetime.now().isoformat()
                self.agent_logs.append(log)

        # Keep only last 50 logs
        if len(self.agent_logs) > 50:
            self.agent_logs = self.agent_logs[-50:]

        # Build cascading events
        self.cascading_events = self._compute_cascading_events()

        state = self.get_state()
        self.timeline.append(state.dict())
        if len(self.timeline) > 60:
            self.timeline = self.timeline[-60:]

        return state

    def _compute_cascading_events(self) -> list[CascadingEvent]:
        """Determine the cascading failure chain."""
        events = []
        step = 1

        # Check if disaster causes road blockage
        blocked_roads = [r for r in self.roads if r.blocked]
        if blocked_roads:
            events.append(CascadingEvent(
                step=step,
                source=self.disaster.type.value.title(),
                target="Road Network",
                description=f"{len(blocked_roads)} road(s) blocked by {self.disaster.type.value}",
                icon="🌊" if self.disaster.type == DisasterType.FLOOD else "🌍"
            ))
            step += 1

            # Blocked roads → ambulance delay
            events.append(CascadingEvent(
                step=step,
                source="Road Blockage",
                target="Emergency Response",
                description="Ambulance routes compromised – response time increased",
                icon="🚧"
            ))
            step += 1

        # Hospital overload
        overloaded = [i for i in self.infrastructure
                      if i.type == InfrastructureType.HOSPITAL and i.current_load > i.capacity]
        if overloaded:
            events.append(CascadingEvent(
                step=step,
                source="Emergency Response" if blocked_roads else "Casualty Surge",
                target="Hospital System",
                description=f"{len(overloaded)} hospital(s) over capacity",
                icon="🏥"
            ))
            step += 1

        # Power strain
        failed_stations = [i for i in self.infrastructure
                           if i.type == InfrastructureType.POWER_STATION and i.status == InfraStatus.FAILED]
        if failed_stations or (overloaded and self.agents["power"].state.get("grid_stress", 0) > 60):
            events.append(CascadingEvent(
                step=step,
                source="Hospital Overload" if overloaded else "Infrastructure Damage",
                target="Power Grid",
                description=f"Grid stress at {self.agents['power'].state.get('grid_stress', 0):.0f}%"
                            + (f", {len(failed_stations)} station(s) failed" if failed_stations else ""),
                icon="⚡"
            ))
            step += 1

        # Supply chain disruption
        if blocked_roads and self.agents["logistics"].state.get("deliveries_pending", 0) > 0:
            events.append(CascadingEvent(
                step=step,
                source="Road Blockage",
                target="Supply Chain",
                description="Supply deliveries delayed – shelters at risk",
                icon="📦"
            ))

        return events

    def get_state(self) -> SimulationState:
        """Get current simulation state."""
        overall_risk = sum(z.risk_score for z in self.zones) / max(len(self.zones), 1)
        return SimulationState(
            tick=self.tick,
            running=self.running,
            disaster=self.disaster,
            zones=self.zones,
            infrastructure=self.infrastructure,
            roads=self.roads,
            recommendations=self.recommendations,
            cascading_events=self.cascading_events,
            agent_logs=self.agent_logs,
            overall_risk=overall_risk,
            timestamp=datetime.now().isoformat(),
        )

    def get_timeline(self):
        """Get simulation timeline for playback."""
        return self.timeline

    def run_whatif(self, intervention) -> dict:
        """Run a what-if scenario by cloning state, applying intervention, and comparing."""
        # Snapshot 'before'
        before_state = self.get_state().dict()
        before_risk = before_state["overall_risk"]
        before_infra = {i["id"]: i["status"] for i in before_state["infrastructure"]}

        # Clone and apply intervention
        zones_copy = [z.model_copy(deep=True) for z in self.zones]
        infra_copy = [i.model_copy(deep=True) for i in self.infrastructure]
        roads_copy = [r.model_copy(deep=True) for r in self.roads]

        if intervention.action == "add_ambulances":
            for infra in infra_copy:
                if infra.type == InfrastructureType.HOSPITAL:
                    infra.capacity += intervention.amount * 20
                    infra.current_load = max(0, infra.current_load - intervention.amount * 10)
                    if infra.current_load <= infra.capacity:
                        infra.status = InfraStatus.OPERATIONAL

        elif intervention.action == "deploy_generator":
            for infra in infra_copy:
                if infra.type == InfrastructureType.POWER_STATION:
                    infra.damage = max(0, infra.damage - intervention.amount * 25)
                    if infra.damage < 40:
                        infra.status = InfraStatus.OPERATIONAL
                    elif infra.damage < 70:
                        infra.status = InfraStatus.DEGRADED
            for infra in infra_copy:
                if infra.type == InfrastructureType.HOSPITAL and intervention.target_zone:
                    infra.damage = max(0, infra.damage - 10)

        elif intervention.action == "open_shelter":
            new_shelter = Infrastructure(
                id=f"s_new_{random.randint(100,999)}",
                name=f"Emergency Shelter (Deployed)",
                type=InfrastructureType.SHELTER,
                lat=28.612 + random.uniform(-0.005, 0.005),
                lng=77.215 + random.uniform(-0.005, 0.005),
                capacity=intervention.amount * 200,
            )
            infra_copy.append(new_shelter)

        # Compute after metrics
        after_risk = sum(z.risk_score * 0.85 for z in zones_copy) / max(len(zones_copy), 1)
        after_infra = {}
        for i in infra_copy:
            after_infra[i.id] = i.status.value

        return {
            "before": {
                "overall_risk": round(before_risk, 1),
                "infrastructure_status": before_infra,
                "hospital_capacity": sum(
                    i.capacity for i in self.infrastructure if i.type == InfrastructureType.HOSPITAL
                ),
            },
            "after": {
                "overall_risk": round(after_risk, 1),
                "infrastructure_status": after_infra,
                "hospital_capacity": sum(
                    i.capacity for i in infra_copy if i.type == InfrastructureType.HOSPITAL
                ),
            },
            "improvement": {
                "risk_reduction": round(before_risk - after_risk, 1),
                "intervention": intervention.action,
                "amount": intervention.amount,
            }
        }
