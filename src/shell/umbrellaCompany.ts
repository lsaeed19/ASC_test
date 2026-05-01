/**
 * Demo Umbrella (ConnectED) company scope — Home hub at `/:companySlug/dashboard`;
 * project workspaces at `/:companySlug/projects/:projectId/...`. Slug stays distinct
 * from top-level segments like `bom` and `catalog`.
 */
export const UMBRELLA_COMPANY_SLUG = 'acme-electric';

export const UMBRELLA_COMPANY_LABEL = 'Acme Electric';

export function umbrellaProjectsPath(companySlug: string = UMBRELLA_COMPANY_SLUG): string {
  return `/${companySlug}/projects`;
}

/** Company Home hub — projects overview, recents, and cross-project snapshot. */
export function umbrellaDashboardPath(companySlug: string = UMBRELLA_COMPANY_SLUG): string {
  return `/${companySlug}/dashboard`;
}

export function umbrellaProjectWorkspacePath(
  companySlug: string,
  projectId: string,
  modulePath: 'content' | 'submittal' | 'sales-brace' | 'seis-brace' = 'content',
): string {
  return `/${companySlug}/projects/${projectId}/${modulePath}`;
}
