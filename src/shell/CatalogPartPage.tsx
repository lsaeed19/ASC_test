import { useParams } from 'react-router-dom';

import { useCatalogSelection } from '../context/CatalogSelectionContext';
import { catalogPartByKey } from '../catalog/catalogDemoData';
import { PageBackButton } from './PageBackButton';
import { hydraSmallNormal, hydraTextStyleToReactCss } from '../theme/hydraTypography';
import {
  App,
  Button,
  Descriptions,
  Flex,
  Space,
  Tooltip,
  Typography,
  theme,
} from '../ui/antd';

/**
 * Single part page: quick download without a project; submittal lines use global selection + header drawer gate.
 */
export function CatalogPartPage() {
  const { token } = theme.useToken();
  const { message } = App.useApp();
  const { partId } = useParams<{ partId: string }>();
  const { addStaged, openSelectionDrawer } = useCatalogSelection();

  const part = partId ? catalogPartByKey(partId) : undefined;
  const label = part?.sku ?? partId ?? '—';
  const partTitle = part?.description ?? `Part ${label}`;
  const titleLine = part ? `${part.sku} — ${part.description}` : '';

  const addCurrentToSelection = (): 'added' | 'duplicate' => {
    if (!part) return 'duplicate';
    return addStaged({
      partKey: part.key,
      partSku: part.sku,
      title: titleLine,
    });
  };

  const onAddToSelection = () => {
    const outcome = addCurrentToSelection();
    if (outcome === 'duplicate') {
      message.info('This part is already in your selection.');
    } else {
      message.success('Added to selection.');
    }
  };

  const onQueueForSubmittal = () => {
    if (!part) return;
    const outcome = addCurrentToSelection();
    if (outcome === 'duplicate') {
      message.info('Already in your selection — opening it so you can pick a project.');
    }
    openSelectionDrawer();
  };

  return (
    <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
      <PageBackButton to="/catalog/results?q=all">Back to results</PageBackButton>
      <Typography.Title level={3} style={{ margin: 0 }}>
        {partTitle}
      </Typography.Title>
      <Typography.Paragraph type="secondary" style={{ margin: 0 }}>
        The cut sheet PDF for this part can be added to a <Typography.Text strong>submittal package</Typography.Text>{' '}
        under a project. Use <Typography.Text strong>Selection</Typography.Text> in the header to review items and
        choose a project when you are ready — canceling that step keeps your list until you attach or clear it.
      </Typography.Paragraph>

      <Descriptions column={1} size="small" bordered styles={{ label: { width: token.controlHeight * 5 } }}>
        <Descriptions.Item label="SKU">{label}</Descriptions.Item>
        <Descriptions.Item label="Document">Cut sheet PDF (stub)</Descriptions.Item>
      </Descriptions>

      <Flex wrap="wrap" gap={token.margin} align="center">
        <Tooltip title="Downloads immediately. No project required.">
          <Button onClick={() => message.info('Stub: file would download now.')}>Quick download</Button>
        </Tooltip>
        <Tooltip title="Adds to your catalog selection without opening the drawer.">
          <Button onClick={onAddToSelection} disabled={!part}>
            Add to selection
          </Button>
        </Tooltip>
        <Tooltip title="Adds if needed, then opens Selection so you can choose a project.">
          <Button type="primary" onClick={onQueueForSubmittal} disabled={!part}>
            Pick project for submittal…
          </Button>
        </Tooltip>
      </Flex>
      <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraSmallNormal)}>
        Quick download: no project. Submittal: staged globally, then one explicit project step in the Selection
        drawer.
      </Typography.Text>
    </Space>
  );
}
