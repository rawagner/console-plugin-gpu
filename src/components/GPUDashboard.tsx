import * as React from 'react';
import {
  ChartArea,
  ChartDonutUtilization,
  ChartGroup,
  ChartVoronoiContainer,
} from '@patternfly/react-charts';
import {
  Card,
  CardBody,
  CardFooter,
  CardTitle,
  Gallery,
  Page,
  PageSection,
} from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import {
  usePrometheusPoll,
  PrometheusEndpoint,
  humanize,
} from '@openshift-console/dynamic-plugin-sdk';

import {
  getPrometheusResultScalarNumber,
  getPrometheusResultTimeSerie,
  PrometheusTimeSerie,
} from '../utils/prometheus';

/* Chaotic list of TODOs:
  - Add "New" badge in gpu-dashboard nav item - replace string by a component in console-extensions.json
*/

// https://issues.redhat.com/browse/MGMT-9263
// https://miro.com/app/board/uXjVOeUB2B4=/?moveToWidget=3458764514332229879&cot=14

// https://gcsweb-ci.apps.ci.l2s4.p1.openshiftapps.com/gcs/origin-ci-test/logs/periodic-ci-rh-ecosystem-edge-ci-artifacts-master-4.10-nvidia-gpu-operator-e2e-master/1510754193349021696/artifacts/nvidia-gpu-operator-e2e-master/nightly/artifacts/010__gpu_operator__wait_deployment/metrics.dcgm.txt

// Temperature (in C):
// DCGM_FI_DEV_GPU_TEMP{UUID="GPU-43d4af7b-4cbb-1577-c1d4-e908416fda4a"}
// rate(DCGM_FI_DEV_GPU_TEMP{UUID="GPU-43d4af7b-4cbb-1577-c1d4-e908416fda4a"}[5m])[60m:5m]
// TODO: convert to fahrenheits

// GPU utilization:
// DCGM_FI_DEV_GPU_UTIL{UUID="GPU-43d4af7b-4cbb-1577-c1d4-e908416fda4a"}
// rate(DCGM_FI_DEV_GPU_UTIL{UUID="GPU-43d4af7b-4cbb-1577-c1d4-e908416fda4a"}[5m])[60m:5m]

// Power draw (in W)
// DCGM_FI_DEV_POWER_USAGE

// GPU clock speed
// DCGM_FI_DEV_SM_CLOCK (in MHz)

// Memory clock speed
// DCGM_FI_DEV_MEM_CLOCK

// Memory utilization (in %)
// DCGM_FI_DEV_MEM_COPY_UTIL

// Missing: Fan speed

type GPUDashboardCardProps = {
  title: string;
  ariaTitle: string;
  rangeDescription: string;
  rangeTitle: string;
  unit: string /* I.e. '%'*/;
  maxDomain: number /* I.e. 100 (like 100%) */;
};

type GPUDashboardCardGraphsProps = GPUDashboardCardProps & {
  scalarValue: number;
  timeSerie: PrometheusTimeSerie;
};

const GPUDashboardCardError: React.FC<{ error: any }> = ({ error }) => {
  console.error('Prometheus error: ', error);
  // TODO: add icon
  return <CardBody>N/A</CardBody>;
};

const GPUDashboardCardLoading: React.FC = () => {
  // TODO: use a spinner instead?
  return <div className="skeleton-inventory" />;
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

  return (
    <>
      {/* TODO: Add Info describing shown data (What numbers are we looking at? Per metric. Per scalar and vector. ) */}
      <CardBody>
        <ChartDonutUtilization
          ariaDesc={title}
          ariaTitle={ariaTitle}
          constrainToVisibleArea={true}
          data={{ x: title, y: scalarValue }}
          labels={({ datum }) => (datum.x ? `${datum.x}: ${datum.y}${unit}` : null)}
          // subTitle=""
          title={`${scalarValue}${unit}`}
        />
      </CardBody>
      <CardFooter>
        <ChartGroup
          ariaDesc={rangeDescription}
          ariaTitle={rangeTitle}
          containerComponent={
            <ChartVoronoiContainer labels={getDatumLabel} constrainToVisibleArea={false} />
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

const GPUDashboardCard: React.FC<GPUDashboardCardProps> = (props) => {
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
    query: 'DCGM_FI_DEV_GPU_TEMP{UUID="GPU-43d4af7b-4cbb-1577-c1d4-e908416fda4a"}',
  });

  const [resultTime, errorTime, loadingTime] = usePrometheusPoll({
    endpoint: PrometheusEndpoint.QUERY,
    // a 5-minute average for the last one hour with 5-minute step
    query:
      'avg_over_time(DCGM_FI_DEV_GPU_TEMP{UUID="GPU-43d4af7b-4cbb-1577-c1d4-e908416fda4a"}[5m])[60m:5m]',
  });

  const scalarValue = getPrometheusResultScalarNumber(resultActual);
  const timeSerie = getPrometheusResultTimeSerie(resultTime);

  const error = errorActual && errorTime;
  const loading = (loadingActual && loadingTime) || !scalarValue || !timeSerie;

  return (
    <Card>
      <CardTitle className="pf-u-text-align-center">{title}</CardTitle>
      {error && <GPUDashboardCardError error={error} />}
      {!error && loading && <GPUDashboardCardLoading />}
      {!error && !loading && (
        <GPUDashboardCardGraphs {...props} scalarValue={scalarValue} timeSerie={timeSerie} />
      )}
    </Card>
  );
};

const GPUDashboard: React.FC = () => {
  const { t } = useTranslation('plugin__console-plugin-nvidia-gpu');

  return (
    <Page>
      <PageSection isFilled>
        <Gallery>
          <GPUDashboardCard
            title={t('GPU utilization')}
            ariaTitle={t('Donut GPU utilization')}
            unit="%"
            maxDomain={100}
            rangeTitle={t('GPU utilization over time')}
            rangeDescription={t('Sparkline GPU utilization')}
          />
        </Gallery>
      </PageSection>
    </Page>
  );
};

export default GPUDashboard;
