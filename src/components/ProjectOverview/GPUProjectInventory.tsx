import * as React from 'react';
import {
  useK8sWatchResource,
  InventoryItem,
  InventoryItemTitle,
  InventoryItemLoading,
} from '@openshift-console/dynamic-plugin-sdk';
import { Pod } from '../../resources';
import { useTranslation } from '../../i18n';

const GPUProjectInventory: React.FC<{ projectName: string }> = ({ projectName }) => {
  const { t } = useTranslation();
  const [pods, loaded, loadError] = useK8sWatchResource<Pod[]>({
    groupVersionKind: {
      kind: 'Pod',
      version: 'v1',
    },
    namespace: projectName,
    isList: true,
  });

  const gpuPods = pods.filter((p) =>
    p.spec?.containers?.some((c) => !!c.resources?.requests?.['nvidia.com/gpu']),
  );

  let title: React.ReactNode = t('{{count}} GPU pod', { count: gpuPods.length });
  if (loadError) {
    title = t('GPU pods');
  } else if (!loaded) {
    title = (
      <>
        <InventoryItemLoading />
        {t('GPU pods')}
      </>
    );
  }

  return (
    <InventoryItem>
      <InventoryItemTitle>{title}</InventoryItemTitle>
    </InventoryItem>
  );
};

export default GPUProjectInventory;
