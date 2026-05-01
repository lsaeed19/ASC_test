import { Navigate, useLocation } from 'react-router-dom';

import { UMBRELLA_COMPANY_SLUG, umbrellaDashboardPath } from './umbrellaCompany';

/** Maps legacy `/projects` to company Home; nested paths stay under `/:slug/projects/...`. */
export function LegacyProjectsRedirect() {
  const loc = useLocation();
  const m = loc.pathname.match(/^\/projects(\/.*)?$/);
  if (!m) {
    return <Navigate to={umbrellaDashboardPath(UMBRELLA_COMPANY_SLUG)} replace />;
  }
  const rest = m[1] ?? '';
  if (rest === '' || rest === '/') {
    return <Navigate to={umbrellaDashboardPath(UMBRELLA_COMPANY_SLUG)} replace state={loc.state} />;
  }
  const to = `/${UMBRELLA_COMPANY_SLUG}/projects${rest}${loc.search}`;
  return <Navigate to={to} replace state={loc.state} />;
}
