# Contributing to SumaqAgro Web Application

Thank you for contributing to the SumaqAgro Vue web application. This document defines the architecture rules, coding standards and development workflow to keep the codebase consistent while multiple team members work on different bounded contexts.

---

## Table of Contents
1. [Architecture & Design Principles](#architecture--design-principles)
- [Domain-Driven Design (DDD)](#domain-driven-design-ddd)
- [Object-Oriented Programming (OOP) & Clean Code](#object-oriented-programming-oop--clean-code)
2. [Git Workflow & Branching Strategy](#git-workflow--branching-strategy)
3. [Conventional Commits](#conventional-commits)
4. [Semantic Versioning (SemVer)](#semantic-versioning-semver)
5. [Vue & JavaScript Guidelines](#vue--javascript-guidelines)
6. [Fake API & Environments](#fake-api--environments)
7. [Quality Assurance & Development Workflow](#quality-assurance--development-workflow)
8. [Pull Request (PR) Process](#pull-request-pr-process)

---

## Architecture & Design Principles

### Domain-Driven Design (DDD)
The code is organized by bounded context under `src/`. Each context has a clear responsibility and should remain independent from the others.

| Folder | Bounded context | Responsibility |
|---|---|---|
| `shared` | Shared Kernel | Base API, layout shell, route helpers, i18n, demo session and reusable UI pieces. |
| `field-management` | Field Management | Plots, crop campaigns, polygon mapping, ledger and expense tracking. |
| `crop-health` | Crop Health | NDVI/NDWI monitoring, alerts, pest reports, inspections and prescriptions. |
| `profiles` | Profiles | Farmer profile, cooperatives, members and technical staff. |
| `harvest-certification` | Harvest Certification | Harvest batches, quality grades and public certificate verification. |
| `iam` | IAM | Demo access and future authentication/authorization flows. |

Each bounded context follows the same layered structure:

```text
src/
├── <bounded-context>/
│   ├── domain/
│   │   └── model/
│   │       ├── entities/
│   │       ├── value-objects/
│   │       └── enums/
│   ├── application/
│   │   └── <context>.store.js
│   ├── infrastructure/
│   │   ├── <context>-api.js
│   │   ├── *.assembler.js
│   │   └── *.endpoint.js
│   └── presentation/
│       ├── <context>-routes.js
│       ├── views/
│       └── components/
└── shared/
```

Dependency rules between layers:

| Code in… | May import |
|---|---|
| `presentation/views` | Vue, router, Pinia stores, domain model classes and shared presentation components |
| `presentation/components` | Vue, domain entities and shared helpers |
| `application` | `domain`, `infrastructure` |
| `infrastructure` | `domain`, `shared/infrastructure` |
| `domain` | Only `shared/domain` |

Bounded contexts must not call each other’s views or stores directly. When one context needs data from another, its store should consume the other context’s API layer or service abstraction.

### Object-Oriented Programming (OOP) & Clean Code
- **SOLID Principles**: Keep each class focused on a single responsibility, depend on abstractions and avoid mixing UI logic with domain logic.
- **Rich Domain Model**: Business rules belong to entities and value objects, not to Vue views.
- **Encapsulation**: Keep state inside the model and expose behavior methods instead of mutating raw values directly.
- **Value Objects and Enums**: Use small objects and enumerations for constrained values such as categories, statuses and units.
- **Assembler Pattern**: Keep API resources separate from domain entities with explicit mapping logic.
- **Composition over Inheritance**: Prefer reusable services and API layer composition over extending a large base object everywhere.

---

## Git Workflow & Branching Strategy

We follow a simplified Git Flow process for team collaboration.

```text
main ──────────────────────────────────────────●────── (Releases, tagged vX.Y.Z)
         \                                    /
develop ──●─────────●───────────────●────────●──────── (Integration branch)
           \       /                 \      /
feature/    ●─────●                   ●────●           (Feature branches)
```

### Branch Types & Naming Conventions
- `main`: Release-ready code. Only receives `release/*` and `hotfix/*` branches and is tagged with SemVer (`v1.0.0`).
- `develop`: Main integration branch where finished work is merged.
- `feature/<context>-<short-description>`: Feature work, refactors, fixes and documentation from `develop`, merged back to `develop`.
  - Examples: `feature/field-management-dashboard`, `feature/crop-health-map-fix`, `feature/docs-changelog-contributing`
- `release/v<MAJOR.MINOR.PATCH>`: Pre-release branch created from `develop`.
- `hotfix/v<MAJOR.MINOR.PATCH>`: Urgent fix for a released version, created from `main`.

Before starting a branch, update `develop`:

```bash
git checkout develop
git pull origin develop
git checkout -b feature/<context>-<short-description>
```

Every contributor works on their own branch and should avoid committing changes from another context without agreement.

---

## Conventional Commits

Commit messages follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Commit Format

```text
<type>(<scope>): <short summary in imperative mood>

[optional body explaining why the change was made]

[optional footer, such as BREAKING CHANGE]
```

### Commit Types

| Type | Description |
|---|---|
| `feat` | A new feature or user-facing functionality |
| `fix` | A bug fix |
| `docs` | Documentation only (README, CHANGELOG, UML, guides) |
| `style` | Formatting or visual changes that do not alter behavior |
| `refactor` | Code changes that neither fix a bug nor add a feature |
| `perf` | Performance improvements |
| `test` | Adding or updating tests |
| `build` | Dependency or build configuration changes |
| `ci` | CI/CD configuration updates |
| `chore` | Maintenance tasks |

### Allowed Scopes
The scope is the bounded context or area changed: `shared`, `field-management`, `crop-health`, `profiles`, `harvest-certification`, `iam`, `i18n`, `server`, `deps`, `config`, `docs`.

### Examples
- `feat(field-management): add campaign finance dashboard and expense routes`
- `fix(crop-health): correct NDVI map initialization`
- `refactor(shared): split the layout into shell, sidebar and toolbar`
- `chore(server): add crop health collections to the fake api`
- `docs: add changelog and contributing guidelines`

---

## Semantic Versioning (SemVer)

Versions follow [SemVer 2.0.0](https://semver.org/): `MAJOR.MINOR.PATCH`. Every release is described in [`CHANGELOG.md`](CHANGELOG.md).

- **MAJOR (`X.0.0`)**: Breaking changes, such as replacing the fake API contract or restructuring routes or top-level architecture.
- **MINOR (`0.X.0`)**: New backwards-compatible features, such as new views, modules or bounded contexts.
- **PATCH (`0.0.X`)**: Backwards-compatible bug fixes.

---

## Vue & JavaScript Guidelines

- **Use Vue 3 + Vite conventions**: Prefer component composition, `script setup` when appropriate and clear prop/event patterns.
- **Avoid `any`**: Prefer explicit objects, plain JavaScript classes or typed patterns where needed.
- **Naming Conventions**:
  - `PascalCase`: Components, composables and classes (`FieldPlot`, `PageHeader`, `BaseApi`).
  - `camelCase`: Variables, methods and store properties (`selectedPlot`, `loadCampaigns`, `currentUser`).
  - `kebab-case`: Files and folders (`field-registration-form`, `dashboard-layout`).
- **File naming**:
  - `*.store.js` for Pinia stores
  - `*.api.js` for API facades
  - `*.assembler.js` for mapping logic
  - `*.routes.js` for route declarations
  - `*.view.vue` / `*.component.vue` for Vue UI files when applicable
- **Comments**: Short and direct. Use section comments when needed and keep comments focused on behavior or intent.
- **UI text**: Do not hardcode user-facing strings. Add them to the translation files and maintain both Spanish and English versions.

---

## Fake API & Environments

Until the RESTful API is fully implemented, the project uses a local fake API powered by `json-server`:

- `server/db.json` stores the mock collections.
- `server/routes.json` maps `/api/v1/*` to the correct resources.
- Local environment points to `http://localhost:3000/api/v1`.
- Production-like configuration should be defined through environment variables and the shared API base layer.

Rules:

- Do not commit temporary test data created during local exploration unless it is intentional demo data.
- Restore accidental mock data changes with `git restore server/db.json` when necessary.
- When the real backend is ready, only the API URLs and infrastructure layer should need to change; views, stores and domain logic should remain aligned.

---

## Quality Assurance & Development Workflow

### Prerequisites
- Node.js 18+ recommended
- npm 9+

### Development Commands

```bash
# Install dependencies
npm install

# Terminal 1: fake API on http://localhost:3000/api/v1
cd server
sh start.sh

# Terminal 2: app on http://localhost:5173
npm run dev

# Run a production build
npm run build
```

### Validation before opening a PR
Before submitting code, make sure:

- the project still runs with the local fake API;
- the affected views and flows behave correctly in the browser;
- the code follows the bounded context layering rules;
- no temporary debugging code remains;
- the build completes successfully with `npm run build`.

---

## Pull Request (PR) Process

Before merging into `develop`, verify that:

1. [ ] The code respects the DDD layers and dependency rules described above.
2. [ ] Commit messages follow Conventional Commits.
3. [ ] Every new UI text has English and Spanish translations.
4. [ ] The affected user flow was tested locally.
5. [ ] The production build succeeds without errors (`npm run build`).
6. [ ] `server/db.json` contains only intended demo data.
7. [ ] `CHANGELOG.md` is updated when the architecture or features change.
8. [ ] The branch targets `develop` (or `main` for hotfixes).

### PR description template

```markdown
## Summary
Describe the purpose of the change and the business/problem context.

## What changed
- list the key files or bounded contexts affected
- mention new features, fixes or refactors

## Validation
- `npm run build`
- local flow tested in browser
```

---

## License

By contributing to this project, you agree that your contributions will be available under the repository license. See [`LICENSE.md`](LICENSE.md) for details.


