import { DownOutlined, GlobalOutlined, PlusOutlined, StarFilled, StarOutlined, UpOutlined } from '@ant-design/icons';
import { useEffect, useMemo, useState, type Key } from 'react';
import type { NavigateFunction } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

import { useActiveProject } from '../context/ActiveProjectContext';
import { useUmbrellaCompany } from '../context/UmbrellaCompanyContext';
import {
  AppSearchInput,
  Alert,
  Button,
  Card,
  Empty,
  Flex,
  Form,
  Input,
  Modal,
  Pagination,
  Space,
  Table,
  Tabs,
  Typography,
  theme,
} from '../ui/antd';
import type { TableColumnsType, TabsProps } from '../ui/antd';

import { shellLayout } from '../theme/hydraAlias';
import { hydraBaseStrong } from '../theme/hydraTypography';
import { PROJECT_SEED_ROWS, type ProjectRow } from './projectSeed';
import { umbrellaProjectWorkspacePath } from './umbrellaCompany';

function hashSeed(key: string): number {
  let h = 0;
  for (let i = 0; i < key.length; i++) {
    h = (h << 5) - h + key.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function takeCount(seed: number, salt: number, min: number, max: number): number {
  const span = max - min + 1;
  return min + (seed + salt * 17) % span;
}

type ProjectPreviewProps = {
  project: ProjectRow;
  companySlug: string;
  navigate: NavigateFunction;
};

type ModuleRow = { title: string; description: string };

const DEMO_STAMP = 'Mar 2, 2025, 9:22 AM';

type ModulePackageCardProps = {
  headerTitle: string;
  headerMeta: string;
  expanded: boolean;
  onToggle: () => void;
  rows: ModuleRow[];
  openModule: () => void;
  openLabel: string;
};

/** Submittal-package reference: white card, blue title + chevron, metadata right, table body. */
function ModulePackageCard({
  headerTitle,
  headerMeta,
  expanded,
  onToggle,
  rows,
  openModule,
  openLabel,
}: ModulePackageCardProps) {
  const { token } = theme.useToken();
  const chevron = expanded ? (
    <UpOutlined style={{ color: token.colorPrimary, fontSize: token.fontSizeSM }} />
  ) : (
    <DownOutlined style={{ color: token.colorPrimary, fontSize: token.fontSizeSM }} />
  );

  const cardChrome = {
    background: token.colorBgContainer,
    borderRadius: token.borderRadiusLG,
    border: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
    boxShadow: token.boxShadowTertiary,
    overflow: 'hidden' as const,
  };

  return (
    <div style={cardChrome}>
      <button
        type="button"
        onClick={onToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: token.marginSM,
          width: '100%',
          textAlign: 'left',
          cursor: 'pointer',
          paddingBlock: token.paddingMD + 2,
          paddingInline: token.paddingLG,
          border: 'none',
          background: token.colorBgContainer,
          fontFamily: 'inherit',
          outline: 'none',
        }}
      >
        {chevron}
        <Typography.Text
          strong
          style={{
            flex: 1,
            margin: 0,
            fontSize: token.fontSizeLG,
            color: token.colorPrimary,
            fontWeight: token.fontWeightStrong,
          }}
        >
          {headerTitle}
        </Typography.Text>
        <Typography.Text
          type="secondary"
          style={{
            margin: 0,
            fontSize: token.fontSizeSM,
            color: token.colorTextSecondary,
            whiteSpace: 'nowrap',
          }}
        >
          {headerMeta}
        </Typography.Text>
      </button>

      {expanded ? (
        <div
          style={{
            borderTop: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
            paddingInline: token.paddingLG + 4,
            paddingBlock: token.paddingLG,
          }}
        >
          <Flex
            align="center"
            style={{
              marginBottom: token.marginSM,
              paddingBottom: token.paddingXS,
              borderBottom: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
              fontSize: token.fontSizeSM,
              fontWeight: token.fontWeightStrong,
              color: token.colorTextSecondary,
              textTransform: 'uppercase' as const,
              letterSpacing: 0.04,
            }}
          >
            <span style={{ width: 44, flexShrink: 0 }}>Thumb</span>
            <span style={{ flex: 1, paddingInline: token.paddingSM }}>Name</span>
            <span style={{ width: 140, flexShrink: 0 }}>Notes</span>
            <span style={{ width: 88, flexShrink: 0, textAlign: 'right' }}>Actions</span>
          </Flex>
          {rows.map((row, i) => (
            <Flex
              key={`${row.title}-${i}`}
              align="center"
              gap={token.marginSM}
              style={{
                paddingBlock: token.paddingSM,
                borderBottom:
                  i < rows.length - 1
                    ? `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`
                    : undefined,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  flexShrink: 0,
                  borderRadius: token.borderRadiusSM,
                  background: token.colorFillSecondary,
                  border: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
                }}
              />
              <div style={{ flex: 1, minWidth: 0, paddingInline: token.paddingXS }}>
                <Typography.Text strong style={{ display: 'block', fontSize: token.fontSize }}>
                  {row.title}
                </Typography.Text>
                <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                  {row.description}
                </Typography.Text>
              </div>
              <Typography.Text
                type="secondary"
                style={{ width: 140, flexShrink: 0, fontSize: token.fontSizeSM }}
              >
                Sample
              </Typography.Text>
              <div style={{ width: 88, flexShrink: 0, textAlign: 'right' }}>
                <Button type="link" size="small" onClick={openModule} style={{ paddingInline: token.paddingXXS }}>
                  {openLabel}
                </Button>
              </div>
            </Flex>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/** Sample module breakdown for expanded project row (deterministic from project key). */
function ProjectWorkspacePreview({ project, companySlug, navigate }: ProjectPreviewProps) {
  const { token } = theme.useToken();
  const pid = project.key;
  const s = hashSeed(pid);
  const basePath = `/${companySlug}/projects/${pid}`;

  const seisPool = [
    'Zone A · lateral bracing',
    'Stair 2 · riser run',
    'Roof MEP · dunnage layout',
    'Level 1 · storefront lateral',
    'Penthouse · mech screen wall',
  ];
  const seisCount = takeCount(s, 1, 1, 5);
  const seisItems = seisPool.slice(0, seisCount);

  const bomPool = [
    'Mechanical Piping v2',
    'Electrical rough-in',
    'Structural steel takeoff',
    'HVAC punch list',
  ];
  const bomCount = takeCount(s, 2, 1, 4);
  const bomItems = bomPool.slice(0, bomCount);

  const submittalPool = [
    'Rev 2 · HVAC cut sheets',
    'Lighting & controls package',
    'Accessories addendum',
    'Door hardware set · Div 8',
  ];
  const subCount = takeCount(s, 3, 1, 4);
  const submittalItems = submittalPool.slice(0, subCount);

  const specPool = ['Division 23 binder', 'Seismic load summary', 'Alternate A · bracing notes'];
  const specCount = takeCount(s, 4, 1, 3);
  const specItems = specPool.slice(0, specCount);

  const contentPool = ['Shared folder · RFIs', 'ASI-04 attachments', 'O&M draft packet'];
  const contentCount = takeCount(s, 5, 1, 3);
  const contentItems = contentPool.slice(0, contentCount);

  const openSeis = () => navigate(`${basePath}/seis-brace`);
  const openBom = () => navigate('/bom');
  const openSub = () => navigate(`${basePath}/submittal`);
  const openSpec = () => navigate(`${basePath}/sales-brace`);
  const openContent = () => navigate(`${basePath}/content`);

  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => ({
    seis: true,
    bom: true,
    packages: true,
    spec: true,
    content: true,
  }));

  const toggle = (key: string) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toRows = (titles: string[], desc: string): ModuleRow[] =>
    titles.map((title) => ({ title, description: desc }));

  const packages = [
    {
      panelKey: 'seis',
      headerTitle: 'SeisBrace',
      headerMeta: `${seisItems.length} design${seisItems.length === 1 ? '' : 's'} · ${DEMO_STAMP}`,
      rows: toRows(seisItems, 'Stub · last saved 2d ago'),
      openModule: openSeis,
      openLabel: 'Open',
    },
    {
      panelKey: 'bom',
      headerTitle: 'BOM',
      headerMeta: `${bomItems.length} run${bomItems.length === 1 ? '' : 's'} · ${DEMO_STAMP}`,
      rows: toRows(bomItems, 'Matching status · sample'),
      openModule: openBom,
      openLabel: 'Open',
    },
    {
      panelKey: 'packages',
      headerTitle: 'Submittal packages',
      headerMeta: `${submittalItems.length} package${submittalItems.length === 1 ? '' : 's'} · ${DEMO_STAMP}`,
      rows: toRows(submittalItems, 'PDFs queued · sample'),
      openModule: openSub,
      openLabel: 'Open',
    },
    {
      panelKey: 'spec',
      headerTitle: 'Spec',
      headerMeta: `${specItems.length} item${specItems.length === 1 ? '' : 's'} · ${DEMO_STAMP}`,
      rows: toRows(specItems, 'Spec workspace · sample'),
      openModule: openSpec,
      openLabel: 'Open',
    },
    {
      panelKey: 'content',
      headerTitle: 'Content',
      headerMeta: `${contentItems.length} bundle${contentItems.length === 1 ? '' : 's'} · ${DEMO_STAMP}`,
      rows: toRows(contentItems, 'Downloads & files · sample'),
      openModule: openContent,
      openLabel: 'Open',
    },
  ];

  return (
    <div
      style={{
        paddingBlock: token.paddingLG,
        paddingInline: token.paddingMD,
        paddingInlineStart: token.paddingLG,
        background: 'rgba(251, 251, 251, 1)',
        color: 'rgba(0, 0, 0, 1)',
      }}
    >
      <Flex vertical gap={token.marginMD} style={{ width: '100%' }}>
        {packages.map((p) => (
          <ModulePackageCard
            key={p.panelKey}
            headerTitle={p.headerTitle}
            headerMeta={p.headerMeta}
            expanded={expanded[p.panelKey] ?? false}
            onToggle={() => toggle(p.panelKey)}
            rows={p.rows}
            openModule={p.openModule}
            openLabel={p.openLabel}
          />
        ))}
      </Flex>
    </div>
  );
}

/** Unified Projects hub at `/:companySlug/projects` — module-agnostic Umbrella screen. */
export function ShellHomeContent() {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const { companySlug, companyLabel } = useUmbrellaCompany();
  const { setProjectId } = useActiveProject();
  const [tab, setTab] = useState<string>('all');
  const [starredKeys, setStarredKeys] = useState<Set<string>>(() => new Set(['1', '3']));
  const [rows, setRows] = useState<ProjectRow[]>(() => [...PROJECT_SEED_ROWS]);
  const [projectsPage, setProjectsPage] = useState(1);
  const [searchText, setSearchText] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm] = Form.useForm();
  const [expandedRowKeys, setExpandedRowKeys] = useState<Key[]>([]);

  const toggleStar = (key: string) => {
    setStarredKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const filteredRows = useMemo(() => {
    let list = rows;
    if (tab === 'recent') list = list.filter((r) => r.recent);
    if (tab === 'starred') list = list.filter((r) => starredKeys.has(r.key));
    const q = searchText.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.address.toLowerCase().includes(q) ||
          r.city.toLowerCase().includes(q) ||
          r.state.toLowerCase().includes(q),
      );
    }
    return list.map((r) => ({ ...r, starred: starredKeys.has(r.key) }));
  }, [rows, tab, starredKeys, searchText]);

  useEffect(() => {
    setProjectsPage(1);
  }, [tab, searchText, filteredRows.length]);

  useEffect(() => {
    setExpandedRowKeys([]);
  }, [projectsPage, tab, searchText]);

  const pagedProjectRows = useMemo(() => {
    const start = (projectsPage - 1) * shellLayout.tablePageSizeDefault;
    return filteredRows.slice(start, start + shellLayout.tablePageSizeDefault);
  }, [filteredRows, projectsPage]);

  const tabItems: TabsProps['items'] = [
    { key: 'all', label: 'All' },
    { key: 'recent', label: 'Recent' },
    { key: 'starred', label: 'Starred' },
  ];

  const columns: TableColumnsType<ProjectRow & { starred: boolean }> = [
    {
      key: 'star',
      width: token.controlHeightLG,
      align: 'center',
      render: (_, record) => (
        <Button
          type="text"
          icon={
            record.starred ? (
              <StarFilled style={{ color: token.colorWarning }} />
            ) : (
              <StarOutlined style={{ color: token.colorTextSecondary }} />
            )
          }
          onClick={(e) => {
            e.stopPropagation();
            toggleStar(record.key);
          }}
          aria-label={record.starred ? 'Remove star' : 'Star project'}
        />
      ),
    },
    {
      title: 'Project Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <Typography.Text strong>{name}</Typography.Text>,
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: 'City',
      dataIndex: 'city',
      key: 'city',
    },
    {
      title: 'State',
      dataIndex: 'state',
      key: 'state',
      width: token.controlHeightSM * 2,
    },
    {
      title: 'Last Opened',
      dataIndex: 'lastOpened',
      key: 'lastOpened',
      align: 'right',
    },
  ];

  const hasAnyProjects = rows.length > 0;
  const showEmpty = !hasAnyProjects;
  const showNoMatches = hasAnyProjects && filteredRows.length === 0;
  const starredEmpty = tab === 'starred' && hasAnyProjects && filteredRows.length === 0 && searchText.trim() === '';

  const listPanelStyle = {
    background: token.colorBgContainer,
    borderRadius: token.borderRadiusLG,
    boxShadow: token.boxShadowTertiary,
    overflow: 'hidden' as const,
  };

  return (
    <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
      <Flex justify="space-between" align="flex-start" wrap="wrap" gap={token.margin}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Typography.Text type="secondary" style={{ display: 'block', marginBottom: token.marginXXS }}>
            {companyLabel} · unified hub
          </Typography.Text>
          <Typography.Title level={3} style={{ margin: 0 }}>
            Projects
          </Typography.Title>
          <Typography.Paragraph type="secondary" style={{ margin: `${token.marginXXS}px 0 0`, maxWidth: 720 }}>
            Every job site listed here is shared by SeisBrace, Submittal, Content, BOM, and Spec. Browse the product
            catalog without a project — when you download or package items, you will choose which project to
            associate them with.
          </Typography.Paragraph>
          <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM, display: 'block', marginTop: token.marginXS }}>
            Canonical path (demo): /{companySlug}/projects
          </Typography.Text>
        </div>
        <Flex gap={token.marginSM} wrap="wrap" style={{ flexShrink: 0 }}>
          <Button type="default" size="large" icon={<GlobalOutlined />} onClick={() => navigate('/catalog')}>
            Browse catalog
          </Button>
          <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
            Create project
          </Button>
        </Flex>
      </Flex>

      <Alert
        type="info"
        showIcon
        message="Pick a job site once — it follows you across tools"
        description="After you choose a project, work in SeisBrace, Submittal, Content, BOM, or Spec; your project stays selected as you move between modules. Expand a row below to preview what is on file for that job site, then open a module."
        style={{ width: '100%' }}
      />

      <Card styles={{ body: { padding: 0 } }} style={listPanelStyle}>
        <div style={{ padding: token.paddingLG, paddingBottom: token.paddingMD }}>
          <AppSearchInput
            allowClear
            placeholder="Search by name, address, city, or state…"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: '100%', marginBottom: token.marginMD }}
          />
          <Tabs activeKey={tab} items={tabItems} onChange={setTab} />
        </div>

        {showEmpty ? (
          <div style={{ padding: `${token.paddingLG * 2}px ${token.paddingLG}px` }}>
            <Empty
              description={
                <Space orientation="vertical" size={token.marginXS}>
                  <Typography.Text strong>No projects found</Typography.Text>
                  <Typography.Text type="secondary">Create your first project to get started.</Typography.Text>
                </Space>
              }
            >
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
                Create project
              </Button>
            </Empty>
          </div>
        ) : showNoMatches ? (
          <div style={{ padding: `${token.paddingLG * 2}px ${token.paddingLG}px` }}>
            <Empty
              description={
                <Space orientation="vertical" size={token.marginXS}>
                  <Typography.Text strong>
                    {starredEmpty ? 'No starred projects yet' : 'No projects match your filter'}
                  </Typography.Text>
                  <Typography.Text type="secondary">
                    {starredEmpty
                      ? 'Star a project from the table to pin it here.'
                      : 'Try another search term or clear filters.'}
                  </Typography.Text>
                </Space>
              }
            >
              <Button
                onClick={() => {
                  setSearchText('');
                  setTab('all');
                }}
              >
                {starredEmpty ? 'View all projects' : 'Clear filters'}
              </Button>
            </Empty>
          </div>
        ) : (
          <>
            <Table<ProjectRow & { starred: boolean }>
              rowKey="key"
              pagination={false}
              columns={columns}
              dataSource={pagedProjectRows}
              expandable={{
                expandedRowRender: (record) => (
                  <ProjectWorkspacePreview project={record} companySlug={companySlug} navigate={navigate} />
                ),
                expandedRowKeys,
                onExpandedRowsChange: (keys) => {
                  const next = [...keys].map(String);
                  const prevArr = expandedRowKeys.map(String);
                  const opened = next.filter((k) => !prevArr.includes(k));
                  if (opened.length > 0) {
                    setProjectId(opened[opened.length - 1]);
                  }
                  setExpandedRowKeys([...keys]);
                },
                expandRowByClick: true,
              }}
              styles={{
                header: {
                  cell: {
                    color: token.colorTextDescription,
                    fontWeight: hydraBaseStrong.fontWeight,
                  },
                },
              }}
            />
            <Flex justify="flex-end" style={{ padding: token.paddingLG, paddingTop: token.paddingMD }}>
              <Pagination
                current={projectsPage}
                pageSize={shellLayout.tablePageSizeDefault}
                total={filteredRows.length}
                onChange={setProjectsPage}
                showSizeChanger={false}
              />
            </Flex>
          </>
        )}
      </Card>

      <Modal
        title="Create construction project"
        open={createOpen}
        onCancel={() => {
          setCreateOpen(false);
          createForm.resetFields();
        }}
        footer={null}
        destroyOnClose
      >
        <Form
          layout="vertical"
          form={createForm}
          onFinish={(values: { name: string; client?: string; city?: string; state?: string }) => {
            const key = `p-${Date.now()}`;
            setRows((prev) => [
              {
                key,
                name: values.name,
                address: values.client ? `${values.client} HQ` : 'TBD',
                city: values.city || 'TBD',
                state: values.state || '—',
                lastOpened: 'Just now',
                recent: true,
              },
              ...prev,
            ]);
            setCreateOpen(false);
            createForm.resetFields();
            navigate(umbrellaProjectWorkspacePath(companySlug, key, 'content'));
          }}
        >
          <Form.Item label="Project name" name="name" rules={[{ required: true, message: 'Enter a project name' }]}>
            <Input placeholder="Downtown Office Tower" />
          </Form.Item>
          <Form.Item label="Client" name="client">
            <Input placeholder="ABC Corp" />
          </Form.Item>
          <Form.Item label="City" name="city">
            <Input placeholder="Chicago" />
          </Form.Item>
          <Form.Item label="State / region" name="state">
            <Input placeholder="IL" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Create
              </Button>
              <Button
                onClick={() => {
                  setCreateOpen(false);
                  createForm.resetFields();
                }}
              >
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
