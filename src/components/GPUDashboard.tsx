import * as React from 'react';
import {
  ChartArea,
  ChartDonutUtilization,
  ChartGroup,
  ChartVoronoiContainer,
} from '@patternfly/react-charts';
import {
  Alert,
  AlertVariant,
  Card,
  CardBody,
  CardFooter,
  CardTitle,
  Dropdown,
  DropdownItem,
  DropdownPosition,
  DropdownToggle,
  Gallery,
  Page,
  PageSection,
  Popover,
  Skeleton,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { CaretDownIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import {
  usePrometheusPoll,
  PrometheusEndpoint,
  humanize,
  BlueInfoCircleIcon,
} from '@openshift-console/dynamic-plugin-sdk';
import {
  getPrometheusResultScalarNumber,
  getPrometheusResultTimeSerie,
  PrometheusTimeSerie,
} from '../utils/prometheus';
import { GPUInfo, useAllGPUsInfo } from '../utils/gpuInfo';

import './GPUDashboard.css';

/* Chaotic list of TODOs:
  - Add "New" badge in gpu-dashboard nav item - replace string by a component in console-extensions.json
  - split components to multiple files
  - add GPU Info component (with its details)
  - tune polling interval
  - card sizes on different displayes
  - tune thresholds
  - read maximum for non-percentage metrics (use either GPU-info or find maximum over all-time Prometheus data)
*/

// https://issues.redhat.com/browse/MGMT-9263
// https://miro.com/app/board/uXjVOeUB2B4=/?moveToWidget=3458764514332229879&cot=14

// https://gcsweb-ci.apps.ci.l2s4.p1.openshiftapps.com/gcs/origin-ci-test/logs/periodic-ci-rh-ecosystem-edge-ci-artifacts-master-4.10-nvidia-gpu-operator-e2e-master/1510754193349021696/artifacts/nvidia-gpu-operator-e2e-master/nightly/artifacts/010__gpu_operator__wait_deployment/metrics.dcgm.txt

type GPUDashboardCardGenericProps = {
  title: string;
  ariaTitle: string;
  rangeDescription: string;
  rangeTitle: string;
  unit: string /* I.e. '%'*/;
  maxDomain?: number /* I.e. 100 (like 100%) */;
  thresholds?: any[];
};

type GPUDashboardCardProps = GPUDashboardCardGenericProps & {
  actualQuery: string;
  timeQuery: string;
  loading: boolean;
  info?: React.ReactElement;
};

type GPUDashboardCardGraphsProps = GPUDashboardCardGenericProps & {
  scalarValue: number;
  timeSerie: PrometheusTimeSerie;
};

const GPUDashboardCardError: React.FC<{ error: any }> = ({ error }) => {
  console.error('Prometheus error: ', error);
  // TODO: add icon
  return <CardBody>N/A</CardBody>;
};

const GPUDashboardCardLoading: React.FC = () => {
  return <Skeleton shape="square" width="100%" screenreaderText="Loading card content" />;
};

const GPUDashboardCardGraphs: React.FC<GPUDashboardCardGraphsProps> = ({
  title,
  ariaTitle,
  rangeTitle,
  rangeDescription,
  scalarValue,
  timeSerie,
  unit,
  maxDomain,
  thresholds,
}) => {
  const now = new Date();
  const getDatumLabel = ({ datum }) => {
    const dateTime = new Date(datum.x * 1000);
    return `${humanize.fromNow(dateTime, now)}: ${datum.y}`;
  };

  const timeData = timeSerie.map((pair) => ({
    name: title,
    x: pair.time,
    y: pair.value,
  }));

  if (!maxDomain) {
    // TODO: read that from GPU info once it is available
    maxDomain = Math.max(...timeSerie.map((pair) => pair.value));
  }

  const actualInPercents = (scalarValue / maxDomain) * 100;
  maxDomain = maxDomain * 1.2; // Add 20% for the sparkline chart. Can we have minus values for something??

  return (
    <>
      <CardBody>
        <ChartDonutUtilization
          ariaDesc={title}
          ariaTitle={ariaTitle}
          constrainToVisibleArea={true}
          data={{ x: title, y: actualInPercents }}
          labels={({ datum }) => (datum.x ? `${datum.x}: ${datum.y}${unit}` : null)}
          // subTitle=""
          title={`${scalarValue}${unit}`}
          thresholds={thresholds}
        />
      </CardBody>
      <CardFooter>
        <ChartGroup
          ariaDesc={rangeDescription}
          ariaTitle={rangeTitle}
          containerComponent={
            <ChartVoronoiContainer labels={getDatumLabel} constrainToVisibleArea={true} />
          }
          height={90}
          maxDomain={{ y: maxDomain }}
          padding={0}
        >
          <ChartArea data={timeData} />
        </ChartGroup>
      </CardFooter>
    </>
  );
};

type GPUDashboardCardInfoProps = {
  header: string;
  actualInfo: string;
  timeInfo?: string;
};

const GPUDashboardCardInfo: React.FC<GPUDashboardCardInfoProps> = ({
  header,
  actualInfo,
  timeInfo,
}) => (
  <Popover
    aria-label="Dashboard card description"
    maxWidth="20rem"
    minWidth="15rem"
    headerContent={<div>{header}</div>}
    bodyContent={
      <Stack hasGutter>
        <StackItem>{actualInfo}</StackItem>
        {timeInfo && <StackItem>{timeInfo}</StackItem>}
      </Stack>
    }
  >
    <BlueInfoCircleIcon className="gpu-dashboard__card-info-icon" />
  </Popover>
);

const GPUDashboardCard: React.FC<GPUDashboardCardProps> = ({
  actualQuery,
  timeQuery,
  loading,
  info,
  ...props
}) => {
  const { title } = props;

  //   {
  //   /** Delay between polling requests */
  //   delay?: number;
  //   /** One of the well-defined Prometheus API endpoints */
  //   endpoint: PrometheusEndpoint;
  //   namespace?: string;
  //   /** Prometheus query */
  //   query: string;
  //   /** A search parameter */
  //   timeout?: string;
  //   /** A vector-query search parameter */
  //   endTime?: number;
  //   /** A vector-query search parameter */
  //   samples?: number;
  //   /** A vector-query search parameter */
  //   timespan?: number;
  // };
  const [resultActual, errorActual, loadingActual] = usePrometheusPoll({
    endpoint: PrometheusEndpoint.QUERY,
    query: actualQuery,
  });

  const [resultTime, errorTime, loadingTime] = usePrometheusPoll({
    endpoint: PrometheusEndpoint.QUERY,
    query: timeQuery,
  });

  const scalarValue = getPrometheusResultScalarNumber(resultActual);
  const timeSerie = getPrometheusResultTimeSerie(resultTime);

  const error = errorActual && errorTime;
  loading = loading || (loadingActual && loadingTime) || scalarValue === undefined || !timeSerie;

  return (
    <Card height={'25rem'}>
      <CardTitle className="pf-u-text-align-center">
        {title}
        {info}
      </CardTitle>
      {error && <GPUDashboardCardError error={error} />}
      {!error && loading && <GPUDashboardCardLoading />}
      {!error && !loading && (
        <GPUDashboardCardGraphs {...props} scalarValue={scalarValue} timeSerie={timeSerie} />
      )}
    </Card>
  );
};

type GPUDropdownProps = {
  gpus?: GPUInfo[];
  onSelect: (uuid: string) => void;
  selectedUuid?: string;
  className?: string;
};

const GPUDropdown: React.FC<GPUDropdownProps> = ({ selectedUuid, gpus, onSelect, className }) => {
  const [isOpen, setOpen] = React.useState(false);

  const toggle = (
    <DropdownToggle onToggle={() => setOpen(!isOpen)} toggleIndicator={CaretDownIcon}>
      {selectedUuid}
    </DropdownToggle>
  );

  const items =
    gpus?.map((gpu) => (
      <DropdownItem key={gpu.uuid} id={gpu.uuid}>
        {gpu.uuid}
      </DropdownItem>
    )) || [];

  return (
    <Dropdown
      onSelect={(e) => {
        onSelect(e.currentTarget.id);
        setOpen(false);
      }}
      dropdownItems={items}
      toggle={toggle}
      isOpen={isOpen}
      className={className}
      disabled={!gpus?.length}
      position={DropdownPosition.right}
    />
  );
};

const GPUDashboard: React.FC = () => {
  const { t } = useTranslation('plugin__console-plugin-nvidia-gpu');
  const [gpus, gpusError, gpusLoading] = useAllGPUsInfo();
  const [gpuUuid, setGpuUuid] = React.useState<string>('GPU-a458dc79-5837-1cd9-120f-99a4c1e0cb66'); // GPU-43d4af7b-4cbb-1577-c1d4-e908416fda4a , GPU-a458dc79-5837-1cd9-120f-99a4c1e0cb66

  const loading = !gpuUuid;

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

            {/* TODO: Show info about the selected GPU */}
            <GPUDropdown
              gpus={gpus}
              onSelect={setGpuUuid}
              selectedUuid={gpuUuid}
              className="gpu-dashboard__dropdown-gpus"
            />
          </StackItem>
          <StackItem>
            <Gallery
              hasGutter
              // minWidths={{ default: '20rem' }}
            >
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
