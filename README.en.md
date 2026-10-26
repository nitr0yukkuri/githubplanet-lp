# GitHubPlanet LP

[日本語](README.md) | [English](README.en.md)

A landing page that presents GitHubPlanet activity as 3D planets, each with a distinct language identity.

> Your code, in orbit.

## Preview

https://githubplanet-orbit.itlogin0606.chatgpt.site

## Production

https://githubplanet-lp.vercel.app

## Current experience

- A fixed-framing 3D planet using a Mars texture and skybox
- A Lenis scrolling experience that transitions between programming-language planet scenes
- Language logos and distinct effects for CSS, C++, Go, TypeScript, JavaScript, Java, Kotlin, Rust, Vue, and Ruby
- Short afterglows when switching languages, stars that follow the planet, and meteors that cross the scene independently
- A static presentation for users who prefer reduced motion
- A 3D flight from the final language planet into space, ending with a CTA that leads to the GitHubPlanet home page
- The arrival CTA hands off to the original GitHubPlanet `/login`; OAuth is not implemented inside this landing page

The planets do not zoom. Camera distance, planet scale, and center position stay fixed so that planetary rotation and the depth of the textures remain the focus.

## Data flow

```text
language-catalog
  ↓
languageWindowFromProgress()
  ↓
sceneSnapshotFromProgress()
  ↓
React language display / Three.js planet variant runtime / final flight
```

`languageWindowFromProgress()` is the single source of truth for language retention, transitions, visibility changes, and afterglows derived from scroll progress. The UI and Three.js share the same `SceneSnapshot`, keeping the timing of logo, text, and planetary-effect changes in sync.

## Architecture

- `app/page.tsx` — route entry point only
- `components/landing/HeroExperience.client.tsx` — Lenis, shared snapshots, and the landing page’s client-side composition
- `components/landing/*` — Header, Hero, final-flight CTA, and Footer presentation
- `lib/planet/language-catalog.ts` — language profiles and logo catalog
- `lib/planet/language-timeline.ts` — pure rules that calculate language transitions from progress
- `lib/planet/scene-snapshot.ts` — display state shared by the UI and Three.js
- `lib/planet/planet-variant.ts` — creation and updates for language-specific materials and effects
- `lib/planet/planet-variant-store.ts` — variant creation, switching, and lifecycle management
- `lib/planet/planet-scene.ts` — Three.js camera, background, planet group, rotation, meteors, and cleanup
- `lib/scroll/use-lenis-scene-progress.ts` — synchronization between Lenis and scroll progress

The final flow uses `finalFlightProgress` from the same `SceneSnapshot`. Once the language display is complete, the camera and planet group move backward together, connecting to CSS multi-layer star parallax and an arrival effect using the original Mars texture. The “create a star” CTA then navigates to `/login`, the authentication entry point in the original GitHubPlanet app. Since the landing page does not handle a GitHub OAuth URL or client secret, `state`, PKCE, callbacks, and sessions stay in the original app.

Locally, the flow uses `http://localhost:3000/login`; in production, it uses `https://githubplanet.dev/login`. The original app’s callback configuration follows that repository’s environment settings.

Material-opacity updates use cached materials and avoid setting `needsUpdate = true` every frame. Frame time is also read only once per frame.

## Assets

The landing page uses these public assets to align with the original GitHubPlanet visual style:

- `public/2k_mars.jpg` — Mars surface texture
- `public/skybox/*` — space background
- `public/language-logos/*` — programming-language logos
- `public/githubplanet-logo.png` — GitHubPlanet logo

The assets were compared with the home/card implementation and actual files under `front/img` in the original GitHubPlanet repository. This landing page reuses the visual language without replacing the original app’s APIs or card screens.

## Run locally

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
```

Validation:

```bash
npm run test
npx tsc --noEmit
npm run lint
```

## Tech stack

- React 19
- TypeScript
- Three.js 0.160
- Lenis
- vinext / Vite
- Tailwind CSS v4
- Cloudflare Workers-compatible output

## License

All rights reserved.
