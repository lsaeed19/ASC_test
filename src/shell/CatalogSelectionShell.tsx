import { ShoppingCartOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useCatalogSelection } from '../context/CatalogSelectionContext';
import { useSubmittalDraft } from '../context/SubmittalDraftContext';
import { useUmbrellaCompany } from '../context/UmbrellaCompanyContext';
import { PROJECT_SEED_ROWS } from './projectSeed';
import {
  App,
  Badge,
  Button,
  Drawer,
  Flex,
  List,
  Modal,
  Popconfirm,
  Select,
  Space,
  Typography,
  theme,
} from '../ui/antd';

/**
 * Global catalog selection: drawer review + batch “choose project” before submittal attach.
 * Staging survives canceling the attach modal; use “Remove all” to discard.
 */
export function CatalogSelectionChrome() {
  const { token } = theme.useToken();
  const { message } = App.useApp();
  const navigate = useNavigate();
  const { companySlug } = useUmbrellaCompany();
  const { addLine } = useSubmittalDraft();
  const {
    stagedItems,
    stagedCount,
    drawerOpen,
    setDrawerOpen,
    removeStaged,
    clearStaging,
  } = useCatalogSelection();

  const [attachOpen, setAttachOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>(
    PROJECT_SEED_ROWS[0]?.key,
  );

  useEffect(() => {
    if (stagedCount === 0) {
      setDrawerOpen(false);
      setAttachOpen(false);
    }
  }, [stagedCount, setDrawerOpen]);

  useEffect(() => {
    if (stagedCount === 0) return;
    if (attachOpen && selectedProjectId === undefined && PROJECT_SEED_ROWS[0]) {
      setSelectedProjectId(PROJECT_SEED_ROWS[0].key);
    }
  }, [attachOpen, selectedProjectId, stagedCount]);

  const openAttachModal = () => {
    setSelectedProjectId(PROJECT_SEED_ROWS[0]?.key);
    setAttachOpen(true);
  };

  const confirmAddToSubmittal = () => {
    if (!selectedProjectId) {
      message.warning('Choose a project to continue.');
      return;
    }
    const projectName =
      PROJECT_SEED_ROWS.find((p) => p.key === selectedProjectId)?.name ?? 'project';
    for (const row of stagedItems) {
      addLine(selectedProjectId, {
        partKey: row.partKey,
        partSku: row.partSku,
        title: row.title,
      });
    }
    message.success(
      `${stagedItems.length} cut sheet${stagedItems.length === 1 ? '' : 's'} attached to ${projectName}.`,
    );
    clearStaging();
    setAttachOpen(false);
    setDrawerOpen(false);
    navigate(`/${companySlug}/projects/${selectedProjectId}/submittal`);
  };

  const stubDownloadPackage = () => {
    message.info('Stub: a ZIP would generate here after you pick a project in production.');
  };

  if (stagedCount === 0) {
    return null;
  }

  return (
    <>
      <Drawer
        title="Your selection"
        placement="right"
        width={420}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        extra={
          <Popconfirm
            title="Remove all parts from this selection?"
            okText="Remove all"
            cancelText="Keep"
            onConfirm={() => {
              clearStaging();
              setDrawerOpen(false);
            }}
          >
            <Button size="small" danger type="link" style={{ padding: 0 }}>
              Remove all
            </Button>
          </Popconfirm>
        }
      >
        <Space orientation="vertical" size={token.margin} style={{ width: '100%' }}>
          <Typography.Paragraph type="secondary" style={{ margin: 0 }}>
            Submittals are organized per project. Choose a project when you are ready — canceling that step
            keeps this list so you can switch projects or add more rows first.
          </Typography.Paragraph>
          <List
            bordered
            dataSource={stagedItems}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Button key="rm" type="link" size="small" onClick={() => removeStaged(item.id)}>
                    Remove
                  </Button>,
                ]}
              >
                <List.Item.Meta title={item.title} description={`Cut sheet · ${item.partSku}`} />
              </List.Item>
            )}
          />
          <Flex wrap="wrap" gap={token.marginSM}>
            <Button type="primary" onClick={openAttachModal}>
              Choose project…
            </Button>
          </Flex>
        </Space>
      </Drawer>

      <Modal
        title="Attach selection to a project"
        open={attachOpen}
        onCancel={() => setAttachOpen(false)}
        destroyOnClose
        footer={
          <Flex justify="flex-end" wrap="wrap" gap={token.marginSM}>
            <Button onClick={() => setAttachOpen(false)}>Cancel</Button>
            <Button onClick={stubDownloadPackage}>Download package (stub)</Button>
            <Button type="primary" onClick={confirmAddToSubmittal}>
              Add to submittal &amp; open
            </Button>
          </Flex>
        }
      >
        <Space orientation="vertical" size={token.margin} style={{ width: '100%' }}>
          <Typography.Paragraph style={{ margin: 0 }}>
            {stagedItems.length} PDF line{stagedItems.length === 1 ? '' : 's'} will be added to the submittal
            draft for the project you pick. You can switch projects below before confirming.
          </Typography.Paragraph>
          <div>
            <Typography.Text type="secondary" style={{ display: 'block', marginBottom: token.marginXS }}>
              Project
            </Typography.Text>
            <Select
              style={{ width: '100%' }}
              placeholder="Select a project"
              value={selectedProjectId}
              onChange={setSelectedProjectId}
              options={PROJECT_SEED_ROWS.map((p) => ({ value: p.key, label: p.name }))}
            />
          </div>
        </Space>
      </Modal>
    </>
  );
}

export function CatalogSelectionTopBarButton() {
  const { token } = theme.useToken();
  const { stagedCount, setDrawerOpen } = useCatalogSelection();
  const onPrimary = token.colorTextLightSolid;

  if (stagedCount === 0) return null;

  return (
    <Badge count={stagedCount} size="small" offset={[-2, 2]}>
      <Button
        type="text"
        icon={<ShoppingCartOutlined />}
        onClick={() => setDrawerOpen(true)}
        style={{
          color: onPrimary,
          display: 'flex',
          alignItems: 'center',
          gap: token.marginXXS,
          paddingInline: token.paddingSM,
        }}
        aria-label={`Catalog selection, ${stagedCount} items`}
      >
        <Typography.Text
          style={{
            color: onPrimary,
            maxWidth: 140,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          Selection
        </Typography.Text>
      </Button>
    </Badge>
  );
}
