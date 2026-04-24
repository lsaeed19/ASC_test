import { createContext, useContext, type ReactNode } from 'react';

import {
  UMBRELLA_COMPANY_LABEL,
  UMBRELLA_COMPANY_SLUG,
} from '../shell/umbrellaCompany';

export type UmbrellaCompany = {
  companySlug: string;
  companyLabel: string;
};

const UmbrellaCompanyContext = createContext<UmbrellaCompany | null>(null);

/** Scope for routes under `/:companySlug/*` (canonical Umbrella tenant). */
export function UmbrellaCompanyProvider({ value, children }: { value: UmbrellaCompany; children: ReactNode }) {
  return <UmbrellaCompanyContext.Provider value={value}>{children}</UmbrellaCompanyContext.Provider>;
}

/** Active tenant from URL, or demo defaults when outside `/:companySlug` (e.g. `/bom`, `/catalog`). */
export function useUmbrellaCompany(): UmbrellaCompany {
  const ctx = useContext(UmbrellaCompanyContext);
  return (
    ctx ?? {
      companySlug: UMBRELLA_COMPANY_SLUG,
      companyLabel: UMBRELLA_COMPANY_LABEL,
    }
  );
}
