// Central runtime config.
// All HTTP/WebSocket endpoints are read from Vite env vars at build time, so
// the same source tree works locally and on Vercel without code changes.
//
// To change these values:
//   - locally:   edit .env in the project root
//   - on Vercel: Settings → Environment Variables → VITE_API_URL / VITE_WS_URL
//                then redeploy

// The `||` fallbacks keep local `npm run dev` working even if someone forgets
// to create .env. They are intentionally never reached in production because
// Vercel always injects the build-time variables.
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
export const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';

// Build a full media URL from a path Django gave us (e.g. /media/profiles/foo.png).
// Returns absolute URLs unchanged so we don't double-prefix S3/Cloudinary links.
export function mediaUrl(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${API_URL}${path}`;
}
