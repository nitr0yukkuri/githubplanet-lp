import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the GitHubPlanet landing page shell", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /<title>GitHubPlanet — Your code, in orbit\.<\/title>/i);
  assert.match(html, /class="site-shell"/);
  assert.match(html, /class="planet-canvas"/);
  assert.match(html, /YOUR CODE,/);
  assert.match(html, /IN ORBIT\./);
  assert.match(html, /id="start"/);
  assert.doesNotMatch(html, /FROM ACTIVITY TO ATMOSPHERE|ACTIVITY, MADE VISIBLE|ONE CONNECTION \/ THREE MOVEMENTS/);
  assert.doesNotMatch(html, /Your site is taking shape|react-loading-skeleton|Codex/);
});

test("keeps the source-faithful renderer and smooth-scroll implementation wired", async () => {
  const [page, experience, hero, header, css, packageJson, catalog, timeline, snapshot, scene, spaceEnvironment, variantStore, variant, scroll, planetStage, readout, readme] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/landing/HeroExperience.client.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/landing/HeroSection.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/landing/LandingHeader.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../lib/planet/language-catalog.ts", import.meta.url), "utf8"),
    readFile(new URL("../lib/planet/language-timeline.ts", import.meta.url), "utf8"),
    readFile(new URL("../lib/planet/scene-snapshot.ts", import.meta.url), "utf8"),
    readFile(new URL("../lib/planet/planet-scene.ts", import.meta.url), "utf8"),
    readFile(new URL("../lib/planet/space-environment.ts", import.meta.url), "utf8"),
    readFile(new URL("../lib/planet/planet-variant-store.ts", import.meta.url), "utf8"),
    readFile(new URL("../lib/planet/planet-variant.ts", import.meta.url), "utf8"),
    readFile(new URL("../lib/scroll/use-lenis-scene-progress.ts", import.meta.url), "utf8"),
    readFile(new URL("../components/planet/PlanetStage.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/planet/LanguageReadout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../README.md", import.meta.url), "utf8"),
  ]);

  assert.match(page, /HeroExperience/);
  assert.doesNotMatch(page, /useLenisSceneProgress|useRef|LandingHeader|HeroSection/);
  assert.match(experience, /useLenisSceneProgress/);
  assert.match(experience, /LandingHeader/);
  assert.doesNotMatch(experience, /StorySection|SignalsSection|ProcessSection/);
  assert.match(experience, /FinalCtaSection/);
  assert.doesNotMatch(page, /new THREE\.WebGLRenderer|new Lenis|createMeteor/);
  assert.doesNotMatch(hero, /PlanetStage/);
  assert.match(hero, /LanguageReadout/);
  assert.match(hero, /startAutoPilot/);
  assert.match(hero, /Start automatic language world flight/);
  assert.match(scroll, /AUTO_NAVIGATION_DURATION = 60/);
  assert.match(scroll, /source: "auto-pilot"/);
  assert.match(hero, /href="https:\/\/githubplanet\.dev\/login"/);
  assert.doesNotMatch(hero, /wired-button[^>]*href="#start"/);
  assert.doesNotMatch(header, /progress-rail|progress \* 100/);
  assert.doesNotMatch(css, /progress-rail/);
  for (const language of ["TypeScript", "JavaScript", "Rust", "Go", "CSS", "C++", "Java", "Vue", "Ruby", "Kotlin"]) {
    assert.match(catalog, new RegExp(language.replace("+", "\\+")));
  }
  assert.doesNotMatch(catalog, /label: "C"/);
  assert.match(catalog, /languageProfiles/);
  assert.match(timeline, /from "\.\/language-catalog"/);
  assert.match(timeline, /LANGUAGE_HOLD_RATIO = 0\.72/);
  assert.match(timeline, /export type LanguageIndex = number/);
  assert.match(timeline, /LANGUAGE_TRANSITION_RATIO = 1 - LANGUAGE_HOLD_RATIO/);
  assert.match(timeline, /visualBlend/);
  assert.match(timeline, /isFinalLanguage = fromIndex === languageProfiles\.length - 1/);
  assert.match(timeline, /afterglowIndex = fromIndex > 0 \? fromIndex - 1 : -1/);
  assert.match(timeline, /isHolding: isFinalLanguage \|\| visualBlend === 0/);
  assert.match(timeline, /displayIndex/);
  assert.match(snapshot, /languageWindowFromProgress/);
  assert.match(snapshot, /activeLanguage/);
  assert.match(snapshot, /finalFlightProgress/);
  assert.match(snapshot, /phase/);
  assert.match(experience, /PlanetStage/);
  assert.match(experience, /finalSectionRef/);
  assert.match(experience, /data-scene-phase/);
  const finalCta = await readFile(new URL("../components/landing/FinalCtaSection.tsx", import.meta.url), "utf8");
  assert.match(finalCta, /space-bridge/);
  assert.match(finalCta, /githubplanet\.dev\/login/);
  assert.match(finalCta, /href="https:\/\/githubplanet\.dev\/login"/);
  assert.match(finalCta, /星を誕生させる/);
  assert.match(scene, /new THREE\.WebGLRenderer/);
  assert.match(scene, /planetGroup\.rotation\.z/);
  assert.match(scene, /createMeteor/);
  assert.match(scene, /spawnMeteor\(snapshot\.activeLanguage\)/);
  assert.match(scene, /webglcontextlost/);
  assert.match(scene, /spaceEnvironment\?\.update/);
  assert.match(scene, /spaceEnvironment\?\.dispose/);
  assert.match(scene, /createPlanetVariantStore/);
  assert.match(spaceEnvironment, /COMET_PLUME_VERTEX_SHADER/);
  assert.match(spaceEnvironment, /single-comet-dust-plume/);
  assert.match(spaceEnvironment, /single-comet-ion-plume/);
  assert.match(spaceEnvironment, /single-comet-coma/);
  assert.doesNotMatch(scene, /languageWindowFromProgress|createPlanetVariant\(|setAfterglowOpacity/);
  assert.equal((scene.match(/performance\.now\(\)/g) ?? []).length, 1);
  assert.match(variantStore, /language\.from/);
  assert.match(variantStore, /language\.to/);
  assert.match(variantStore, /language\.visualBlend/);
  assert.match(variantStore, /createPlanetVariant/);
  assert.match(variant, /createRayStarMaterial/);
  assert.match(variant, /afterglowGroup/);
  assert.match(variant, /effectGroup\.add\(typeScriptShell\)/);
  assert.match(variant, /const aura = createAura/);
  assert.match(variant, /effect === "kotlin"\) aura\.material\.toneMapped = false/);
  assert.match(variant, /materialProgramChanged/);
  await assert.rejects(() => access(new URL("../lib/planet/language-effects.ts", import.meta.url)));
  await assert.rejects(() => access(new URL("../lib/planet/language-registry.ts", import.meta.url)));
  for (const effect of ["createCppPlanetLightningMaterial", "createGoPlanetAtmosphere", "createTypeScriptPlanetShell", "createJavaScriptPlanetMaterial", "createRustPlanetDust", "createVueLeafWind", "createRubyPlanetCorona", "createKotlinElectricity"]) {
    assert.match(variant, new RegExp(effect));
  }
  assert.match(scroll, /new Lenis/);
  assert.match(scroll, /scheduleSnapshotPublish/);
  assert.match(scroll, /prefers-reduced-motion/);
  assert.match(planetStage, /snapshotRef/);
  assert.match(planetStage, /import\("\.\.\/\.\.\/lib\/planet\/planet-scene"/);
  assert.match(planetStage, /planet-fallback/);
  assert.match(planetStage, /className="planet"/);
  assert.match(readout, /snapshot/);
  assert.match(readout, /visually-hidden/);
  assert.match(readout, /aria-live="polite"/);
  assert.match(readout, /--language-color/);
  assert.match(readout, /languageWindow\.from/);
  assert.match(readout, /languageWindow\.to/);
  assert.match(readout, /languageWindow\.localProgress/);
  assert.match(css, /\.language-readout-transition/);
  assert.match(css, /\.hero-stage\s*\{[^}]*position:\s*sticky/s);
  assert.match(css, /\.planet-canvas\s*\{/);
  assert.match(css, /\.planet-canvas\.is-unavailable.*planet-fallback/);
  assert.match(css, /overflow:\s*clip/);
  assert.match(spaceEnvironment, /prepareGeometryBounds/);
  assert.doesNotMatch(spaceEnvironment, /frustumCulled\s*=\s*false/);
  assert.match(packageJson, /"three":\s*"\^?0\.160\.0"/);
  assert.match(packageJson, /"lenis":/);
  assert.match(packageJson, /"@types\/three":/);
  assert.match(packageJson, /"@cloudflare\/workers-types":/);
  assert.match(readme, /SceneSnapshot/);
  assert.match(readme, /languageWindowFromProgress/);
  await access(new URL("../public/2k_mars.jpg", import.meta.url));
  for (const file of ["right.webp", "left.webp", "top.webp", "bottom.webp", "front.webp", "back.webp"]) {
    await access(new URL(`../public/skybox/${file}`, import.meta.url));
  }
});
