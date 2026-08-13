export function StorySection() {
  return (
    <section className="story-section reveal" id="story">
      <div className="section-rail"><span>01</span><span>THE TRANSLATION</span></div>
      <div className="story-copy"><p className="section-kicker">FROM ACTIVITY TO ATMOSPHERE</p><h2>Invisible work<br /><em>made visible.</em></h2><p className="story-lede">GitHubPlanetは、コードの活動を単なる数字で終わらせない。主言語は表面の性格に、コミットの積み重ねは大きさと星に、最近の動きは回転に変わる。</p></div>
      <div className="story-log"><div className="log-label"><span>ORBIT.LOG</span><span>LIVE TRANSLATION</span></div><p><i>surface</i><b>mainLanguage</b><span>language identity</span></p><p><i>scale</i><b>totalCommits</b><span>planet size + stars</span></p><p><i>motion</i><b>weeklyCommits</b><span className="code-green">rotation speed</span></p><div className="log-line" /><small>EVERY COMMIT LEAVES A SIGNAL.</small></div>
    </section>
  );
}
