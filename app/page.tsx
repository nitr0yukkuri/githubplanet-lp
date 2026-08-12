"use client";

import { useState } from "react";

type RangeKey = "7d" | "30d" | "all";

const snapshots: Record<RangeKey, { label: string; total: string; delta: string; bars: number[] }> = {
  "7d": { label: "直近7日", total: "42 commits", delta: "+18%", bars: [32, 58, 42, 76, 52, 88, 67, 94, 72, 82, 56, 100] },
  "30d": { label: "直近30日", total: "138 commits", delta: "+31%", bars: [54, 38, 72, 48, 82, 66, 59, 92, 70, 88, 76, 96] },
  all: { label: "全期間", total: "2,917 commits", delta: "since 2022", bars: [22, 34, 46, 61, 42, 70, 80, 55, 88, 74, 92, 100] },
};

const steps = [
  { number: "01", title: "つなぐ", body: "GitHubアカウントをつなぐだけ。公開リポジトリの活動を読み取ります。" },
  { number: "02", title: "読み解く", body: "コミット、言語、継続日数をひとつの活動データとして整理します。" },
  { number: "03", title: "眺める", body: "あなたのコードのリズムが、世界にひとつの惑星として浮かび上がります。" },
];

export default function Home() {
  const [range, setRange] = useState<RangeKey>("7d");
  const snapshot = snapshots[range];

  return (
    <main className="page-shell">
      <div className="star-field" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />

      <header className="site-header">
        <a className="brand" href="#top" aria-label="GitHubPlanet ホーム">
          <span className="brand-mark" aria-hidden="true"><span /></span>
          <span>GitHub<span className="brand-accent">Planet</span></span>
        </a>
        <nav className="main-nav" aria-label="メインナビゲーション">
          <a href="#concept">コンセプト</a>
          <a href="#snapshot">活動データ</a>
          <a href="#how-it-works">しくみ</a>
        </nav>
        <a className="header-cta" href="#start">惑星をつくる <span aria-hidden="true">↗</span></a>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow"><span className="eyebrow-dot" /> YOUR CODE, IN ORBIT</p>
          <h1>コードの軌跡を、<br /><em>ひとつの惑星</em>に。</h1>
          <p className="hero-lede">GitHubで積み重ねた活動を、動きのある惑星として可視化。あなたの開発リズムを、眺めて楽しもう。</p>
          <div className="hero-actions">
            <a className="primary-button" href="#start">GitHubPlanetをはじめる <span aria-hidden="true">→</span></a>
            <a className="text-link" href="#concept">もっと見る <span aria-hidden="true">↓</span></a>
          </div>
          <div className="hero-note"><span className="pulse-dot" /> 公開リポジトリの活動から生成</div>
        </div>

        <div className="hero-visual" aria-label="活動データから生成された惑星のイメージ">
          <div className="orbit orbit-one" aria-hidden="true" />
          <div className="orbit orbit-two" aria-hidden="true" />
          <div className="planet-shadow" aria-hidden="true" />
          <div className="planet" aria-hidden="true">
            <div className="planet-glow" />
            <div className="planet-land land-one" />
            <div className="planet-land land-two" />
            <div className="planet-land land-three" />
            <div className="planet-crater crater-one" />
            <div className="planet-crater crater-two" />
          </div>
          <div className="satellite satellite-one"><span /> 18 LANGUAGES</div>
          <div className="satellite satellite-two"><span /> 42 DAY STREAK</div>
          <div className="visual-coordinates">35°41&apos;N&nbsp;&nbsp;139°41&apos;E</div>
          <div className="visual-caption"><span>LIVE SNAPSHOT</span><strong>personal / orbit-01</strong></div>
        </div>
      </section>

      <div className="signal-strip" aria-label="GitHubPlanetの特徴">
        <span>ACTIVITY, MADE VISIBLE</span><span className="signal-line" /><span>OPEN SOURCE / PERSONAL DATA / YOUR ORBIT</span>
      </div>

      <section className="concept section-grid" id="concept">
        <div className="section-intro">
          <p className="section-kicker">01 — CONCEPT</p>
          <h2>GitHubの活動を、<br /><span>見える形</span>に。</h2>
        </div>
        <div className="concept-body">
          <p className="large-copy">コードは、書いた瞬間から軌跡になる。GitHubPlanetは、その積み重ねを色・光・動きに変えて、ひと目であなたらしい惑星にします。</p>
          <div className="code-sample" aria-label="活動ログのサンプル">
            <div className="code-top"><span /><span /><span /><small>orbit.log</small></div>
            <p><i>commit</i> <b>7f3a1c</b> <span>feat: tune the horizon</span></p>
            <p><i>language</i> <b>TypeScript</b> <span>████████░░ 82%</span></p>
            <p><i>streak</i> <b>42 days</b> <span className="code-green">+ orbit stable</span></p>
          </div>
        </div>
      </section>

      <section className="snapshot section-grid" id="snapshot">
        <div className="section-intro">
          <p className="section-kicker">02 — YOUR SNAPSHOT</p>
          <h2>活動のリズムを、<br /><span>眺めてみる。</span></h2>
          <p className="section-description">時間のスケールを変えると、惑星の表情も変わる。小さな習慣から長い旅まで、あなたのペースをそのまま映します。</p>
        </div>
        <div className="snapshot-panel">
          <div className="panel-heading"><span>activity / commits</span><span className="panel-status"><span className="pulse-dot" /> synced</span></div>
          <div className="range-tabs" role="tablist" aria-label="活動期間">
            {(Object.keys(snapshots) as RangeKey[]).map((key) => (
              <button key={key} className={range === key ? "active" : ""} onClick={() => setRange(key)} role="tab" aria-selected={range === key}>
                {snapshots[key].label}
              </button>
            ))}
          </div>
          <div className="snapshot-total"><strong>{snapshot.total}</strong><span>{snapshot.delta}</span></div>
          <div className="chart" aria-label={`${snapshot.label}のコミット数グラフ`}>
            {snapshot.bars.map((height, index) => <span key={`${range}-${index}`} style={{ height: `${height}%` }} />)}
          </div>
          <div className="chart-labels"><span>01</span><span>06</span><span>12</span><span>18</span><span>24</span><span>30</span></div>
          <div className="panel-footer"><span>last synced 08:42 JST</span><span className="panel-link">view full orbit <b>↗</b></span></div>
        </div>
      </section>

      <section className="how-it-works" id="how-it-works">
        <div className="section-intro centered-intro">
          <p className="section-kicker">03 — HOW IT WORKS</p>
          <h2>つなぐだけで、<br /><span>軌道がはじまる。</span></h2>
        </div>
        <div className="steps">
          {steps.map((step, index) => (
            <div className="step" key={step.number}>
              <div className="step-top"><span>{step.number}</span>{index < steps.length - 1 && <span className="step-arrow" aria-hidden="true">↗</span>}</div>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="final-cta" id="start">
        <div className="cta-orbit" aria-hidden="true"><div className="cta-planet" /></div>
        <div className="cta-content">
          <p className="eyebrow"><span className="eyebrow-dot" /> READY FOR LAUNCH</p>
          <h2>あなたのコードを、<br /><em>宇宙に浮かべよう。</em></h2>
          <p>最初の惑星は、数秒でつくれます。</p>
          <a className="primary-button light-button" href="https://github.com/" target="_blank" rel="noreferrer">GitHubからはじめる <span aria-hidden="true">↗</span></a>
        </div>
      </section>

      <footer className="site-footer">
        <a className="brand" href="#top"><span className="brand-mark" aria-hidden="true"><span /></span><span>GitHub<span className="brand-accent">Planet</span></span></a>
        <p>Make your work visible.</p>
        <span>© 2026 GitHubPlanet</span>
      </footer>
    </main>
  );
}
