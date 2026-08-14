import { languageProfiles, type LanguageProfile } from "./language-catalog";
import { languageWindowFromProgress, type LanguageWindow } from "./language-timeline";

export type SceneSnapshot = {
  progress: number;
  language: LanguageWindow;
  activeLanguage: LanguageProfile;
  afterglowLanguage: LanguageProfile | null;
};

export type SceneSnapshotRef = { current: SceneSnapshot };

export function sceneSnapshotFromProgress(progress: number): SceneSnapshot {
  const language = languageWindowFromProgress(progress);
  const afterglowLanguage = language.afterglowIndex >= 0
    ? languageProfiles[language.afterglowIndex]
    : null;

  return {
    progress: Math.min(1, Math.max(0, progress)),
    language,
    activeLanguage: languageProfiles[language.displayIndex],
    afterglowLanguage,
  };
}

