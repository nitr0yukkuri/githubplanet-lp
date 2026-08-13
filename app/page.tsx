"use client";

import type { CSSProperties } from "react";
import { useRef } from "react";
import { LanguageReadout } from "../components/planet/LanguageReadout";
import { PlanetStage } from "../components/planet/PlanetStage";
import { useLenisSceneProgress } from "../lib/scroll/use-lenis-scene-progress";

const facts = [
  { label: "MAIN LANGUAGE", value: "Largest language share", body: "Repository language bytes choose the planet's primary identity." },
  { label: "TOTAL COMMITS", value: "Planet scale + stars", body: "Accumulated contributions make the body larger and populate its white star shell." },
  { label: "WEEKLY COMMITS", value: "Rotation speed", body: "Recent activity determines how quickly the planet turns in its fixed skybox." },
  { label: "PUSH WEBHOOK", value: "Meteor event", body: "A live push arrives as a colored meteor, separate from the planet body." },
];

const steps = [
  { number: "01", title: "CONNECT", body: "GitHubの公開活動を読み取り、リポジトリと言語の比率をまとめます。" },
  { number: "02", title: "TRANSLATE", body: "主言語、コミット数、週間の動きを、惑星の表面と運動へ変換します。" },
  { number: "03", title: "OBSERVE", body: "惑星を回し、星を眺め、実績やカードとして自分の軌道を共有します。" },
];

export default function Home() {
  const heroRef = useRef<HTMLElement | null>(null);
  const { progress: sceneProgress, progressRef, scrollTo } = useLenisSceneProgress(heroRef);
  const pageStyle = { "--scene-progress": sceneProgress } as CSSProperties;

  return (
    <main className="site-shell" style={pageStyle}>
      <div className="star-field" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />
      <header className="fixed-chrome">
        <a className="brand" href="#top" onClick={(event) => scrollTo(event, "#top")} aria-label="GitHubPlanet home"><img className="brand-mark" src="/githubplanet-logo.png" alt="GitHubPlanet" /></a>
        <div className="chrome-center">GITHUB ACTIVITY / 3D PLANET</div>
        <a className="chrome-link" href="#signals" onClick={(event) => scrollTo(event, "#signals")}>READ THE SIGNALS <span>→</span></a>
      </header>
      <div className="progress-rail" aria-hidden="true"><span style={{ width: `${Math.max(4, sceneProgress * 100)}%` }} /></div>

      <section ref={heroRef} className="hero-scroll" id="top">
        <div className="hero-stage">
          <div className="hero-meta hero-meta-left"><span>ORBIT / 01</span><span>GITHUB ACTIVITY</span></div>
          <div className="hero-meta hero-meta-right"><span>{String(Math.round(sceneProgress * 100)).padStart(2, "0")} %</span><span>SCROLL TO EXPLORE</span></div>
          <PlanetStage progressRef={progressRef} />
          <LanguageReadout progress={sceneProgress} />
          <div className="hero-title-group">
            <p className="hero-kicker">YOUR ACTIVITY, SHAPING A PLANET.</p>
            <h1><span>YOUR CODE,</span><span>IN ORBIT.</span></h1>
            <p className="hero-subtitle">GitHubの活動が、言語の個性を持つ惑星へ変わる。</p>
            <a className="wired-button" href="#story" onClick={(event) => scrollTo(event, "#story")}><span>ENTER THE ORBIT</span><b>→</b></a>
          </div>
          <a className="headphone-hint" href="#story" onClick={(event) => scrollTo(event, "#story")} aria-label="Scroll to change language worlds"><span className="headphone-icon" aria-hidden="true">↓</span><span>SCROLL TO CHANGE LANGUAGE WORLDS</span></a>
        </div>
      </section>

      <section className="story-section reveal" id="story">
        <div className="section-rail"><span>01</span><span>THE TRANSLATION</span></div>
        <div className="story-copy"><p className="section-kicker">FROM ACTIVITY TO ATMOSPHERE</p><h2>Invisible work<br /><em>made visible.</em></h2><p className="story-lede">GitHubPlanetは、コードの活動を単なる数字で終わらせない。主言語は表面の性格に、コミットの積み重ねは大きさと星に、最近の動きは回転に変わる。</p></div>
        <div className="story-log"><div className="log-label"><span>ORBIT.LOG</span><span>LIVE TRANSLATION</span></div><p><i>surface</i><b>mainLanguage</b><span>language identity</span></p><p><i>scale</i><b>totalCommits</b><span>planet size + stars</span></p><p><i>motion</i><b>weeklyCommits</b><span className="code-green">rotation speed</span></p><div className="log-line" /><small>EVERY COMMIT LEAVES A SIGNAL.</small></div>
      </section>

      <section className="snapshot-section reveal" id="signals">
        <div className="section-rail"><span>02</span><span>THE SIGNALS</span></div>
        <div className="snapshot-intro"><p className="section-kicker">ACTIVITY, MADE VISIBLE</p><h2>Read<br /><em>your orbit.</em></h2><p className="section-description">惑星の見た目は飾りではなく、GitHubから読んだ活動の役割ごとの結果です。</p></div>
        <div className="signal-grid">{facts.map((fact) => <article className="signal-card" key={fact.label}><span className="signal-card-label">{fact.label}</span><strong>{fact.value}</strong><p>{fact.body}</p></article>)}</div>
      </section>

      <section className="process-section reveal" id="process">
        <div className="section-rail"><span>03</span><span>THE PROCESS</span></div>
        <div className="process-heading"><p className="section-kicker">ONE CONNECTION / THREE MOVEMENTS</p><h2>Connect.<br />Translate.<br /><em>Observe.</em></h2></div>
        <div className="steps">{steps.map((step) => <article className="step" key={step.number}><div className="step-top"><span>{step.number}</span><span>↗</span></div><h3>{step.title}</h3><p>{step.body}</p></article>)}</div>
      </section>

      <section className="final-cta reveal" id="start"><div className="cta-orbit" aria-hidden="true"><div className="cta-planet" /></div><div className="cta-content"><p className="section-kicker">READY FOR LAUNCH</p><h2>Make your work<br /><em>visible.</em></h2><p>最初の惑星は、あなたのGitHub活動からつくられます。</p><a className="wired-button light-button" href="https://github.com/" target="_blank" rel="noreferrer"><span>START WITH GITHUB</span><b>→</b></a></div></section>
      <footer className="site-footer"><a className="brand" href="#top" onClick={(event) => scrollTo(event, "#top")}><img className="brand-mark" src="/githubplanet-logo.png" alt="GitHubPlanet" /></a><span>MAKE YOUR WORK VISIBLE.</span><span>© 2026 GITHUBPLANET</span></footer>
    </main>
  );
}
