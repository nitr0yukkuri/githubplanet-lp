import type { CSSProperties, RefObject } from "react";
import type { SceneSnapshot } from "../../lib/planet/scene-snapshot";

type FinalCtaSectionProps = {
  sectionRef: RefObject<HTMLElement | null>;
  snapshot: SceneSnapshot;
};

const getGithubPlanetLoginUrl = () => {
  if (typeof window !== "undefined" && /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname)) {
    return "http://localhost:3000/login";
  }
  return "https://githubplanet.dev/login";
};

export function FinalCtaSection({ sectionRef, snapshot }: FinalCtaSectionProps) {
  const bridgeStyle = { "--flight-progress": snapshot.finalFlightProgress } as CSSProperties;

  return (
    <section
      ref={sectionRef}
      className={`final-cta space-bridge ${snapshot.phase === "arrival" ? "is-arrived" : ""}`}
      id="start"
      style={bridgeStyle}
    >
      <div className="space-bridge-stars space-bridge-stars-back" aria-hidden="true" />
      <div className="space-bridge-stars space-bridge-stars-mid" aria-hidden="true" />
      <div className="space-bridge-stars space-bridge-stars-front" aria-hidden="true" />
      <div className="space-bridge-orbit" aria-hidden="true" />
      <div className="space-bridge-planet" aria-hidden="true" />

      <div className="space-bridge-arrival">
        <p className="space-bridge-kicker">GITHUB PLANET / HOME</p>
        <img className="space-bridge-logo" src="/githubplanet-logo.png" alt="GitHub Planet" />
        <h2>あなたのコードが、<br /><em>星になる。</em></h2>
        <p className="space-bridge-copy">GitHubの活動履歴からあなただけの惑星を生成しよう。</p>
        <a className="wired-button light-button" href="https://githubplanet.dev/login" onClick={(event) => { event.preventDefault(); window.location.assign(getGithubPlanetLoginUrl()); }}>
          <span>星を誕生させる</span><b>→</b>
        </a>
        <p className="space-bridge-note">CONTINUE TO GITHUB PLANET</p>
      </div>

      <div className="space-bridge-status" aria-hidden="true">
        <span>DEEP SPACE TRANSIT</span><b>{String(Math.round(snapshot.finalFlightProgress * 100)).padStart(2, "0")} %</b>
      </div>
    </section>
  );
}
