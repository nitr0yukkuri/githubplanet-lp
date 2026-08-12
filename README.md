# GitHubPlanet LP

GitHubで積み重ねた活動を、世界にひとつの惑星として可視化するランディングページです。

> Your code, in orbit.

## Preview

https://githubplanet-orbit.itlogin0606.chatgpt.site

## Features

- GitHubPlanetのコンセプトを伝える、宇宙をテーマにしたファーストビュー
- CSSで描いた惑星・軌道・星空のビジュアル
- 直近7日 / 30日 / 全期間を切り替えられる活動スナップショット
- GitHubPlanetの仕組みを「つなぐ / 読み解く / 眺める」で紹介
- PC・タブレット・スマートフォン対応
- `prefers-reduced-motion` に対応した控えめなアニメーション

## Run locally

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
```

## Tech stack

- React 19
- TypeScript
- vinext / Vite
- Tailwind CSS v4
- Cloudflare Workers-compatible output

## Project structure

- `app/page.tsx` — LPの構造と活動データ切り替え
- `app/globals.css` — ビジュアル、レスポンシブ、モーション
- `app/layout.tsx` — ページメタデータ
- `public/` — faviconなどの公開アセット

## License

All rights reserved.
