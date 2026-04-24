import { Outlet, useParams } from 'react-router-dom';

import { UmbrellaCompanyProvider } from '../context/UmbrellaCompanyContext';
import { UMBRELLA_COMPANY_LABEL, UMBRELLA_COMPANY_SLUG } from './umbrellaCompany';

function labelForSlug(slug: string): string {
  if (slug === UMBRELLA_COMPANY_SLUG) return UMBRELLA_COMPANY_LABEL;
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Binds `/:companySlug` route param to {@link useUmbrellaCompany} for child routes. */
export function UmbrellaCompanyOutlet() {
  const { companySlug = UMBRELLA_COMPANY_SLUG } = useParams<{ companySlug: string }>();
  const value = { companySlug, companyLabel: labelForSlug(companySlug) };
  return (
    <UmbrellaCompanyProvider value={value}>
      <Outlet />
    </UmbrellaCompanyProvider>
  );
}
