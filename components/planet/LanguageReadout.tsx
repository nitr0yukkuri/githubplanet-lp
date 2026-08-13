import type { CSSProperties } from "react";
import { languageProfiles } from "../../lib/planet/language-registry";
import { languageWindowFromProgress } from "../../lib/planet/language-timeline";

type LanguageReadoutProps = {
  progress: number;
};

export function LanguageReadout({ progress }: LanguageReadoutProps) {
  const languageWindow = languageWindowFromProgress(progress);
  const languageIndex = languageWindow.displayIndex;
  const activeLanguage = languageProfiles[languageIndex];

  return (
    <div className="language-readout" aria-live="polite">
      <div className="language-readout-index">PLANET / {String(languageIndex + 1).padStart(2, "0")} — HOLD TO OBSERVE</div>
      <div className="language-readout-main">
        <span className="language-logo" style={{ "--language-color": activeLanguage.color } as CSSProperties}>
          <img className="language-logo-image" src={activeLanguage.logo} alt={`${activeLanguage.label} logo`} />
        </span>
        <div><strong>{activeLanguage.label}</strong><span>{activeLanguage.family}</span></div>
      </div>
      <p>{activeLanguage.tagline}</p>
      <div className="language-progress"><span style={{ width: `${languageWindow.localProgress * 100}%` }} /></div>
    </div>
  );
}
