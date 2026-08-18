import { languageProfiles, type LanguageProfile } from "./language-catalog";
import { languageWindowFromProgress, type LanguageWindow } from "./language-timeline";

export type SceneSnapshot = {
  progress: number;
  language: LanguageWindow;
  activeLanguage: LanguageProfile;
  afterglowLanguage: LanguageProfile | null;
  finalFlightProgress: number;
  phase: "language-worlds" | "content" | "final-flight" | "arrival";
};

export type SceneSnapshotRef = { current: SceneSnapshot };

export function sceneSnapshotFromProgress(
  progress: number,
  finalFlightProgress = 0,
  basePhase: "language-worlds" | "content" = progress < 1 ? "language-worlds" : "content",
): SceneSnapshot {
  const language = languageWindowFromProgress(progress);
  const afterglowLanguage = language.afterglowIndex >= 0
    ? languageProfiles[language.afterglowIndex]
    : null;

  const clampedProgress = Math.min(1, Math.max(0, progress));
  const clampedFinalFlight = Math.min(1, Math.max(0, finalFlightProgress));
  const phase = clampedFinalFlight >= 0.78
    ? "arrival"
    : clampedFinalFlight > 0
      ? "final-flight"
      : clampedProgress < 1
        ? basePhase
        : basePhase;

  return {
    progress: clampedProgress,
    language,
    activeLanguage: languageProfiles[language.displayIndex],
    afterglowLanguage,
    finalFlightProgress: clampedFinalFlight,
    phase,
  };
}
