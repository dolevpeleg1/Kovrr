# Kovrr Vulnerability Risk Dashboard

A full-stack vulnerability risk dashboard that fetches CVE data from the NVD (National Vulnerability Database), calculates risk scores, and displays results.

## Tech Stack

- **Backend:** Node.js, Express, SQLite (better-sqlite3)
- **Frontend:** React 19, TypeScript, Vite, CSS
- **Data Source:** [NVD REST API 2.0](https://services.nvd.nist.gov/rest/json/cves/2.0)

### Prerequisites

- Node.js 18+
- npm

## Setup

### Quick Start (recommended)

From the project root:

```bash
npm install      # installs backend + frontend
npm run dev      # starts backend and frontend together
```

- Backend: `http://localhost:3001`
- Frontend: `http://localhost:5173`

### Backend

```bash
cd backend
npm install
npm start
```

Backend runs at `http://localhost:3001`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173` and proxies `/api` to the backend.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/vulnerabilities` | List vulnerabilities. Query: `?severity=HIGH` |
| GET | `/api/vulnerabilities/:id` | Single CVE details |
| GET | `/api/stats` | Count by severity, top vendors |
| POST | `/api/sync` | Re-fetch from NVD API |

## Risk Score Formula (0–100)
| **CVSS Score** | 60% | Base severity from CVSS v3.1/v3.0/v2
| **Exploitability** | 20% | NVD exploitability score
| **Age** | 20% | Days since published (older = higher exposure)

Each component is first normalized to 0–1 so they use the same scale:
- **CVSS** (0–10) → divided by 10
- **Exploitability** (0–4) → divided by 4
- **Age** (0–365 days) → `min(1, days / 365)`

The weighted sum `(cvss × 0.6) + (exploitability × 0.2) + (age × 0.2)` is between 0 and 1. Multiplying by 100 converts this to the final 0–100 risk score.

**Invalid data handling:** Each component and the final score are clamped to valid ranges. CVSS and exploitability are clamped to 0–1; age clamps negative values (e.g. future dates) to 0 and caps at 1 for 365+ days; the final score is clamped to 0–100. This ensures malformed or unexpected NVD data never produces out-of-range scores.

## Frontend Features

- **Vulnerability Table:** CVE ID, Description, Severity, Risk Score, Date
- **Sortable** by Risk Score
- **Filterable** by Severity (ALL, CRITICAL, HIGH, MEDIUM, LOW, UNKNOWN)
- **Risk Score Indicator:** Color-coded Green (0–30), Yellow (31–60), Orange (61–80), Red (81–100)
- **Stats Panel:** Severity breakdown, Top vendors
- **Detail View:** Single CVE details via `/vulnerability/:id`

## Tests

```bash
cd backend
npm test
```

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── index.js
│   │   ├── routes/
│   │   └── services/
│   ├── data/           # SQLite DB (auto-created)
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── api.ts
│   │   └── App.css
│   └── package.json
└── README.md
```

## AI Usage

- Cursor/Claude used for scaffolding, API structure, React components, CSS, and README template.

**Manual Adjustments Made by Me:** 
- Manual review and adjustments for risk formula, NVD API structure, and styling
- Manually added unit tests for risk score edge cases (lower bound, upper bound, mid-range) and invalid/negative value clamping
- Adjusted the AI generated scripts to add a root quick-start script (`npm install`, `npm run dev`) to install and run backend + frontend together in order to simplify running the project
- Aligned the frontend look and feel (colors, header pattern, typography, favicon) with the public Kovrr website for a closer visual match


## Tradeoffs

- I did not use official Kovrr assets nor violate any copyrights while styling the frontend. I tried to use the official Kovrr website for inspiration and used it as a template only.
- I only used 20 data entries to maintain efficiency while also demoing the app functionality. For official implementation, I would still use 20 entries per page, but I would add more pages.
