<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1_oNg3uQmr9Pq_XzfOHf6Kdn3pFATKHtR

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## PWA support

This app now ships as a Progressive Web App (PWA).

- Installable on supported browsers via the web app manifest.
- Offline-friendly for the app shell and previously fetched same-origin assets via the service worker.
- Uses source-controlled SVG app icon assets located in `public/icons/` (no binary icon files in the PR).

To verify locally:

1. Run `npm run build`
2. Run `npm run preview`
3. Open the app in Chrome/Edge and confirm:
   - the install prompt is available,
   - Application → Manifest is valid,
   - Application → Service Workers shows `/sw.js` as active.

## Deploy to Vercel

This app can be deployed to Vercel without any UI/design changes.

1. Import this repository into Vercel.
2. Keep the default project settings (Vite framework preset).
3. Add environment variable `GEMINI_API_KEY` in Vercel Project Settings → Environment Variables.
4. Deploy.

Vercel will run `npm install` and `npm run build`, and serve the generated `dist` output.
