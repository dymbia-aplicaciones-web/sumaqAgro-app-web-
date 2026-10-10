# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-10-09

First version of the SumaqAgro Vue Web Application, created as a Vue 3 + Vite platform for agricultural management, crop health monitoring and harvest certification.

### Added
- **Application foundation**:
  - Initial Vue 3 + Vite project setup for SumaqAgro.
  - Project structure organized by DDD bounded contexts: `iam`, `field-management`, `crop-health`, `profiles`, `harvest-certification` and `shared`.
  - Base project configuration with `package.json`, environment variables, Vite setup and application entry points.
- **Shared Kernel**:
  - Reusable infrastructure and UI foundations such as base API clients, layout shell, sidebar, toolbar and shared views.
  - Demo session access for farmer, cooperative director and agronomist roles.
  - Internationalization support in Spanish and English.
  - Shared visual system with PrimeVue, PrimeFlex, PrimeIcons and the SumaqAgro color theme.
- **Field Management bounded context**:
  - Plot and crop campaign management.
  - Cadastral and polygon-based field views with map integration using Leaflet.
  - Cost ledger, expense tracking and KPI dashboard.
  - Campaign financial analytics and field registration workflow.
- **Crop Health bounded context**:
  - Satellite observation monitoring with NDVI/NDWI visualization.
  - Agroclimatic alert management, pest reports and technical prescriptions.
  - Field inspections and diagnosis inbox flow.
- **Profiles bounded context**:
  - Farmer profile management, cooperative dashboard and technical advisor views.
  - Cooperative settings and role-based dashboards.
- **Harvest Certification bounded context**:
  - Batch management, quality certificates and traceability flow.
  - Public certificate verification view for QR-based traceability.
- **Mock API and local development**:
  - `json-server` setup with local fake API data and route configuration.
  - Scripts and documentation for local development and build execution.
- **Documentation**:
  - `README.md` with setup, project structure, environment variables and project overview.
  - License file and contribution guidelines for collaborators.

### Changed
- **Architecture**: Organized the app with a domain-driven design structure using context folders and layered modules (`domain`, `application`, `infrastructure`, `presentation`).
- **UI flow**: The application was structured around role-based dashboards and reusable presentation components.
- **Localization**: Added Spanish and English translations for the main application flows and views.

### Removed
- No deprecated production features were removed in the initial version release.

### Fixed
- **Initial implementation**: Stabilized the first release version with the base project architecture, mock API support and responsive application shell.










