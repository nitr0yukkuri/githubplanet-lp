import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import test from "node:test";
import * as ts from "typescript";

async function loadTimelineModules() {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "githubplanet-timeline-"));
  const files = ["language-catalog.ts", "language-timeline.ts", "scene-snapshot.ts"];

  try {
    for (const file of files) {
      const source = await readFile(new URL(`../lib/planet/${file}`, import.meta.url), "utf8");
      const output = ts.transpileModule(source, {
        compilerOptions: {
          module: ts.ModuleKind.ESNext,
          target: ts.ScriptTarget.ES2020,
        },
      }).outputText
        .replaceAll('"./language-catalog"', '"./language-catalog.mjs"')
        .replaceAll('"./language-timeline"', '"./language-timeline.mjs"');
      await writeFile(path.join(tempDir, file.replace(/\.ts$/, ".mjs")), output, "utf8");
    }

    const catalog = await import(`${pathToFileURL(path.join(tempDir, "language-catalog.mjs")).href}?catalog`);
    const timeline = await import(`${pathToFileURL(path.join(tempDir, "language-timeline.mjs")).href}?timeline`);
    const snapshot = await import(`${pathToFileURL(path.join(tempDir, "scene-snapshot.mjs")).href}?snapshot`);
    return { catalog, timeline, snapshot };
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

test("language timeline holds, transitions, and clamps at its boundaries", async () => {
  const { catalog, timeline } = await loadTimelineModules();
  const { languageProfiles } = catalog;
  const { LANGUAGE_HOLD_RATIO, LANGUAGE_TIMELINE_LENGTH, languageWindowFromProgress } = timeline;
  const first = languageWindowFromProgress(0);
  assert.deepEqual(first.from, languageProfiles[0]);
  assert.equal(first.displayIndex, 0);
  assert.equal(first.isHolding, true);
  assert.equal(first.afterglowIndex, -1);

  const holdBoundary = languageWindowFromProgress(LANGUAGE_HOLD_RATIO / LANGUAGE_TIMELINE_LENGTH);
  assert.equal(holdBoundary.fromIndex, 0);
  assert.equal(holdBoundary.blend, 0);
  assert.equal(holdBoundary.isHolding, true);

  const transitionMidpoint = languageWindowFromProgress(0.86 / LANGUAGE_TIMELINE_LENGTH);
  assert.equal(transitionMidpoint.fromIndex, 0);
  assert.equal(transitionMidpoint.displayIndex, 1);
  assert.equal(transitionMidpoint.isHolding, false);

  const nextLanguage = languageWindowFromProgress(1 / LANGUAGE_TIMELINE_LENGTH);
  assert.equal(nextLanguage.fromIndex, 1);
  assert.equal(nextLanguage.displayIndex, 1);
  assert.equal(nextLanguage.afterglowIndex, 0);

  const final = languageWindowFromProgress(1);
  assert.equal(final.fromIndex, languageProfiles.length - 1);
  assert.equal(final.toIndex, languageProfiles.length - 1);
  assert.equal(final.displayIndex, languageProfiles.length - 1);
  assert.equal(final.isHolding, true);
  assert.equal(languageWindowFromProgress(-1).phase, 0);
  assert.equal(languageWindowFromProgress(2).phase, LANGUAGE_TIMELINE_LENGTH);
});

test("scene snapshot exposes one shared language decision", async () => {
  const { snapshot } = await loadTimelineModules();
  const current = snapshot.sceneSnapshotFromProgress(0.5);
  assert.equal(current.activeLanguage, current.language.from === current.activeLanguage
    ? current.language.from
    : current.language.to);
  assert.equal(current.progress, 0.5);
  assert.equal(current.language.displayIndex, current.activeLanguage === current.language.from
    ? current.language.fromIndex
    : current.language.toIndex);
});

