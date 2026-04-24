import { Navigate, Route, Routes } from 'react-router-dom';

import { AppShell } from './shell/AppShell';
import { CatalogHome } from './shell/CatalogHome';
import { CatalogPartPage } from './shell/CatalogPartPage';
import { CatalogResults } from './shell/CatalogResults';
import { ContentModule, SalesBraceModule, SubmittalModule } from './shell/ProjectModuleStubs';
import { BomRoutes } from './bom/BomRoutes';
import { DashboardPlaceholder } from './shell/DashboardPlaceholder';
import { LegacyProjectsRedirect } from './shell/LegacyProjectsRedirect';
import { ProjectWorkspaceLayout } from './shell/ProjectWorkspaceLayout';
import { ShellHomeContent } from './shell/ShellHomeContent';
import { UmbrellaCompanyOutlet } from './shell/UmbrellaCompanyOutlet';
import { UMBRELLA_COMPANY_SLUG, umbrellaProjectsPath } from './shell/umbrellaCompany';

export function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Navigate to={umbrellaProjectsPath()} replace />} />
        <Route path="/projects/*" element={<LegacyProjectsRedirect />} />
        <Route path="/dashboard" element={<Navigate to={`/${UMBRELLA_COMPANY_SLUG}/dashboard`} replace />} />

        <Route
          path="seisbrace/projects"
          element={<Navigate to={umbrellaProjectsPath()} replace />}
        />
        <Route
          path="submittals/projects"
          element={<Navigate to={umbrellaProjectsPath()} replace />}
        />

        <Route path="catalog" element={<CatalogHome />} />
        <Route path="catalog/results" element={<CatalogResults />} />
        <Route path="catalog/parts/:partId" element={<CatalogPartPage />} />

        <Route path="bom/*" element={<BomRoutes />} />

        <Route path=":companySlug" element={<UmbrellaCompanyOutlet />}>
          <Route path="dashboard" element={<DashboardPlaceholder />} />
          <Route path="projects" element={<ShellHomeContent />} />
          <Route path="projects/:projectId" element={<ProjectWorkspaceLayout />}>
            <Route index element={<Navigate to="content" replace />} />
            <Route path="seis-brace" element={<SalesBraceModule />} />
            <Route path="sales-brace" element={<SalesBraceModule />} />
            <Route path="submittal" element={<SubmittalModule />} />
            <Route path="content" element={<ContentModule />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}
