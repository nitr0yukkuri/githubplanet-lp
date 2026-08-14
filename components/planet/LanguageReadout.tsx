import type { CSSProperties } from "react";
import type { SceneSnapshot } from "../../lib/planet/scene-snapshot";

type LanguageReadoutProps = {
  snapshot: SceneSnapshot;
};

export function LanguageReadout({ snapshot }: LanguageReadoutProps) {
  const languageWindow = snapshot.language;
  const languageIndex = languageWindow.displayIndex;
  const activeLanguage = snapshot.activeLanguage;

  return (
    <div className="language-readout" aria-live="polite">
      <div className="language-readout-index">PLANET / {String(languageIndex + 1).padStart(2, "0")} 窶・HOLD TO OBSERVE</div>
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

