import {
  CalculatorOutlined,
  CompassOutlined,
  FileTextOutlined,
  GlobalOutlined,
  HomeOutlined,
  InboxOutlined,
  LeftOutlined,
  ReadOutlined,
  RightOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import type { CSSProperties } from 'react';
import { useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { useHydraColorMode } from '../context/HydraThemeContext';
import { shellLayout } from '../theme/hydraAlias';
import {
  hydraMenuItemBorderRadius,
  hydraSidebarCollapseTriggerTopPx,
} from '../theme/hydraMenuMetrics';
import { sidebarSemanticsFor } from '../theme/sidebarSemantics';
import { Button, Flex, Layout, Menu, theme } from '../ui/antd';
import type { MenuProps } from '../ui/antd';

import { ConnectedSidebarBrand } from './ConnectedSidebarBrand';
import { getLastScopedProjectId } from './lastProjectScope';
import { UMBRELLA_COMPANY_SLUG } from './umbrellaCompany';

const { Sider } = Layout;

/** Sidebar key for the progressive project commitment proposal page (`/exploration`). */
const PROJECT_REFRAMING_KEY = 'projectReframing';

function primarySideKey(pathname: string): string {
  if (pathname.startsWith('/catalog')) return 'catalog';
  if (pathname.startsWith('/exploration')) return PROJECT_REFRAMING_KEY;
  if (pathname.startsWith('/bom')) return 'bom';
  if (/\/[^/]+\/dashboard\/?$/.test(pathname)) return 'dash';
  if (/\/[^/]+\/projects\/?$/.test(pathname)) return 'dash';
  if (/\/[^/]+\/projects\/[^/]+\/seis-brace/.test(pathname)) return 'seis';
  if (/\/[^/]+\/projects\/[^/]+\/sales-brace/.test(pathname)) return 'spec';
  if (/\/[^/]+\/projects\/[^/]+\/submittal/.test(pathname)) return 'submittal';
  if (/\/[^/]+\/projects\/[^/]+\/content/.test(pathname)) return 'content';
  return 'dash';
}

export function AppShellSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { colorMode } = useHydraColorMode();
  const sidebarSurface = sidebarSemanticsFor(colorMode);
  const { token } = theme.useToken();
  const location = useLocation();
  const navigate = useNavigate();
  const { companySlug: companySlugParam } = useParams<{ companySlug?: string }>();
  const companySlug = companySlugParam ?? UMBRELLA_COMPANY_SLUG;

  const primaryMenuItems: MenuProps['items'] = useMemo(
    () => [
      { key: 'dash', icon: <HomeOutlined />, label: 'Home' },
      { key: 'seis', icon: <CalculatorOutlined />, label: 'SeisBrace' },
      { key: 'spec', icon: <FileTextOutlined />, label: 'Spec' },
      { key: 'submittal', icon: <InboxOutlined />, label: 'Submittal' },
      { key: 'catalog', icon: <GlobalOutlined />, label: 'Catalog' },
      { key: 'bom', icon: <UnorderedListOutlined />, label: 'BOM' },
      { key: 'content', icon: <ReadOutlined />, label: 'Content' },
    ],
    [],
  );

  const proposalMenuItems: MenuProps['items'] = useMemo(
    () => [
      {
        key: PROJECT_REFRAMING_KEY,
        icon: <CompassOutlined />,
        label: (
          <span style={{ whiteSpace: 'normal', lineHeight: 1.35, display: 'block' }}>
            Project Reframing Proposal
          </span>
        ),
      },
    ],
    [],
  );

  const activeSideKey = useMemo(() => primarySideKey(location.pathname), [location.pathname]);

  const primarySelectedKeys = useMemo(
    () => (activeSideKey === PROJECT_REFRAMING_KEY ? [] : [activeSideKey]),
    [activeSideKey],
  );

  const proposalSelectedKeys = useMemo(
    () => (activeSideKey === PROJECT_REFRAMING_KEY ? [PROJECT_REFRAMING_KEY] : []),
    [activeSideKey],
  );

  const proposalFooterSurface: CSSProperties = useMemo(
    () => ({
      flexShrink: 0,
      borderTop: `${token.lineWidth}px ${token.lineType} ${token.colorSplit}`,
      background: token.colorFillTertiary,
      paddingBlock: token.paddingXXS,
    }),
    [token],
  );

  const onShellMenuClick: MenuProps['onClick'] = ({ key }) => {
    const pid = getLastScopedProjectId();
    const routes: Record<string, string> = {
      dash: `/${companySlug}/dashboard`,
      seis: `/${companySlug}/projects/${pid}/seis-brace`,
      spec: `/${companySlug}/projects/${pid}/sales-brace`,
      submittal: `/${companySlug}/projects/${pid}/submittal`,
      catalog: '/catalog',
      bom: '/bom',
      content: `/${companySlug}/projects/${pid}/content`,
      [PROJECT_REFRAMING_KEY]: '/exploration',
    };
    const path = routes[key];
    if (path) navigate(path);
  };

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={setCollapsed}
      trigger={null}
      theme="dark"
      width={shellLayout.siderWidth}
      collapsedWidth={shellLayout.siderCollapsedWidth}
      style={{
        background: sidebarSurface.colorSidebar,
        borderInlineEnd: `${token.lineWidth}px ${token.lineType} ${token.colorSplit}`,
        alignSelf: 'stretch',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          minHeight: 0,
        }}
      >
        <div
          style={{
            flexShrink: 0,
            height: shellLayout.headerHeight,
            boxSizing: 'border-box',
            display: 'flex',
            alignItems: 'center',
            paddingBlock: token.paddingSM,
            paddingInline: collapsed ? token.paddingSM : token.paddingMD,
            justifyContent: collapsed ? 'center' : 'flex-start',
            background: sidebarSurface.colorSidebarHeader,
            borderBottom: `${token.lineWidth}px ${token.lineType} ${token.colorSplit}`,
          }}
        >
          <ConnectedSidebarBrand collapsed={collapsed} />
        </div>
        <Flex vertical style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
          <div
            style={{
              flex: 1,
              minHeight: 0,
              overflow: 'auto',
              paddingBlock: token.paddingXXS,
            }}
          >
            <Menu
              theme="dark"
              mode="inline"
              selectedKeys={primarySelectedKeys}
              items={primaryMenuItems}
              onClick={onShellMenuClick}
              style={{ borderInlineEnd: 'none', background: 'transparent' }}
              styles={{
                item: { borderRadius: hydraMenuItemBorderRadius },
              }}
            />
          </div>
          <div style={proposalFooterSurface}>
            <Menu
              theme="dark"
              mode="inline"
              selectedKeys={proposalSelectedKeys}
              items={proposalMenuItems}
              onClick={onShellMenuClick}
              style={{ borderInlineEnd: 'none', background: 'transparent' }}
              styles={{
                item: {
                  borderRadius: hydraMenuItemBorderRadius,
                  color: token.colorTextLightSolid,
                  opacity: 0.92,
                },
              }}
            />
          </div>
        </Flex>
      </div>
      <Button
        type="text"
        aria-expanded={!collapsed}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        onClick={() => setCollapsed((c) => !c)}
        icon={collapsed ? <RightOutlined /> : <LeftOutlined />}
        style={{
          position: 'absolute',
          top: hydraSidebarCollapseTriggerTopPx,
          right: 0,
          zIndex: 2,
          height: token.controlHeightSM,
          minWidth: token.controlHeightSM,
          paddingInline: token.marginXXS,
          paddingBlock: token.paddingXXS,
          background: sidebarSurface.colorSidebar,
          color: token.colorTextLightSolid,
          borderStartStartRadius: token.borderRadiusSM,
          borderEndStartRadius: token.borderRadiusSM,
          borderStartEndRadius: 0,
          borderEndEndRadius: 0,
          boxShadow: token.boxShadowTertiary,
        }}
      />
    </Sider>
  );
}
