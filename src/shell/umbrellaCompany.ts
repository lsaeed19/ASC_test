/**
 * Demo Umbrella (ConnectED) company scope — aligns URLs with Unified Projects PRD
 * (`/:companyName/projects`). Slug should stay distinct from top-level app segments
 * like `bom` and `catalog` (those routes are registered first in the router).
 */
export const UMBRELLA_COMPANY_SLUG = 'acme-electric';

export const UMBRELLA_COMPANY_LABEL = 'Acme Electric';

export function umbrellaProjectsPath(companySlug: string = UMBRELLA_COMPANY_SLUG): string {
  return `/${companySlug}/projects`;
}

export function umbrellaProjectWorkspacePath(
  companySlug: string,
  projectId: string,
  modulePath: 'content' | 'submittal' | 'sales-brace' | 'seis-brace' = 'content',
): string {
  return `/${companySlug}/projects/${projectId}/${modulePath}`;
}
