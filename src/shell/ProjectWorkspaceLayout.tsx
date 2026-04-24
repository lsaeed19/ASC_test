import {
  AppstoreOutlined,
  FilePdfOutlined,
  FileTextOutlined,
  FolderOpenOutlined,
  LeftOutlined,
} from '@ant-design/icons';
import { useEffect, useMemo } from 'react';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';

import { useSubmittalDraft } from '../context/SubmittalDraftContext';
import { Badge, Button, Flex, Layout, Menu, Typography, theme } from '../ui/antd';
import type { MenuProps } from '../ui/antd';

import { hydraMenuItemBorderRadius } from '../theme/hydraMenuMetrics';
import { shellLayout } from '../theme/hydraAlias';
import { setLastScopedProjectId } from './lastProjectScope';
import { projectTitleById } from './projectSeed';

const { Sider, Content } = Layout;

type ModuleKey = 'seis-brace' | 'sales-brace' | 'submittal' | 'content';

function moduleFromPath(pathname: string): ModuleKey {
  if (pathname.includes('/seis-brace')) return 'seis-brace';
  if (pathname.includes('/sales-brace')) return 'sales-brace';
  if (pathname.includes('/submittal')) return 'submittal';
  return 'content';
}

/** In-project module rail — nested under a selected project (Umbrella workspace). */
export function ProjectWorkspaceLayout() {
  const { token } = theme.useToken();
  const { projectId = '', companySlug = '' } = useParams<{ projectId: string; companySlug: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { countForProject } = useSubmittalDraft();
  const base = `/${companySlug}/projects/${projectId}`;
  const title = projectTitleById(projectId) ?? 'Project';
  const selected = moduleFromPath(location.pathname);
  const submittalCount = countForProject(projectId);

  useEffect(() => {
    if (projectId) setLastScopedProjectId(projectId);
  }, [projectId]);

  const items: MenuProps['items'] = useMemo(
    () => [
      {
        key: 'seis-brace',
        icon: <AppstoreOutlined />,
        label: 'SeisBrace',
      },
      {
        key: 'submittal',
        icon: <FilePdfOutlined />,
        label: (
          <Flex align="center" gap={token.marginXS} style={{ width: '100%' }}>
            <span>Submittal manager</span>
            {submittalCount > 0 ? (
              <Badge count={submittalCount} size="small" color={token.colorPrimary} />
            ) : null}
          </Flex>
        ),
      },
      {
        key: 'content',
        icon: <FolderOpenOutlined />,
        label: 'Content',
      },
      {
        key: 'sales-brace',
        icon: <FileTextOutlined />,
        label: 'Spec',
      },
    ],
    [submittalCount, token.colorPrimary, token.marginXS],
  );

  return (
    <Layout style={{ minHeight: '100%', background: 'transparent' }}>
      <Sider
        width={shellLayout.siderWidth}
        theme="light"
        style={{
          background: token.colorFillAlter,
          borderInlineEnd: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
        }}
      >
        <div style={{ padding: token.paddingLG }}>
          <Button
            type="text"
            size="small"
            icon={<LeftOutlined />}
            onClick={() => navigate(`/${companySlug}/projects`)}
            style={{ marginBottom: token.marginXS, padding: 0, height: 'auto' }}
          >
            All projects
          </Button>
          <Typography.Text strong>{title}</Typography.Text>
          <Typography.Paragraph type="secondary" style={{ marginBottom: 0, marginTop: token.marginXXS }}>
            Open a module — your project context stays the same
          </Typography.Paragraph>
        </div>
        <Menu
          mode="inline"
          selectable
          selectedKeys={[selected]}
          style={{ borderInlineEnd: 'none', background: 'transparent' }}
          items={items}
          onClick={({ key }) => navigate(`${base}/${key}`)}
          styles={{
            item: { borderRadius: hydraMenuItemBorderRadius },
          }}
        />
      </Sider>
      <Content style={{ paddingInlineStart: token.paddingLG, minHeight: shellLayout.contentMinHeight }}>
        <Outlet />
      </Content>
    </Layout>
  );
}
