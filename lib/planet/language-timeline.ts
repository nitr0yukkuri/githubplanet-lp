import { languageProfiles, type LanguageProfile } from "./language-catalog";

export type LanguageIndex = number;

export const LANGUAGE_HOLD_RATIO = 0.72;
export const LANGUAGE_TRANSITION_RATIO = 1 - LANGUAGE_HOLD_RATIO;
export const LANGUAGE_DISPLAY_SWITCH_RATIO = 0.5;
export const FINAL_LANGUAGE_SEGMENT_RATIO = 0.6;
export const LANGUAGE_TIMELINE_LENGTH = languageProfiles.length - 1 + FINAL_LANGUAGE_SEGMENT_RATIO;

const clampProgress = (progress: number) => Math.min(1, Math.max(0, progress));

export function languageIndexFromProgress(progress: number): LanguageIndex {
  return languageWindowFromProgress(progress).displayIndex;
}

export function languagePhaseFromProgress(progress: number) {
  return clampProgress(progress) * LANGUAGE_TIMELINE_LENGTH;
}

export type LanguageWindow = {
  phase: number;
  from: LanguageProfile;
  to: LanguageProfile;
  fromIndex: number;
  toIndex: number;
  blend: number;
  localProgress: number;
  isHolding: boolean;
  displayIndex: number;
  afterglowIndex: number;
  afterglow: number;
};

export function languageWindowFromProgress(progress: number): LanguageWindow {
  const phase = languagePhaseFromProgress(progress);
  const fromIndex = Math.min(languageProfiles.length - 1, Math.floor(phase));
  const toIndex = Math.min(languageProfiles.length - 1, fromIndex + 1);
  const isFinalLanguage = fromIndex === languageProfiles.length - 1;
  const localProgress = isFinalLanguage ? 1 : phase - fromIndex;
  const transitionProgress = isFinalLanguage
    ? 0
    : Math.min(1, Math.max(0, (localProgress - LANGUAGE_HOLD_RATIO) / LANGUAGE_TRANSITION_RATIO));
  const afterglowIndex = fromIndex > 0 ? fromIndex - 1 : -1;
  const afterglowProfile = afterglowIndex >= 0 ? languageProfiles[afterglowIndex] : null;
  const afterglow = afterglowProfile && localProgress < afterglowProfile.afterglow
    ? 0.16 * (1 - localProgress / afterglowProfile.afterglow)
    : 0;

  return {
    phase,
    from: languageProfiles[fromIndex],
    to: languageProfiles[toIndex],
    fromIndex,
    toIndex,
    blend: transitionProgress,
    localProgress,
    isHolding: isFinalLanguage || transitionProgress === 0,
    displayIndex: transitionProgress >= LANGUAGE_DISPLAY_SWITCH_RATIO ? toIndex : fromIndex,
    afterglowIndex,
    afterglow,
  };
}

