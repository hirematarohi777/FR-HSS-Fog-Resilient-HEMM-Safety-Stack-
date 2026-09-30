# FR-HSS — Fog-Resilient HEMM Safety Stack

> **SIH 2026 Prototype** · Smart India Hackathon · Problem Statement: Mine Safety Intelligence

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-38bdf8?logo=tailwindcss)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## Overview

**FR-HSS Mobile** is a *simulated* mine-vehicle safety intelligence prototype that fuses five complementary sensing pillars into a single glanceable operator experience — demonstrating how fog-resilient, multi-modal sensing *could* prevent blind-bend collisions in open-cast iron ore mining operations.

> ⚠️ **This is a demonstration prototype.** All telemetry is simulated. No vehicle control, sensor hardware, or production safety infrastructure is connected. Nothing in this app should be interpreted as an operational safety system.

---

## Problem Statement

In open-cast mines, Heavy Earth Moving Machinery (HEMM) — including 150-tonne rear-dump trucks — operate on single-lane haul roads through blind bends and dense fog. Existing systems rely on a single sensing modality (typically vision or acoustic), which fails in poor visibility conditions. The result: **vehicle convergence incidents** that cause fatalities, equipment damage, and operational shutdowns.

**FR-HSS** proposes a *five-pillar fusion approach* that maintains situational awareness even when individual sensors degrade or fail.

---

## Five-Pillar Sensing Architecture

| # | Pillar | Technology | Fog Resilience |
|---|--------|-----------|----------------|
| 1 | **Vision** | Neuromorphic event cameras | Medium — degrades in heavy fog |
| 2 | **Acoustic** | MEMS microphone array + ML | High — sound travels through fog |
| 3 | **Magnetic Navigation** | Buried wire / IMU dead-reckoning | Very High — infrastructure-based |
| 4 | **V2V Communication** | DSRC / 5.9 GHz radio | Very High — penetrates fog |
| 5 | **EBS Status Monitor** | Hardwired brake telemetry readback | N/A — safety system status |

Each pillar reports a **confidence score (0–100%)** and a **state** (`nominal / degraded / alert / offline`). The **Threat Ring** fuses all five into one glanceable arc display.

---

## Threat Ring — Unified Confidence Arc

The centrepiece UI element: a 5-arc SVG ring where each arc segment represents one pillar. Arc fill indicates confidence, arc colour indicates state.

- 🟢 **Green** — Nominal, high confidence  
- 🟠 **Amber** — Degraded or medium confidence  
- 🔴 **Red** — Alert state  
- ⚫ **Grey / Dashed** — Offline  
- 🟣 **Magenta badge** — Sensor disagreement (conflict between pillars)

---

## Scenario: Blind-Bend Convergence Event

The prototype walks through a **10-phase deterministic scenario** — two HEMM dumpers converging at segment B-7 on a single-lane haul road in fog:

| Phase | Event |
|-------|-------|
| 0 | Idle — all systems nominal |
| 1 | Fog onset — Vision confidence drops |
| 2 | Acoustic detects distant engine |
| 3 | Magnetic Nav confirms trajectory |
| 4 | V2V handshake — Dumper-02 detected |
| 5 | V2V sharing — Dumper-02 position shared |
| 6 | **Conflict zone predicted at B-7** |
| 7 | CRITICAL alert generated |
| 8 | Segment B-7 dual-occupancy confirmed |
| 9 | EBS status broadcast |
| 10 | Incident auto-logged, scenario resolves |

---

## Features

### Operator View
- Live **Threat Ring** with per-pillar confidence arcs
- **Mini-map** showing real-time vehicle positions on haul road SVG
- Critical **alert banner** with acknowledgement flow
- Per-pillar detail with bearing, confidence, and state history

### Supervisor View
- **Fleet overview** — all vehicles with mini Threat Rings
- **Segment restriction** — toggle haul road segments (advisory only)
- **Route comparison** — risk-rated alternative paths around conflict zones
- Incident log with supervisor notes

### Admin View
- **System health** dashboard with per-pillar software status
- **Failure simulation** — inject stale V2V, offline vision, sensor disagreement
- **Auto-advance** mode for hands-free 5s-step demonstration
- Full demo state reset

### SOP Assistant
- Keyword-based Q&A for standard operating procedures
- All responses marked **UNAPPROVED DEMONSTRATION CONTENT**
- Not connected to actual NMDC/DGMS approved procedures

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| UI Components | Base UI (shadcn/ui style) |
| State | React Context + localStorage |
| Icons | Lucide React |
| Maps | Custom SVG (no external map API) |

---

## Project Structure

```
fr-hss-mobile/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Login (role selector)
│   │   └── dashboard/
│   │       ├── page.tsx                # Home (Operator/Supervisor/Admin)
│   │       ├── pillars/page.tsx        # Five-Pillar detail + conflict view
│   │       ├── map/page.tsx            # SVG mine map with vehicles
│   │       ├── alerts/page.tsx         # Alert centre + acknowledgement
│   │       ├── fleet/page.tsx          # Supervisor fleet overview
│   │       ├── routes/page.tsx         # Advisory route comparison
│   │       ├── scenario/page.tsx       # 10-step scenario timeline
│   │       ├── incidents/page.tsx      # Incident history + submission
│   │       ├── sop/page.tsx            # SOP assistant chat
│   │       ├── system-health/page.tsx  # System health + failure sim
│   │       ├── profile/page.tsx        # User profile & session
│   │       └── settings/page.tsx       # Auto-advance, reset, prefs
│   ├── components/
│   │   ├── threat-ring.tsx             # Five-arc SVG confidence ring
│   │   ├── pillar-chip.tsx             # Compact pillar status chip
│   │   ├── scenario-controls.tsx       # Floating scenario control FAB
│   │   ├── alert-banner.tsx            # Critical alert banner
│   │   ├── bottom-nav.tsx              # Mobile bottom navigation
│   │   └── sidebar.tsx                 # Desktop sidebar
│   └── lib/
│       ├── types.ts                    # All TypeScript interfaces
│       ├── initial-data.ts             # createInitialState()
│       ├── scenario-engine.ts          # advanceScenario() pure function
│       ├── demo-context.tsx            # React Context + all actions
│       └── utils.ts                    # cn() helper
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Installation

```bash
cd fr-hss-mobile
npm install
```

### Development

```bash
npm run dev
# App available at http://localhost:3000
```

### Demo Users

| Name | Role | Access |
|------|------|--------|
| Ravi Kumar | Operator | Home, Pillars, Map, Alerts, Routes, SOP, Incidents |
| Priya Sharma | Supervisor | + Fleet, System Health |
| Admin User | Admin | + Settings, Failure Simulation, Full Reset |

---

## Safety Disclaimers

This prototype was built for SIH 2026 demonstration purposes only.

- All telemetry values are **SIMULATED** and do not reflect real sensor data
- Acknowledging an alert does **not** resolve any underlying hazard
- Route selections are **advisory only** — they do not authorize vehicle movement
- Segment restrictions are **demo state only** — they do not control mine infrastructure
- EBS status display is **simulated** — the software has no connection to the independent hardwired braking path
- All SOPs shown are **ILLUSTRATIVE / UNAPPROVED DEMONSTRATION CONTENT** and are not approved NMDC or DGMS procedures

---

## Team

**SIH 2026 — Smart India Hackathon**  
Problem Domain: Mine Safety · Track: Software

---

## License

MIT License — See [LICENSE](LICENSE) for details.