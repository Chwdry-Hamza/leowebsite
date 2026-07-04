'use client';

import { usePathname } from 'next/navigation';
import BottomNav from './BottomNav';

/**
 * Renders the floating BottomNav only on routes where it makes sense.
 *
 * The bottom nav anchors at `#payment` / `#transfer` / `#crypto` are sections
 * on the homepage — on any other route they jump to nowhere. Showing the nav
 * there is just visual noise and obscures content (it sits above the page).
 *
 * Hidden on: blog list/post/category/tag, search, all static legal/info pages,
 * the CMS catch-all `[slug]` route, and the 404 page. Visible only on `/`.
 */
const HIDE_BOTTOM_NAV_ROUTES = [
  '/blog',
  '/search',
  '/about',
  '/support',
  '/privacy-policy',
  '/card-terms',
  '/prohibited-activities',
  '/e-sign-consent',
];

export default function ConditionalBottomNav() {
  const pathname = usePathname();
  if (!pathname || pathname === '/') return <BottomNav />;
  if (HIDE_BOTTOM_NAV_ROUTES.some((r) => pathname === r || pathname.startsWith(r + '/'))) {
    return null;
  }
  return <BottomNav />;
}
