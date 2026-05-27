import type { MetadataRoute } from 'next'

/**
 * PWA manifest. Mobile "Add to home screen" prompts pick up the name,
 * icons, and theme colors from here. The Swiss-flag SVG is inlined as
 * a data URI (same one used for the favicon in app/layout.tsx) so the
 * manifest doesn't depend on a /public asset.
 *
 * Swap the data URI for `{ src: '/icon-192.png', ... }` entries once
 * marketing ships rasterized PWA icons (192 + 512 sizes per Android
 * + iOS recommendations).
 */
export default function manifest(): MetadataRoute.Manifest {
  const SWISS_FLAG_DATA_URI =
    "data:image/svg+xml;utf8," +
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'>" +
    "<rect width='32' height='32' rx='4' fill='%23DC2626'/>" +
    "<rect x='13' y='6' width='6' height='20' fill='%23ffffff'/>" +
    "<rect x='6' y='13' width='20' height='6' fill='%23ffffff'/></svg>"

  return {
    name: 'SwissCresta — Professional Trading Platform',
    short_name: 'SwissCresta',
    description: 'Professional forex and CFD trading platform',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0a0a',
    theme_color: '#6366F1',
    icons: [
      { src: SWISS_FLAG_DATA_URI, sizes: 'any', type: 'image/svg+xml' },
    ],
  }
}
