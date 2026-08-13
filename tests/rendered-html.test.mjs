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
  assert.match(html, /id="story"/);
  assert.match(html, /id="signals"/);
  assert.match(html, /id="process"/);
  assert.doesNotMatch(html, /Your site is taking shape|react-loading-skeleton|Codex/);
});

test("keeps the source-faithful renderer and smooth-scroll implementation wired", async () => {
  const [page, css, packageJson, registry, timeline, scene, scroll, planetStage, readout] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../lib/planet/language-registry.ts", import.meta.url), "utf8"),
    readFile(new URL("../lib/planet/language-timeline.ts", import.meta.url), "utf8"),
    readFile(new URL("../lib/planet/planet-scene.ts", import.meta.url), "utf8"),
    readFile(new URL("../lib/scroll/use-lenis-scene-progress.ts", import.meta.url), "utf8"),
    readFile(new URL("../components/planet/PlanetStage.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/planet/LanguageReadout.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(page, /PlanetStage/);
  assert.match(page, /LanguageReadout/);
  assert.match(page, /useLenisSceneProgress/);
  assert.doesNotMatch(page, /new THREE\.WebGLRenderer|new Lenis|createMeteor/);
  for (const language of ["TypeScript", "JavaScript", "Rust", "Go", "CSS", "C++", "Java", "Vue", "Ruby", "Kotlin"]) {
    assert.match(registry, new RegExp(language.replace("+", "\\+")));
  }
  assert.doesNotMatch(registry, /label: "C"/);
  assert.match(registry, /languageProfiles/);
  assert.match(timeline, /LANGUAGE_HOLD_RATIO = 0\.72/);
  assert.match(timeline, /displayIndex/);
  assert.match(scene, /new THREE\.WebGLRenderer/);
  assert.match(scene, /planetGroup\.rotation\.z/);
  assert.match(scene, /createRayStarMaterial/);
  assert.match(scene, /createMeteor/);
  assert.match(scene, /afterglowGroup/);
  assert.match(scene, /setAfterglowOpacity/);
  assert.match(scene, /effectGroup\.add\(variant\.typeScriptShell\)/);
  assert.match(scene, /afterglowGroup\.add\(createAura/);
  for (const effect of ["createCppPlanetLightningMaterial", "createGoPlanetAtmosphere", "createTypeScriptPlanetShell", "createJavaScriptPlanetMaterial", "createRustPlanetDust", "createVueLeafWind", "createRubyPlanetCorona", "createKotlinElectricity"]) {
    assert.match(scene, new RegExp(effect));
  }
  assert.match(scroll, /new Lenis/);
  assert.match(scroll, /prefers-reduced-motion/);
  assert.match(planetStage, /createPlanetScene/);
  assert.match(readout, /languageWindowFromProgress/);
  assert.match(css, /\.hero-stage\s*\{[^}]*position:\s*sticky/s);
  assert.match(css, /\.planet-canvas\s*\{/);
  assert.match(css, /overflow:\s*clip/);
  assert.match(packageJson, /"three":\s*"\^?0\.160\.0"/);
  assert.match(packageJson, /"lenis":/);
  await access(new URL("../public/2k_mars.jpg", import.meta.url));
  for (const file of ["right.webp", "left.webp", "top.webp", "bottom.webp", "front.webp", "back.webp"]) {
    await access(new URL(`../public/skybox/${file}`, import.meta.url));
  }
});
