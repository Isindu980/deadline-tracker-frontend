# Deadline Tracker — Frontend

Deadline Tracker is a Next.js (App Router) frontend for a deadline / task tracking web app. This repository contains the UI, pages, and components for the application (landing page, authentication, dashboard, support center, and more).

This README covers how to run the project locally, environment variables required for integrations (EmailJS), how to replace the favicon placeholders added by the project, and a short section on common gotchas you might hit when publishing to GitHub or deploying.

## Key features
- Next.js (App Router) + React
- Tailwind CSS-based UI (custom primitives in `src/components/ui`)
- Animated particles background on landing/support pages
- Dashboard with deadlines, friends, and settings
- Support page with contact form (EmailJS)

## Tech stack
- Next.js (app directory)
- React
- Tailwind CSS
- Framer Motion
- EmailJS (client-side contact form)

## Prerequisites
- Node.js 18+ (LTS recommended)
- npm (or yarn/pnpm) — examples below use `npm`

## Local setup (Windows PowerShell)
Open a PowerShell terminal in the project root (`e:\to-do app\deadline-tracker-frontend`) and run:

```powershell
npm install
npm run dev
```

The app will run on http://localhost:3000 by default.

For a production build and to run the built server locally:

```powershell
npm install
npm run build
npm run start
```

## Important environment variables
The support contact form uses EmailJS. Create a `.env.local` in the project root and add these (replace with your values):

```env
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_template_id
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key
```

Note: These variables are read client-side (prefixed with `NEXT_PUBLIC_`) to allow the contact form to submit from the browser. Never commit secret service keys without understanding the exposure implications.

## Favicons and publishing notes
- The project `src/app/layout.js` metadata references multiple icon formats: `/favicon.ico`, `/favicon.png`, `/favicon.svg`, and an Apple touch icon. For Next.js to serve your static icons reliably, place the files in the project `public/` directory.
- During development I added placeholder icons to `public/` (vector SVG content saved into `favicon.svg`, `favicon.png` and `apple-touch-icon.png`) so Next would stop falling back to the default `next.svg` icon. Replace these placeholder files with properly exported raster images for production:
  - `public/favicon.ico` — recommended multi-size ICO (16x16, 32x32, 48x48) for legacy browsers
  - `public/favicon.png` — 32×32 PNG
  - `public/apple-touch-icon.png` — 180×180 PNG (iOS home screen)
  - `public/favicon.svg` — SVG vector version (optional)

If you see this Next.js warning on startup: "A conflicting public file and page file was found for path /favicon.ico", it means a `favicon.ico` file existed inside `src/app` (or another page route) and conflicted with the public asset. Remove any `src/app/favicon.ico` and keep the file(s) under `public/`.

## Linting / common issues
- You may encounter ESLint rule `react/no-unescaped-entities` for apostrophes in JSX (e.g., "we'll"). The proper fix is to escape with `&apos;` or use string expressions. During development temporary per-file ESLint disables were added; consider resolving the underlying text escaping before publishing.

## Tests
This project doesn't currently include automated tests. If you add tests, consider a minimal Jest/React Testing Library setup and a `npm test` script.

## Preparing to publish on GitHub
1. Ensure `public/` contains the proper icon files listed above.
2. Add a clear `LICENSE` file (MIT/Apache/etc) if you want to open-source the repo.
3. Add any CI you want (GitHub Actions) for builds — a minimal workflow can run `npm ci`, `npm run build` and optionally `npm run test`.
4. Update `README.md` with screenshots, a demo link, and CI badges when available.

## Deploying
- Vercel: This is a Next.js app — Vercel is the simplest path (connect GitHub, select the repo). Vercel detects Next automatically.
- Other hosts: Build via `npm run build` and serve with `npm run start`, or export static assets if applicable.

## Contributing
- Open issues for bug reports or feature requests.
- Fork the repo, make changes, and open a PR. Keep changes small and focused.

## Contact
If you need help with icons, environment configuration, or CI setup I can add those files for you. You can also use the in-app Support page (once EmailJS is configured) to send messages.

---
Generated on: 2025-11-04
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
