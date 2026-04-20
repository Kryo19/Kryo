# KRYO — AI-Native Cold Chain Intelligence

KRYO is a self-contained cold-chain intelligence dashboard with landing, fleet command, sensor inspect, certificate, and admin control screens.

## Project structure

```text
artifacts/kryo
├── index.html
├── package.json
├── src
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   ├── components/ui
│   ├── hooks
│   └── lib
└── README.md
```

## Run locally

From the project root:

```bash
pnpm --filter @workspace/kryo run dev
```

## Open in VS Code

Open the project folder, then edit files under:

```text
artifacts/kryo/src
```

## Login credentials

- Username: `admin`
- Password: `kryo2026`

## Add your own data

Open `/admin`, log in, then use the admin controls to add or edit shipments, add manual sensor readings, generate certificates, export JSON, and simulate live data.

## Deploy

Use Replit's Publish/Deploy button when you are ready to make the app live. For Vercel, export the `artifacts/kryo` package as a standalone web app and set the build command to `pnpm run build` with output directory `dist/public`.

## Customize further

The main app logic is in `src/App.tsx`; visual styling and the neon cold-chain theme are in `src/index.css`.
