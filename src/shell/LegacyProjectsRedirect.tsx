import { Navigate, useLocation } from 'react-router-dom';

import { UMBRELLA_COMPANY_SLUG } from './umbrellaCompany';

/** Maps legacy `/projects` URLs to PRD-shaped `/:companySlug/projects`. */
export function LegacyProjectsRedirect() {
  const loc = useLocation();
  const m = loc.pathname.match(/^\/projects(\/.*)?$/);
  if (!m) {
    return <Navigate to={`/${UMBRELLA_COMPANY_SLUG}/projects`} replace />;
  }
  const to = `/${UMBRELLA_COMPANY_SLUG}/projects${m[1] ?? ''}${loc.search}`;
  return <Navigate to={to} replace state={loc.state} />;
}
