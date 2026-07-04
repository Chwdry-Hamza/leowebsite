import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

const SECRET = process.env.LEO_REVALIDATE_SECRET ?? '';

/**
 * Called by spay-backend after a content change.
 * Body: { paths: string[] }
 * Header: x-spay-secret must match LEO_REVALIDATE_SECRET
 *   (spay-backend's revalidate service sends `x-spay-secret`; the env var
 *    name `LEO_REVALIDATE_SECRET` is kept for backwards compatibility — its
 *    value must equal spay-backend's WEBSITE_REVALIDATE_SECRET.)
 */
export async function POST(req: NextRequest) {
  const provided = req.headers.get('x-spay-secret') ?? '';
  if (!SECRET || provided !== SECRET) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  let body: { paths?: string[] } = {};
  try { body = await req.json(); } catch { /* allow empty body */ }

  const paths = (body.paths ?? []).filter((p) => typeof p === 'string');
  if (paths.length === 0) {
    revalidatePath('/', 'layout');
    return NextResponse.json({ ok: true, revalidated: 'all' });
  }

  for (const path of paths) {
    try {
      // Site-wide changes (settings/SEO defaults) come in as `/`. They affect
      // metadata rendered from the root layout, so we have to invalidate at
      // layout scope or every other page's title/description stays stale.
      if (path === '/') {
        revalidatePath('/', 'layout');
      } else {
        // With trailingSlash:true the cached entry's key carries a trailing
        // slash, but the CMS may send either spelling — revalidate BOTH so the
        // purge can't miss the cached page and leave it stale.
        const noSlash = path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path;
        const withSlash = noSlash === '/' || noSlash.endsWith('/') ? noSlash : `${noSlash}/`;
        revalidatePath(noSlash);
        if (withSlash !== noSlash) revalidatePath(withSlash);
      }
    } catch {
      /* ignore individual failures */
    }
  }
  return NextResponse.json({ ok: true, revalidated: paths });
}

export async function GET() {
  return NextResponse.json({
    info: 'POST { paths: string[] } with x-spay-secret header to revalidate.',
  });
}
