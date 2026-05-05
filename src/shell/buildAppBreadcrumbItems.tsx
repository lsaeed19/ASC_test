import { Link } from 'react-router-dom';

import { bomItemById, bomProjectTitleById } from '../bom/data/mockData';
import type { BreadcrumbProps } from '../ui/antd';

import { projectTitleById } from './projectSeed';
import {
  UMBRELLA_COMPANY_LABEL,
  UMBRELLA_COMPANY_SLUG,
  umbrellaDashboardPath,
} from './umbrellaCompany';

type BreadcrumbSeg = { label: string; to?: string };

type BuildArgs = {
  pathname: string;
  projectId?: string;
  partId?: string;
  itemId?: string;
  swapRowId?: string;
  swapPartNumber?: string;
};

function companyLabelFromSlug(slug: string): string {
  if (slug === UMBRELLA_COMPANY_SLUG) return UMBRELLA_COMPANY_LABEL;
  return slug
    .split('-')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function companyHomeSeg(slug: string): BreadcrumbSeg {
  return {
    label: companyLabelFromSlug(slug),
    to: `/${slug}/dashboard`,
  };
}

function defaultCompanyHomeSeg(): BreadcrumbSeg {
  return companyHomeSeg(UMBRELLA_COMPANY_SLUG);
}

function toItems(segments: BreadcrumbSeg[]): BreadcrumbProps['items'] {
  return segments.map((seg, i) => {
    const isLast = i === segments.length - 1;
    const title =
      isLast || !seg.to ? seg.label : <Link to={seg.to}>{seg.label}</Link>;
    return { title };
  });
}

/** Canonical Umbrella tenant routes: `/:companySlug/dashboard` and `/:companySlug/projects`. */
function parseCompanyDashboard(pathname: string): string | null {
  const m = /^\/([^/]+)\/dashboard\/?$/.exec(pathname);
  return m?.[1] ?? null;
}

function parseCompanyProjects(pathname: string): {
  companySlug: string;
  projectId?: string;
  tail?: string;
} | null {
  const listOnly = /^\/([^/]+)\/projects\/?$/.exec(pathname);
  if (listOnly) return { companySlug: listOnly[1] };

  const nested = /^\/([^/]+)\/projects\/([^/]+)(\/.*)?$/.exec(pathname);
  if (nested) {
    return { companySlug: nested[1], projectId: nested[2], tail: nested[3] };
  }
  return null;
}

export function buildAppBreadcrumbItems(a: BuildArgs): BreadcrumbProps['items'] {
  const { pathname, projectId, partId, itemId, swapRowId, swapPartNumber } = a;

  const dashSlug = parseCompanyDashboard(pathname);
  if (dashSlug) {
    const segs: BreadcrumbSeg[] = [companyHomeSeg(dashSlug), { label: 'Home' }];
    return toItems(segs);
  }

  const umbrella = parseCompanyProjects(pathname);
  if (umbrella) {
    const { companySlug, projectId: pathProjectId, tail } = umbrella;
    const segs: BreadcrumbSeg[] = [companyHomeSeg(companySlug)];

    if (!pathProjectId) {
      segs.push({ label: 'Home', to: umbrellaDashboardPath(companySlug) });
      return toItems(segs);
    }

    const pid = pathProjectId ?? projectId ?? '';
    const pTitle = projectTitleById(pid) ?? 'Project';
    const hub = `/${companySlug}/projects/${pid}/content`;

    segs.push({ label: 'Home', to: umbrellaDashboardPath(companySlug) });

    if (!tail || tail === '/' || tail === '') {
      return toItems(segs);
    }

    if (pathname === hub || pathname === `${hub}/`) {
      segs.push({ label: pTitle });
      segs.push({ label: 'Content' });
      return toItems(segs);
    }

    segs.push({ label: pTitle, to: hub });
    if (pathname.includes('/seis-brace')) segs.push({ label: 'SeisBrace' });
    else if (pathname.includes('/sales-brace')) segs.push({ label: 'Spec' });
    else if (pathname.includes('/submittal')) segs.push({ label: 'Submittal' });
    else if (pathname.includes('/content')) segs.push({ label: 'Content' });
    return toItems(segs);
  }

  const segs: BreadcrumbSeg[] = [defaultCompanyHomeSeg()];

  if (pathname.startsWith('/exploration')) {
    segs.push({ label: 'Project Reframing Proposal' });
    return toItems(segs);
  }

  if (pathname.startsWith('/catalog')) {
    segs.push({ label: 'Catalog', to: pathname !== '/catalog' ? '/catalog' : undefined });
    if (pathname.includes('/results')) {
      segs.push({ label: 'Results' });
      return toItems(segs);
    }
    if (pathname.includes('/parts/') && partId) {
      segs.push({ label: `Part ${decodeURIComponent(partId)}` });
      return toItems(segs);
    }
    return toItems(segs);
  }

  if (pathname.startsWith('/bom')) {
    segs.push({ label: 'BOM', to: pathname !== '/bom' ? '/bom' : undefined });
    if (pathname === '/bom') return toItems(segs);
    if (pathname === '/bom/search') {
      segs.push({ label: 'Search' });
      return toItems(segs);
    }

    const bomProjectMatch = /^\/bom\/projects\/([^/]+)/.exec(pathname);
    if (bomProjectMatch) {
      const pid = bomProjectMatch[1];
      const ws = `/bom/projects/${pid}/workspace`;
      const pTitle = bomProjectTitleById(pid) ?? 'BOM project';
      const onWorkspace = pathname.includes('/workspace');
      segs.push({ label: pTitle, to: onWorkspace ? undefined : ws });

      const resolvedItemId = itemId ?? /\/items\/([^/]+)/.exec(pathname)?.[1];
      if (resolvedItemId) {
        const row = bomItemById(resolvedItemId);
        const lineLabel = row ? `Line ${row.rowNumber}` : `Line ${resolvedItemId}`;
        let lineTo: string | undefined;
        if (pathname.includes('/narrow')) {
          lineTo = `/bom/projects/${pid}/items/${resolvedItemId}/recommend`;
        } else if (pathname.includes('/recommend')) {
          lineTo = `/bom/projects/${pid}/items/${resolvedItemId}/narrow`;
        }
        segs.push({ label: lineLabel, to: lineTo });
      }

      if (pathname.includes('/parsing-review')) segs.push({ label: 'Parsing review' });
      else if (pathname.includes('/matching')) segs.push({ label: 'Matching results' });
      else if (pathname.includes('/narrow')) segs.push({ label: 'Guided narrowing' });
      else if (pathname.includes('/recommend')) segs.push({ label: 'Recommended result' });
      else if (pathname.includes('/workspace')) segs.push({ label: 'Workspace' });
      else if (pathname.includes('/asc-products')) {
        segs.push({ label: 'ASC products' });
        if (swapRowId) {
          segs.push({ label: swapPartNumber ? `Manual swap · ${swapPartNumber}` : 'Manual swap' });
        }
      } else if (pathname.includes('/export')) segs.push({ label: 'Export' });
      else if (pathname.includes('/service-request')) segs.push({ label: 'Service request' });
    }
    return toItems(segs);
  }

  return toItems(segs);
}
