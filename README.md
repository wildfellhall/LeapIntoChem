# LeapIntoChem

Science-first, interactive chemistry learning for grades 5–9.

LeapIntoChem turns atomic structure, bonding, reactions, bulk materials, fission, fusion, and stellar evolution into explorable browser experiences. It combines an approachable classroom interface with progressively enhanced Three.js visuals, explicit equations, particle counts, scientific caveats, and optional grade-grouped lessons.

The application is entirely client-side. It has no accounts, database, analytics, advertising, cloud saves, or runtime third-party API dependency.

> **Project status:** the current release candidate passes the complete local deployment audit. That evidence includes 85 randomized molecule quests, 133 atom-balanced reaction scenarios, 43 lessons, all 118 electron configurations, 18 automated WCAG route/viewport audits, 36 school-readiness viewport checks, and native WebGPU rendering checks. A deploying school must still complete its own curriculum, accessibility, privacy, security, hosting, and device review.

## Contents

- [What students can explore](#what-students-can-explore)
- [Scientific modeling approach](#scientific-modeling-approach)
- [Lessons and classroom use](#lessons-and-classroom-use)
- [Technology](#technology)
- [Getting started](#getting-started)
- [Available commands](#available-commands)
- [Project structure](#project-structure)
- [Testing and release quality](#testing-and-release-quality)
- [Deployment](#deployment)
- [Accessibility](#accessibility)
- [Privacy and security](#privacy-and-security)
- [Scientific and instructional limitations](#scientific-and-instructional-limitations)
- [Contributing](#contributing)
- [Preparing a public GitHub repository](#preparing-a-public-github-repository)
- [License](#license)

## What students can explore

| Experience | Route | Grades | What it provides |
| --- | --- | --- | --- |
| Dashboard | `/` | 5–9 | Search and grade filtering across the complete tool collection. |
| Periodic Playground | `#table` | 5–8 | All 118 elements, family coloring, properties, isotope context, electron configurations, and orbital-box views. |
| Atom Studio | `#atom` | 6–9 | Element and isotope controls, counted nucleons, occupied s/p/d/f probability regions, and shell/subshell bookkeeping. |
| Element Link | `#link` | 5–9 | 85 randomly assigned formula quests plus free play, element linking, hints, formula validation, and bulk/particle product views. |
| Bond & Shell Lab | `#bonds` | 6–9 | Fourteen curated covalent, polar-covalent, and ionic cases with shared density, transfer tracers, charges, and valence-shell accounting. |
| Reaction Lab | `#reactions` | 7–9 | 133 balanced scenarios with reactant selection, coefficients, particle regrouping, conditions, products, observations, and safety context. |
| Fusion Frontier | `#fusion` | 8–9 | A stellar observatory and guided tokamak workflow with surface/interior views, representative nuclear pathways, and visible compound/product nuclei. |
| Fission Control | `#fission` | 8–9 | U-235, Pu-239, and U-233 capture, compound deformation, fragment recoil, neutron release, chain control, and reactor decisions. |
| Optional Lessons | `#lessons` | 5–9 | Forty-three grade-grouped lessons with diagrams, worked examples, glossaries, flashcards, practice, reflection, and interactive mini-labs. |

Hash-based routes keep the application compatible with static hosting and allow a specific tool to be linked directly without a server-side router.

### Element Link

Quest Mode does not let students browse or choose an answer target. It assigns a random quest from the 85-mission pool, avoids immediately repeating the completed mission, and prioritizes unfinished work during the open session. The prompt does not reveal the formula; a timed hint can reveal it later.

After completing a substance, students can switch between:

- a modeled bulk-material view intended to communicate the substance's state and appearance; and
- a ball-and-stick, lattice-fragment, or particle-structure view appropriate to the substance.

Extended solids and ionic compounds are described as lattice or formula-unit fragments rather than falsely presented as isolated molecules.

### Fusion and fission

The nuclear tools show the transformation instead of presenting only a flash or a final equation.

- Stellar fusion microscopes animate a representative step from the proton–proton chain, triple-alpha process, or CNO cycle.
- Laboratory fusion supports D–T, a displayed D–D branch, D–helium-3, and proton–boron-11.
- Reactant nuclei merge into a labeled, short-lived compound configuration before balanced products and emissions separate.
- Fission adds the captured neutron to the fissile nucleus, shows the resulting excited compound as a vibrating two-lobed structure with a neck, then displays two labeled representative fragments and three emitted neutrons.
- Space mode includes brown dwarfs, red/orange/yellow/blue-white main-sequence stars, red and blue giants, red and blue supergiants, white dwarfs, Wolf–Rayet stars, and neutron stars/pulsars. Compact remnants do not falsely claim ongoing steady fusion.

## Scientific modeling approach

LeapIntoChem aims for scientifically responsible teaching models rather than decorative atom animations.

### Atomic structure

- Protons and neutrons are individually counted and enclosed by a faint collective nuclear-density boundary.
- Electron visuals use qualitative occupied s, p, d, and f probability-density regions—not planetary electron orbits.
- Radial gaps, angular shapes, shell populations, subshell notation, orbital boxes, and known configuration exceptions are represented in accompanying text and diagrams.
- Animated density shimmer indicates probability density; it does not claim that an electron follows a visible path.

### Bonding and reactions

- Covalent bonds use overlapping electron-density regions and polarity shifts.
- Ionic cases animate whole-electron transfer and show resulting charges and filled-shell bookkeeping.
- Lewis-style ledgers provide duet/octet counts alongside the 3D model.
- Reaction particle scenes conserve every displayed atom and regroup reactants into the stated products.
- Equations, physical states, conditions, appearances, yield/leftover context, and model boundaries remain available as text around the visualization.

### Rendering

The shared renderer progressively selects WebGPU when it is available and falls back to WebGL2 otherwise. The same Three Shading Language (TSL) layer definitions are compiled for the selected backend.

Visual techniques include:

- ACES filmic tone mapping and calibrated exposure;
- physically based materials with clearcoat, transmission, thickness, attenuation, and shape-defining highlights;
- instanced particle and density layers;
- emissive contours and restrained additive energy effects;
- translucent probability and collective-density volumes;
- procedural stellar convection, limb darkening, corona layers, and bloom; and
- responsive device-pixel-ratio limits to balance clarity and classroom-device performance.

These techniques improve visual legibility. They do not turn the experience into a quantitatively exact molecular-dynamics, quantum-mechanics, plasma, fluid, stellar-evolution, or reactor simulation.

## Lessons and classroom use

The optional curriculum contains 43 lessons grouped across grades 5–9 and maps 147 concepts surfaced by the tools. Every lesson includes:

- three measurable learning goals;
- a four-part explanatory reading;
- a concept diagram;
- a stepped worked example;
- a misconception correction;
- a key definition and three-term glossary;
- a guided investigation and reflection prompt;
- three flashcards;
- two explained practice questions;
- authoritative science references; and
- a challenge-based mini-lab derived from the related full tool.

The 17 mini-lab families cover periodic trends, isotopes, formulas, matter and scale, reactions, shells, orbitals, polarity, bonding, equations, energy, fission, reactor control, fusion, tokamaks, and stellar interiors.

Suggested classroom formats include teacher demonstration, paired exploration, learning stations, or individual inquiry. Most tools are designed for approximately 5–25 minutes. The application is formative and does not identify students, save progress, assign grades, or transmit results.

## Technology

- [React](https://react.dev/) 19
- [Vite](https://vite.dev/) 7
- [Three.js](https://threejs.org/) r181
- [React Three Fiber](https://r3f.docs.pmnd.rs/) and [Drei](https://github.com/pmndrs/drei)
- Three Shading Language with WebGPU and WebGL2 fallback backends
- [Framer Motion](https://motion.dev/) for interface transitions
- [Lucide React](https://lucide.dev/) for interface icons
- Tailwind/PostCSS tooling and a custom production spacing/color system
- [Playwright](https://playwright.dev/) and Axe for browser, responsive, accessibility, and rendering audits

The application does not require a backend, API key, database, authentication provider, or environment variable for its current feature set.

## Getting started

### Requirements

- Node.js `^20.19.0` or `>=22.12.0` (the range required by the locked Vite version)
- npm
- A current browser with WebGPU or WebGL2 enabled
- Chromium installed through Playwright if you intend to run the browser audits

For a fresh checkout:

```bash
npm ci
npx playwright install chromium
npm run dev
```

Vite will print the local development URL, normally `http://localhost:5173`.

To test the production bundle locally:

```bash
npm run build
npm run preview
```

Only `dist/` is deployed. Dependencies, browser screenshots, reports, and local build outputs are intentionally excluded by `.gitignore`.

## Available commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server on the local network. |
| `npm run build` | Create the production bundle in `dist/`. |
| `npm run preview` | Serve the production bundle locally. |
| `npm run test:content` | Validate quests, formulas, reactions, lesson coverage, bonding profiles, and all 118 electron configurations. |
| `npm run test:accessibility` | Run automated WCAG 2.2 A/AA checks at desktop and mobile sizes. |
| `npm run test:school-readiness` | Check responsive behavior, privacy/runtime origins, persistence, performance, and production-readiness rules. |
| `npm run test:spacing` | Enforce page gutters, containment, panel rhythm, and lesson density at desktop and phone widths. |
| `npm run test:smoke` | Exercise the dashboard and essential user workflows. |
| `npm run test:fidelity` | Check representative substance, reaction, atom, fusion, and fission outcomes. |
| `npm run test:stellar-types` | Verify all twelve stellar archetypes and their supported fusion/remnant behavior. |
| `npm run test:lessons` | Validate all lessons, required instructional sections, and 17 mini-lab types. |
| `npm run test:bonding` | Check covalent/ionic cases, electron transfer, polarity, and shell accounting. |
| `npm run test:product-views` | Verify bulk/particle toggles, molecular models, ionic lattices, and the standalone microscope route. |
| `npm run test:particles` | Exercise the higher-level particle interaction sequences. |
| `npm run test:nuclear` | Balance and visually verify the supported fusion and fission transformations. |
| `npm run test:webgpu` | Launch a software-backed native WebGPU browser and compile/render representative TSL scenes. |
| `npm run audit:release` | Build and run the complete deployment gate against an isolated preview server. |

Run the complete gate before publishing any release:

```bash
npm run audit:release
```

`audit:release` starts and stops its own isolated preview server. When running an individual browser suite directly, serve the app on its default test port in one terminal:

```bash
npm run dev -- --host 127.0.0.1 --port 4174
```

Then run the desired suite in another terminal, for example `npm run test:nuclear`. Alternatively, point a suite at an existing server by setting `BASE_URL`.

Some Linux environments need Playwright's system packages as well as Chromium:

```bash
npx playwright install --with-deps chromium
```

## Project structure

```text
LeapIntoChem/
├── public/
│   └── _headers                    # Static-host security/cache header template
├── scripts/                        # Content, browser, accessibility, GPU, and release audits
├── src/
│   ├── components/                 # Shared UI, 3D layers, canvases, and mini-labs
│   ├── data/                       # Elements, chemistry, reactions, lessons, and stellar models
│   ├── tools/                      # The eight routed learning experiences
│   ├── App.jsx                     # Hash routing, navigation, lazy loading, and error boundaries
│   ├── index.css                   # Brand system, layout, components, and responsive rules
│   └── main.jsx                    # React application entry point
├── ACCESSIBILITY.md                # Accessibility evidence and required manual pilot
├── PRIVACY.md                      # Current data inventory and change-review triggers
├── SCHOOL_DEPLOYMENT.md            # District-oriented release and approval checklist
├── SECURITY.md                     # Threat surface, headers, operations, and incident guidance
├── Prompt.md                       # Original product brief
├── WebGLDetails.md                 # Original visual-rendering brief
├── package.json                    # Dependencies and executable project commands
└── vite.config.js                  # React plugin and GPU-aware production chunking
```

### Application flow

```text
index.html
  └─ src/main.jsx
      └─ App.jsx (hash route + lazy tool loading)
          ├─ src/tools/*
          ├─ src/components/*
          │   └─ ScientificCanvas (WebGPU → WebGL2 fallback)
          └─ src/data/*
```

`window.render_game_to_text()` exposes concise, route-specific simulation state for automated verification and nonvisual debugging. It is a testing/inspection surface, not an analytics or persistence feature.

## Testing and release quality

The release audit uses a newly built `dist/`, chooses an isolated local port, serves the exact production output, and then runs the complete test sequence. At the time this README was prepared, the final source passed with:

- 85 unique randomized Element Link quests and supported product formulas;
- 133 unique, machine-balanced reaction scenarios;
- 484 formula checks;
- 14 bonding profiles;
- all 118 orbital configurations validated;
- 43 lessons covering 147 mapped concepts and all 17 mini-lab families;
- 18 automated WCAG route/viewport audits with zero violations;
- 36 school-readiness route/viewport audits;
- 18 spacing route/viewport checks and 20 lesson-density checks;
- zero external runtime origins, cookies, local storage, or session storage;
- zero high-severity dependency vulnerabilities;
- proton/neutron conservation across all displayed fusion and fission channels;
- zero mobile overflow in the dedicated lessons, bonding, product, and nuclear checks;
- WebGPU verification of atom, bond, substance, product, reaction, fusion, and fission scenes; and
- zero captured console or page errors.

Automated tests provide repeatable evidence, not certification. See [ACCESSIBILITY.md](ACCESSIBILITY.md) and [SCHOOL_DEPLOYMENT.md](SCHOOL_DEPLOYMENT.md) for the manual work still required before student use.

## Deployment

Build the exact release candidate and run its gate:

```bash
npm ci
npx playwright install chromium
npm run audit:release
```

Deploy only the generated `dist/` directory to a static HTTPS host.

The host should:

1. serve `index.html` at the root while preserving hash routes such as `#link` and `#fusion`;
2. cache hashed files in `dist/assets/` as long-lived immutable assets;
3. revalidate the HTML shell;
4. apply the policies in `public/_headers` or equivalent CDN/server configuration;
5. enforce HTTPS and current TLS configuration; and
6. provide operational logging, access control, rollback, monitoring, contacts, and retention under the deploying organization's policy.

`public/_headers` is a template used by compatible static hosts. GitHub Pages and some other platforms do not apply that file, so equivalent controls must be evaluated at the selected hosting layer.

For a real school deployment, follow the complete [school deployment guide](SCHOOL_DEPLOYMENT.md). It covers hardware pilots, assistive technology, LMS framing, privacy ownership, security contacts, curriculum review, and change control.

## Accessibility

LeapIntoChem targets WCAG 2.2 Level AA and includes:

- semantic landmarks, headings, tabs, status regions, labels, and pressed/selected states;
- a visible-on-focus skip link and clear keyboard focus;
- keyboard/tap alternatives for drag interactions;
- text equations, counts, results, legends, and model caveats around visual canvases;
- route-specific document titles and recoverable error screens;
- reflow down to 320 px without page-level horizontal overflow;
- reduced-motion support;
- text subshell notation and orbital boxes alongside electron-density visuals; and
- textual bond, shell, reaction, fusion, and fission explanations that do not rely only on color or motion.

The 3D canvases do not provide a spatially equivalent tactile or auditory model. A deploying organization must test the exact hosted build with its students' browsers, screen readers, zoom settings, high-contrast/forced-color modes, reduced-motion preferences, alternative inputs, and managed devices. Details are in [ACCESSIBILITY.md](ACCESSIBILITY.md).

## Privacy and security

The current app is deliberately data-minimal:

- no student or teacher accounts;
- no names, email addresses, identifiers, rosters, or education records;
- no cookies, analytics, ads, tracking pixels, or social widgets;
- no local storage, session storage, IndexedDB, or cloud progress;
- no forms, uploads, chat, camera, microphone, location, or files; and
- no runtime request to a third-party domain.

Activity state exists only in memory and disappears when the page is refreshed or closed. Hosting and CDN logs are outside the application and remain the deploying organization's responsibility.

Read [PRIVACY.md](PRIVACY.md) for the complete data inventory and [SECURITY.md](SECURITY.md) for the threat model, response-header template, operational checklist, and incident guidance.

Adding authentication, analytics, crash-reporting SaaS, cloud saves, rosters, gradebooks, messaging, uploads, AI services, advertising, behavioral profiling, cross-site embeds, or LMS data exchange requires a fresh privacy, security, accessibility, and school-procurement review.

## Scientific and instructional limitations

LeapIntoChem is an educational visualization suite—not laboratory equipment, medical or safety guidance, reactor-control software, or a research-grade physical solver.

- Length and time scales are enlarged or compressed so interactions can be seen.
- Colors communicate identity, density, charge, energy, or phase; they are not always literal microscopic colors.
- Electron clouds are qualitative occupied-orbital probability models, not many-electron wavefunction solutions.
- Bond sticks, density envelopes, lattice fragments, and formula-unit models are explanatory representations.
- Bulk substance scenes represent characteristic state and appearance rather than calculating every molecule or crystal defect.
- Reaction scenes show supported, balanced scenarios under the stated conditions; they are not instructions for performing experiments.
- Nuclear pathways visualize selected meaningful steps or representative branches. Fission fragment yields vary in reality, and displayed isotope pairs are labeled as representative possibilities.
- Fusion and stellar evolution are not simulated from first-principles plasma transport or hydrodynamics.
- Reactor controls teach qualitative moderation and chain-reaction concepts; they must never be treated as operating guidance.

Science-content changes should be reviewed by an appropriate subject-matter expert in addition to passing the automated balance and content gates.

## Contributing

Before changing the project, install from the lockfile and confirm the baseline:

```bash
npm ci
npx playwright install chromium
npm run audit:release
```

A practical contribution workflow is:

1. Keep changes scoped and preserve the app's data-minimal architecture.
2. Add or update authoritative science references when introducing new concepts.
3. Keep equations atom-balanced and nuclear transformations nucleon-balanced.
4. Provide text labels, equations, state, counts, and caveats for anything added to a visual scene.
5. Preserve keyboard/tap access and test at 320 px, mobile, laptop, reduced-motion, WebGL2, and WebGPU configurations as relevant.
6. Run the narrow test for the feature while iterating.
7. Run `npm run audit:release` against the finished source before requesting review.
8. Update this README and the relevant policy/deployment document when behavior changes.

Do not add student data collection, external runtime services, new permissions, or persistent storage as an incidental implementation detail. Those changes materially alter the project's risk and approval posture.

## Preparing a public GitHub repository

This tree includes a `.gitignore` for dependencies, production builds, browser captures, reports, environment files, logs, and local editor/operating-system metadata.

Before making it public, the repository owner should:

- choose and add an explicit `LICENSE`;
- add the actual repository URL, owner, maintainers, and support contacts;
- replace policy placeholders with real privacy, accessibility, and security contacts;
- decide whether `Prompt.md`, `WebGLDetails.md`, and `progress.md` should remain public project history;
- add reviewed screenshots or a short demo recording if desired;
- configure branch protection, required reviews, dependency updates, and CI to run `npm run audit:release`;
- configure secret scanning even though the current app needs no secrets;
- verify that generated folders listed in `.gitignore` are not staged;
- review dependency licenses and repository visibility with the owner; and
- rerun the complete audit from a clean checkout before the first release.

Suggested repository topics: `chemistry`, `education`, `react`, `threejs`, `webgpu`, `stem`, `interactive-learning`, `accessibility`, and `vite`.

## License

No license has been selected or included yet. Copyright remains with the project owner under applicable law. Choose and add a `LICENSE` file before inviting reuse or accepting outside contributions; do not assume that public source code is automatically open source.

## Supporting documentation

- [School deployment and approval guide](SCHOOL_DEPLOYMENT.md)
- [Accessibility statement and manual test plan](ACCESSIBILITY.md)
- [Privacy notice and data inventory](PRIVACY.md)
- [Security and operations guide](SECURITY.md)
- [Original product brief](Prompt.md)
- [Original WebGPU/WebGL visual brief](WebGLDetails.md)
- [Implementation history](progress.md)
