import * as React from 'react';
import {
  Alert,
  AlertVariant,
  Flex,
  FlexItem,
  Gallery,
  Page,
  PageSection,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { useAllGPUsInfo } from '../utils/gpuInfo';

import './GPUDashboard.css';
import { GPUInfoCard } from './GPUInfoCard';
import { GPUDropdown } from './GPUDropdown';
import { GPUDashboardCard } from './GPUDashboardCard';
import { GPUDashboardCardInfo } from './GPUDashboardCardInfo';

/* Chaotic list of TODOs:
  - Add "New" badge in gpu-dashboard nav item - replace string by a component in console-extensions.json
  - add GPU Info component (with its details)
  - tune polling interval
  - card sizes on different displayes
  - tune thresholds
  - read maximum for non-percentage metrics (use either GPU-info or find maximum over all-time Prometheus data)
*/

// https://issues.redhat.com/browse/MGMT-9263
// https://miro.com/app/board/uXjVOeUB2B4=/?moveToWidget=3458764514332229879&cot=14

// https://gcsweb-ci.apps.ci.l2s4.p1.openshiftapps.com/gcs/origin-ci-test/logs/periodic-ci-rh-ecosystem-edge-ci-artifacts-master-4.10-nvidia-gpu-operator-e2e-master/1510754193349021696/artifacts/nvidia-gpu-operator-e2e-master/nightly/artifacts/010__gpu_operator__wait_deployment/metrics.dcgm.txt

const GPUDashboard: React.FC = () => {
  const { t } = useTranslation('plugin__console-plugin-nvidia-gpu');
  const [gpus, gpusError, gpusLoading] = useAllGPUsInfo();
  const [gpuUuid, setGpuUuid] = React.useState<string>(); // GPU-43d4af7b-4cbb-1577-c1d4-e908416fda4a , GPU-a458dc79-5837-1cd9-120f-99a4c1e0cb66

  const loading = !gpuUuid;
  const selectedGpu = gpus?.find((gpuInfo) => gpuInfo.uuid === gpuUuid);

  React.useEffect(() => {
    if (!gpuUuid && gpus?.length) {
      setGpuUuid(gpus[0].uuid);
    }
  }, [gpus]);

  return (
    <Page>
      <PageSection isFilled>
        <Stack hasGutter>
          <StackItem>
            {gpusError && (
              <Alert
                variant={AlertVariant.danger}
                title={t('Failed to get info about GPUs')}
                isInline
              >
                {gpusError}
              </Alert>
            )}
            {!gpusLoading && gpus?.length === 0 && (
              <Alert variant={AlertVariant.info} title={t('No GPU detected')} isInline>
                {t('No GPU can be found in the cluster.')}
              </Alert>
            )}
          </StackItem>
          <StackItem>
            <Title headingLevel="h1">{t('GPUs')}</Title>
          </StackItem>
          <StackItem>
            <Flex>
              <FlexItem>
                <GPUInfoCard selectedGpu={selectedGpu} />
              </FlexItem>
              <FlexItem align={{ default: 'alignRight' }}>
                <GPUDropdown
                  gpus={gpus}
                  onSelect={setGpuUuid}
                  selectedUuid={gpuUuid}
                  className="gpu-dashboard__dropdown-gpus"
                />
              </FlexItem>
            </Flex>
          </StackItem>
          <StackItem>
            <Gallery hasGutter>
              <GPUDashboardCard
                title={t('GPU utilization')}
                ariaTitle={t('Donut GPU utilization')}
                rangeTitle={t('GPU utilization over time')}
                rangeDescription={t('Sparkline GPU utilization')}
                actualQuery={`DCGM_FI_DEV_GPU_UTIL{UUID="${gpuUuid}"}`}
                timeQuery={`avg_over_time(DCGM_FI_DEV_GPU_UTIL{UUID="${gpuUuid}"}[5m])[60m:5m]`}
                unit="%"
                maxDomain={100}
                info={
                  <GPUDashboardCardInfo
                    header={t('GPU utilization')}
                    actualInfo={t('Shows actual utilization of the GPU.')}
                    timeInfo={t(
                      'The sparkling chart bellow shows 5-minute average for the last one hour with 5-minute step.',
                    )}
                  />
                }
                loading={loading}
              />

              <GPUDashboardCard
                title={t('GPU temperature')}
                ariaTitle={t('Donut GPU temperature')}
                rangeTitle={t('GPU temperature over time')}
                rangeDescription={t('Sparkline GPU temperature')}
                actualQuery={`DCGM_FI_DEV_GPU_TEMP{UUID="${gpuUuid}"}`}
                timeQuery={`max_over_time(DCGM_FI_DEV_GPU_TEMP{UUID="${gpuUuid}"}[5m])[60m:5m]`}
                // TODO: What about Fahrenheits?
                unit="°C"
                thresholds={[{ value: 50 }, { value: 70 }]}
                info={
                  <GPUDashboardCardInfo
                    header={t('GPU temperature')}
                    actualInfo={t('Shows actual temperature of the GPU.')}
                    timeInfo={t(
                      'The sparkling chart bellow shows 5-minute maximum for the last one hour with 5-minute step.',
                    )}
                  />
                }
                loading={loading}
              />

              <GPUDashboardCard
                title={t('GPU power consumption')}
                ariaTitle={t('Donut GPU power consumption')}
                rangeTitle={t('GPU power consumption over time')}
                rangeDescription={t('Sparkline GPU power consumption')}
                actualQuery={`DCGM_FI_DEV_POWER_USAGE{UUID="${gpuUuid}"}`}
                timeQuery={`max_over_time(DCGM_FI_DEV_POWER_USAGE{UUID="${gpuUuid}"}[5m])[60m:5m]`}
                unit="W"
                info={
                  <GPUDashboardCardInfo
                    header={t('GPU power consumption')}
                    actualInfo={t('Shows actual power consumption of the GPU.')}
                    timeInfo={t(
                      'The sparkling chart bellow shows 5-minute maximum for the last one hour with 5-minute step.',
                    )}
                  />
                }
                loading={loading}
              />

              <GPUDashboardCard
                title={t('GPU clock speed')}
                ariaTitle={t('Donut GPU clock speed')}
                rangeTitle={t('GPU clock speed over time')}
                rangeDescription={t('Sparkline GPU clock speed')}
                actualQuery={`DCGM_FI_DEV_SM_CLOCK{UUID="${gpuUuid}"}`}
                timeQuery={`avg_over_time(DCGM_FI_DEV_SM_CLOCK{UUID="${gpuUuid}"}[5m])[60m:5m]`}
                // TODO: Conversion to GHz??
                unit="MHz"
                info={
                  <GPUDashboardCardInfo
                    header={t('GPU clock speed')}
                    actualInfo={t('Shows actual clock speed of the GPU.')}
                    timeInfo={t(
                      'The sparkling chart bellow shows 5-minute average for the last one hour with 5-minute step.',
                    )}
                  />
                }
                loading={loading}
              />

              <GPUDashboardCard
                title={t('GPU memory clock speed')}
                ariaTitle={t('Donut GPU memory clock speed')}
                rangeTitle={t('GPU memory clock speed over time')}
                rangeDescription={t('Sparkline GPU memory clock speed')}
                actualQuery={`DCGM_FI_DEV_MEM_CLOCK{UUID="${gpuUuid}"}`}
                timeQuery={`avg_over_time(DCGM_FI_DEV_MEM_CLOCK{UUID="${gpuUuid}"}[5m])[60m:5m]`}
                // TODO: Conversion to GHz??
                unit="MHz"
                info={
                  <GPUDashboardCardInfo
                    header={t('GPU memory clock speed')}
                    actualInfo={t('Shows actual memory clock speed of the GPU.')}
                    timeInfo={t(
                      'The sparkling chart bellow shows 5-minute average for the last one hour with 5-minute step.',
                    )}
                  />
                }
                loading={loading}
              />

              <GPUDashboardCard
                title={t('GPU memory utilization')}
                ariaTitle={t('Donut GPU memory utilization')}
                rangeTitle={t('GPU memory utilization over time')}
                rangeDescription={t('Sparkline GPU memory utilization')}
                actualQuery={`DCGM_FI_DEV_MEM_COPY_UTIL{UUID="${gpuUuid}"}`}
                timeQuery={`avg_over_time(DCGM_FI_DEV_MEM_COPY_UTIL{UUID="${gpuUuid}"}[5m])[60m:5m]`}
                unit="%"
                maxDomain={100}
                info={
                  <GPUDashboardCardInfo
                    header={t('GPU memory utilization')}
                    actualInfo={t('Shows actual memory utilization of the GPU.')}
                    timeInfo={t(
                      'The sparkling chart bellow shows 5-minute average for the last one hour with 5-minute step.',
                    )}
                  />
                }
                loading={loading}
              />
            </Gallery>
          </StackItem>
        </Stack>
      </PageSection>
    </Page>
  );
};

export default GPUDashboard;
