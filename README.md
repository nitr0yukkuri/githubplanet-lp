# GitHubPlanet LP

GitHubPlanetの活動を、言語ごとの個性を持つ3D惑星として見せるランディングページです。

> Your code, in orbit.

## Preview

https://githubplanet-orbit.itlogin0606.chatgpt.site

## 現在の作品

- Marsテクスチャとskyboxを使った、固定フレーミングの3D惑星
- スクロールで言語の惑星表現を切り替えるLenis体験
- CSS、C++、Go、TypeScript、JavaScript、Java、Kotlin、Rust、Vue、Rubyの言語ロゴと固有エフェクト
- 言語切替時の短い残光、惑星に追従する星、独立して横切るメテオ
- `prefers-reduced-motion` に対応した静止表示

惑星のズームは行いません。カメラ距離、惑星倍率、中心位置を固定し、惑星の自転とテクスチャの立体感を主役にしています。

## データフロー

```text
language-catalog
  ↓
languageWindowFromProgress()
  ↓
sceneSnapshotFromProgress()
  ↓
Reactの言語表示 / Three.jsのplanet variant runtime
```

`languageWindowFromProgress()` がスクロールから言語の保持・遷移・表示切替・残光を決める唯一の遷移ソースです。同じ `SceneSnapshot` をUIとThree.jsで共有するため、ロゴ・文面・惑星エフェクトの切替タイミングがずれません。

## アーキテクチャ

- `app/page.tsx` — ルートの入口だけを担当
- `components/landing/HeroExperience.client.tsx` — Lenis、共有スナップショット、LP全体のクライアント構成
- `components/landing/*` — Header、Hero、Story、Signals、Process、CTA、Footerの表示責務
- `lib/planet/language-catalog.ts` — 言語プロフィールとロゴのカタログ
- `lib/planet/language-timeline.ts` — 進捗から言語遷移を計算する純粋なルール
- `lib/planet/scene-snapshot.ts` — UIとThree.jsが共有する表示状態
- `lib/planet/planet-variant.ts` — 言語固有マテリアルとエフェクトの構築・更新
- `lib/planet/planet-variant-store.ts` — variantの生成、切替、ライフサイクル管理
- `lib/planet/planet-scene.ts` — Three.jsのカメラ、背景、惑星グループ、自転、メテオ、cleanup
- `lib/scroll/use-lenis-scene-progress.ts` — Lenisとスクロール進捗の同期

マテリアルの透明度更新はキャッシュ済みマテリアルを使い、毎フレームの `needsUpdate = true` を避けています。フレーム時刻も1フレームにつき1回だけ取得します。

## Assets

元GitHubPlanetの表現に合わせ、次の公開資産を使用しています。

- `public/2k_mars.jpg` — 惑星表面のMarsテクスチャ
- `public/skybox/*` — 宇宙背景
- `public/language-logos/*` — 言語ロゴ
- `public/githubplanet-logo.png` — GitHubPlanetロゴ

元GitHubPlanetリポジトリのhome/card実装とfront/imgの実資産を照合しています。LP側では表現を再利用しつつ、元アプリ本体のAPIやカード画面を置き換えません。

## Run locally

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
```

Validation:

```bash
npm run test
npx tsc --noEmit
npm run lint
```

## Tech stack

- React 19
- TypeScript
- Three.js 0.160
- Lenis
- vinext / Vite
- Tailwind CSS v4
- Cloudflare Workers-compatible output

## License

All rights reserved.

