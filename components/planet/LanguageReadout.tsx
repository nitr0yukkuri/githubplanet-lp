import type { CSSProperties } from "react";
import type { SceneSnapshot } from "../../lib/planet/scene-snapshot";

type LanguageReadoutProps = {
  snapshot: SceneSnapshot;
};

function LanguageLayer({ language, index, opacity }: { language: SceneSnapshot["activeLanguage"]; index: number; opacity: number }) {
  const languageStyle = {
    "--language-color": language.color,
    opacity,
  } as CSSProperties;

  return (
    <div className="language-readout-layer" style={languageStyle} aria-hidden="true">
      <div className="language-readout-index">PLANET / {String(index + 1).padStart(2, "0")} — HOLD TO OBSERVE</div>
      <div className="language-readout-main">
        <span className="language-logo">
          <img className="language-logo-image" src={language.logo} alt={`${language.label} logo`} />
        </span>
        <div><strong>{language.label}</strong><span>{language.family}</span></div>
      </div>
      <p>{language.tagline}</p>
    </div>
  );
}

export function LanguageReadout({ snapshot }: LanguageReadoutProps) {
  const languageWindow = snapshot.language;
  const activeLanguage = snapshot.activeLanguage;
  const languageStyle = {
    "--language-color": activeLanguage.color,
  } as CSSProperties;

  return (
    <div className="language-readout" style={languageStyle} aria-live="polite">
      <div className="language-readout-transition">
        <LanguageLayer language={languageWindow.from} index={languageWindow.fromIndex} opacity={1 - languageWindow.visualBlend} />
        {languageWindow.to !== languageWindow.from ? (
          <LanguageLayer language={languageWindow.to} index={languageWindow.toIndex} opacity={languageWindow.visualBlend} />
        ) : null}
      </div>
      <div className="language-progress"><span style={{ width: `${languageWindow.localProgress * 100}%` }} /></div>
    </div>
  );
}
