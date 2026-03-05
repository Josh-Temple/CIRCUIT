# Handoff Notes

## Session Summary
- Added Vercel deployment configuration for this Vite app via `vercel.json`.
- Updated `README.md` with a "Deploy to Vercel" section.
- No UI or design files were modified.

## What changed
- `vercel.json`
  - framework: `vite`
  - install command: `npm install`
  - build command: `npm run build`
  - output directory: `dist`
- `README.md`
  - Added deployment steps for Vercel, including `GEMINI_API_KEY` configuration.

## Validation
- Run `npm run build` to verify production build succeeds.

## Next session suggestions
- Optionally add preview-deployment notes (branch/PR workflow) if your team uses Vercel previews.
- Optionally document production domain setup (custom domain + DNS) in README.
