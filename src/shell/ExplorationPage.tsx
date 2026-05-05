import type { CSSProperties } from 'react';
import { useEffect, useMemo } from 'react';

import { useUmbrellaCompany } from '../context/UmbrellaCompanyContext';
import { shellLayout } from '../theme/hydraAlias';
import { Card, Space, theme } from '../ui/antd';

import explorationArtifactBodyHtml from './exploration/progressive-project-commitment-body.html?raw';
import './exploration/progressiveProjectCommitmentExploration.css';

import { PageBackButton } from './PageBackButton';
import { umbrellaDashboardPath } from './umbrellaCompany';

/**
 * **Project Reframing Proposal:** scrollable wireframe doc for a standalone progressive project
 * commitment flow (explore → soft set → commit → attach → handoff → project work → cross-module →
 * mobility → explore). Markup: `exploration/progressive-project-commitment-body.html`; theme via
 * CSS variables on `.exploration-artifact-root` from {@link theme.useToken}.
 */
export function ExplorationPage() {
  const { token } = theme.useToken();
  const { companySlug } = useUmbrellaCompany();

  useEffect(() => {
    const prev = document.title;
    document.title = 'Project Reframing Proposal · Progressive project commitment';
    return () => {
      document.title = prev;
    };
  }, []);

  const artifactVars = useMemo((): CSSProperties => {
    return {
      '--paper': token.colorBgLayout,
      '--surface': token.colorBgContainer,
      '--surface-soft': token.colorFillAlter,
      '--line': token.colorBorderSecondary,
      '--line-strong': token.colorBorder,
      '--ink': token.colorText,
      '--ink-2': token.colorTextSecondary,
      '--ink-3': token.colorTextDescription,
      '--pre': token.colorSuccess,
      '--pre-bg': token.colorSuccessBg,
      '--soft': token.colorWarning,
      '--soft-bg': token.colorWarningBg,
      '--hard': token.colorError,
      '--hard-bg': token.colorErrorBg,
      '--proj': token.colorPrimary,
      '--proj-bg': token.colorPrimaryBg,
      '--draft': token.colorWarning,
      '--draft-bg': token.colorFillAlter,
      /** Text on filled primary / “ink” controls in SVGs (not page background). */
      '--on-filled': token.colorTextLightSolid,
      '--expl-body-font': token.fontFamily,
      '--expl-mono-font': token.fontFamilyCode,
      '--expl-title-font': token.fontFamily,
    } as CSSProperties;
  }, [token]);

  return (
    <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
      <PageBackButton to={umbrellaDashboardPath(companySlug)}>Back to home</PageBackButton>
      <Card
        styles={{ body: { padding: 0 } }}
        style={{
          width: '100%',
          maxWidth: shellLayout.contentRailMaxWidthPx,
          marginInline: 'auto',
          borderColor: token.colorBorderSecondary,
          borderRadius: token.borderRadiusLG,
          boxShadow: token.boxShadowTertiary,
          background: token.colorBgContainer,
        }}
      >
        <div
          className="exploration-artifact-root"
          style={artifactVars}
          dangerouslySetInnerHTML={{ __html: explorationArtifactBodyHtml }}
        />
      </Card>
    </Space>
  );
}
