import { ChartBar, ChartStack, ChartThemeColor, ChartTooltip } from '@patternfly/react-charts';
import {
  Card,
  CardBody,
  CardHeader,
  Skeleton,
  Split,
  SplitItem,
  Badge,
  Brand,
  Stack,
  StackItem,
  CardTitle,
} from '@patternfly/react-core';
import * as React from 'react';
import { humanizeBinaryBytes } from '../../../utils/units';
import { useGPUNode } from '../../../hooks/use-gpus-info';
import { useTranslation } from 'react-i18next';
import { i18nNs } from '../../../i18n';
import { GPUDashboardContext } from '../GPUDashboardContext';
import NotAvailable from '../../NotAvailable';
import { useRefWidth } from '../../../hooks/use-ref-width';
import { getMIGStrategy, getMixedMIGTypes } from '../../../utils/mig';

import nvidiaLogo from '../../../../icons/Nvidia_logo.svg';
import './MIGCard.css';

const MIGCard = () => {
  const { t } = useTranslation(i18nNs);
  const { gpusLoading, selectedGPU, gpusError, gpus } = React.useContext(GPUDashboardContext);
  const [gpuNode, gpuNodeLoaded, gpuNodeError] = useGPUNode(selectedGPU);
  const [containerRef, width] = useRefWidth();

  const loading = gpusLoading || !gpuNodeLoaded;
  const error = !loading && (gpusError || gpuNodeError || !selectedGPU);

  const chartBars = [];

  let multiInstance = false;
  const migStrategy = getMIGStrategy(gpuNode);

  if (migStrategy === 'mixed') {
    const migTypes = gpuNode ? getMixedMIGTypes(gpuNode) : {};

    multiInstance = Object.keys(migTypes).length > 1;

    Object.keys(migTypes).forEach((key) => {
      for (let i = 0; i < migTypes[key].count / gpus.length; i++) {
        chartBars.push(
          <ChartBar
            alignment="middle"
            key={key}
            data={[
              {
                name: `Instance ${i + 1}`,
                x: '0',
                y: migTypes?.[key]?.memory,
                label: `Instance size: ${
                  humanizeBinaryBytes(migTypes?.[key]?.memory as number, 'MiB').string
                }`,
              },
            ]}
            barWidth={15}
            padding={0}
          />,
        );
      }
    });
  } else {
    const count = gpuNode?.metadata?.labels?.['nvidia.com/gpu.count'];
    const memory = gpuNode?.metadata?.labels?.['nvidia.com/gpu.memory'];
    if (count && memory) {
      multiInstance = parseInt(count) > 1;
      for (let i = 0; i < parseInt(count) / gpus.length; i++) {
        chartBars.push(
          <ChartBar
            key={i}
            data={[
              {
                name: `Instance ${i + 1}`,
                x: '0',
                y: memory,
                label: `Instance size: ${humanizeBinaryBytes(parseInt(memory), 'MiB').string}`,
              },
            ]}
            barWidth={15}
            padding={0}
          />,
        );
      }
    }
  }

  return (
    <Card className="ng-mig-card ng-mig-card--full-height">
      {error ? (
        <CardBody className="ng-mig-card--full-height">
          <NotAvailable />
        </CardBody>
      ) : (
        <>
          <CardHeader>
            {loading ? (
              <Skeleton screenreaderText={t('Loading card content')} width="30%" />
            ) : (
              <Split hasGutter>
                <SplitItem>
                  <Brand src={nvidiaLogo} alt="Nvidia logo" className="ng-mig-card__logo" />
                </SplitItem>
                <SplitItem>
                  <Stack>
                    <StackItem>
                      <Split hasGutter>
                        <SplitItem>
                          <CardTitle>{selectedGPU?.modelName}</CardTitle>
                        </SplitItem>
                        <SplitItem>
                          <Badge isRead>
                            {multiInstance ? t('Multi-instance') : t('Single-instance')}
                          </Badge>
                        </SplitItem>
                      </Split>
                    </StackItem>
                    {migStrategy && <StackItem>{`${t('MIG strategy')}: ${migStrategy}`}</StackItem>}
                  </Stack>
                </SplitItem>
              </Split>
            )}
          </CardHeader>
          <CardBody>
            <div ref={containerRef} className="ng-mig-card__chart">
              {loading ? (
                <Skeleton screenreaderText={t('Loading card content')} />
              ) : (
                <ChartStack
                  horizontal
                  padding={0}
                  height={15}
                  themeColor={ChartThemeColor.multiUnordered}
                  width={width}
                  labelComponent={<ChartTooltip />}
                >
                  {chartBars}
                </ChartStack>
              )}
            </div>
          </CardBody>
        </>
      )}
    </Card>
  );
};

export default MIGCard;
