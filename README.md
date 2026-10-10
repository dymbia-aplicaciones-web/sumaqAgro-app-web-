# SumaqAgro Web Application (`sumaqagro-vue`)

## Overview
SumaqAgro is a Vue 3 + Vite web application for precision agriculture: field plots and cost ledgers, crop health monitoring (NDVI/NDWI, pest reports, inspections and prescriptions), cooperative profiles and quality certification of potato and coffee harvests with QR traceability.

It is the Vue version of the Angular app `sumaqAgro-appweb`, organized with a domain-driven design (DDD) style by bounded context, following the structure of the course example `learning-center`.

## Tech Stack
- Vue 3 (JavaScript)
- Vite
- Pinia
- Vue Router
- Vue I18n (Spanish / English)
- PrimeVue (Material preset with the SumaqAgro colors) + PrimeFlex + PrimeIcons
- Axios
- Leaflet (plot maps) and Chart.js + vue-chartjs (NDVI and cost charts)
- `json-server` for the local Fake API

## Project Structure (DDD-Oriented)
```text
src/
  iam/                          # Demo access (3 user segments), session and route guard
  field-management/             # Plots, campaigns, polygon map, cost ledger and expenses
  crop-health/                  # Satellite monitoring, alerts, pest reports, inspections, prescriptions
  profiles/                     # Farmer profile, cooperative dashboard and settings, technical advisors
  harvest-certification/        # Batch evaluation, quality certificates, QR public verification
  shared/                       # BaseApi, BaseEndpoint, Money, layout, sidebar, toolbar, shared views
  locales/                      # en.json, es.json
  app.vue, main.js, router.js, i18n.js, pinia.js, style.css
```

Each bounded context has the same layers:
```text
<context>/
  domain/model/                 # Entities and value types (plain JavaScript classes)
  application/<context>.store.js  # Pinia store: use cases and UI-facing state
  infrastructure/               # <context>-api.js (BaseApi + BaseEndpoint) and *.assembler.js
  presentation/                 # <context>-routes.js, views/ and components/
```

## User Segments (demo access)
| User | Role | Home page |
|---|---|---|
| Guillermo | Independent farmer | `/field-management/dashboard` |
| Cristian Santana | Cooperative director | `/profiles/cooperative/dashboard` |
| Ing. Juan A. Morales | Agronomist | `/crop-health/inbox` |

The demo access is not a secure sign-in; the RESTful API must enforce authentication and authorization.

## Running the Project

### 1) Install dependencies
```bash
npm install
```

### 2) Start mock API server (`json-server`)
```bash
cd server
sh start.sh
```
Default local API base: `http://localhost:3000/api/v1` (`server/routes.json` maps `/api/v1/*`).

### 3) Start the Vue app
```bash
npm run dev
```

### 4) Build for production
```bash
npm run build
```

## Environment Variables
- `VITE_SUMAQAGRO_PLATFORM_API_URL`: API base URL.
- `VITE_*_ENDPOINT_PATH`: path of each resource (profiles, cooperatives, field plots, crop campaigns, campaign ledgers, satellite observations, alerts, pest reports, inspections, prescriptions, harvest batches, quality certificates).
- `VITE_PRIME_UI_LICENSE_KEY`: free PrimeUI community license key (without it PrimeVue shows an "Invalid PrimeUI License" badge).

## License
See `LICENSE.md`.


