# Kovrr Vulnerability Risk Dashboard

A full-stack vulnerability risk dashboard that fetches CVE data from the NVD (National Vulnerability Database), calculates risk scores, and displays results.

## Tech Stack

- **Backend:** Node.js, Express, SQLite (better-sqlite3)
- **Frontend:** React 19, TypeScript, Vite, CSS
- **Data Source:** [NVD REST API 2.0](https://services.nvd.nist.gov/rest/json/cves/2.0)

## Setup

### Prerequisites

- Node.js 18+
- npm

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

| Component | Weight | Description |
|-----------|--------|-------------|
| **CVSS Score** | 60% | Base severity from CVSS v3.1/v3.0/v2 |
| **Exploitability** | 20% | NVD exploitability score (0–4 normalized) |
| **Age** | 20% | Days since published (older = higher exposure) |

Formula: `score = (CVSS/10 × 0.6) + (exploitability/4 × 0.2) + (min(1, days/365) × 0.2)` → scaled to 0–100.

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

- Cursor/Claude used for scaffolding, API structure, React components, and CSS
- Manual review and adjustments for risk formula, NVD API structure, and styling
