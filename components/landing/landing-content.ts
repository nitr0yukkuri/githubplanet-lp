export const facts = [
  { label: "MAIN LANGUAGE", value: "Largest language share", body: "Repository language bytes choose the planet's primary identity." },
  { label: "TOTAL COMMITS", value: "Planet scale + stars", body: "Accumulated contributions make the body larger and populate its white star shell." },
  { label: "WEEKLY COMMITS", value: "Rotation speed", body: "Recent activity determines how quickly the planet turns in its fixed skybox." },
  { label: "PUSH WEBHOOK", value: "Meteor event", body: "A live push arrives as a colored meteor, separate from the planet body." },
] as const;

export const steps = [
  { number: "01", title: "CONNECT", body: "GitHubの公開活動を読み取り、リポジトリと言語の比率をまとめます。" },
  { number: "02", title: "TRANSLATE", body: "主言語、コミット数、週間の動きを、惑星の表面と運動へ変換します。" },
  { number: "03", title: "OBSERVE", body: "惑星を回し、星を眺め、実績やカードとして自分の軌道を共有します。" },
] as const;
