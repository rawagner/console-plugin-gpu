import * as React from 'react';
import { useTranslation } from 'react-i18next';
import {
  VirtualizedTable,
  TableColumn,
  RowProps,
  TableData,
  ResourceLink,
  useK8sWatchResource,
  usePrometheusPoll,
  PrometheusEndpoint,
  UsePrometheusPoll,
  PrometheusResponse,
} from '@openshift-console/dynamic-plugin-sdk';
import {
  Card,
  CardBody,
  CardTitle,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
} from '@patternfly/react-core';
import { sortable } from '@patternfly/react-table';
import { CubesIcon } from '@patternfly/react-icons';
import { Pod } from '../../../resources';
import { i18nNs } from '../../../i18n';
import { GPUDashboardContext } from '../GPUDashboardContext';
import { formatCores, humanizeBinaryBytes, humanizeRatio } from '../../../utils/units';
import { sortResourceByValue } from '../../../utils/utils';

import { PodStatus } from '../../PodStatus/PodStatus';

import './WorkloadsCard.css';

const NoDataEmptyMsg = () => {
  const { t } = useTranslation(i18nNs);
  return (
    <EmptyState>
      <EmptyStateIcon icon={CubesIcon} />
      <EmptyStateBody>{t('No workloads found')}</EmptyStateBody>
    </EmptyState>
  );
};

const memoryQuery = "sum(container_memory_working_set_bytes{container=''}) BY (pod, namespace)";
const cpuQuery = 'pod:container_cpu_usage:sum';

export const ONE_SECOND = 1000;
export const ONE_MINUTE = 60 * ONE_SECOND;
export const ONE_HOUR = 60 * ONE_MINUTE;
export const ONE_DAY = 24 * ONE_HOUR;
export const ONE_WEEK = 7 * ONE_DAY;

type ContextValues = {
  cpuMetrics: ReturnType<UsePrometheusPoll>;
  memoryMetrics: ReturnType<UsePrometheusPoll>;
  gpuMemoryMetrics: ReturnType<UsePrometheusPoll>;
};

export const WorkloadsContext = React.createContext<ContextValues>({
  // eslint-disable-next-line
  cpuMetrics: [undefined as any, false, undefined],
  // eslint-disable-next-line
  memoryMetrics: [undefined as any, false, undefined],
  // eslint-disable-next-line
  gpuMemoryMetrics: [undefined as any, false, undefined],
});

const tableColumnInfo = [
  { className: 'co-break-word', id: 'name' },
  { className: 'co-break-word', id: 'namespace' },
  { className: 'co-break-word', id: 'status' },
  { className: 'co-break-word', id: 'cpu' },
  { className: 'co-break-word', id: 'memory' },
  { className: 'co-break-word', id: 'gpu' },
];

const getPodMetricValue = (metrics: PrometheusResponse | undefined, pod: Pod) =>
  metrics?.data.result.find(
    (m) => m.metric.namespace === pod.metadata?.namespace && m.metric.pod === pod.metadata.name,
  );

const PodTableRow: React.FC<RowProps<Pod>> = ({ obj, activeColumnIDs }) => {
  const { cpuMetrics, memoryMetrics, gpuMemoryMetrics } = React.useContext(WorkloadsContext);

  const getCPUUsage = () => {
    const podCPUMetric = getPodMetricValue(cpuMetrics?.[0], obj);

    return podCPUMetric?.value?.[1] ? formatCores(parseInt(podCPUMetric?.value?.[1])) : '-';
  };

  const getMemoryUsage = () => {
    const podMemoryMetric = getPodMetricValue(memoryMetrics?.[0], obj);

    return podMemoryMetric?.value?.[1]
      ? humanizeBinaryBytes(parseInt(podMemoryMetric?.value?.[1]), undefined, 'MiB').string
      : '-';
  };

  const getGPUUsage = () => {
    const gpuMetric = gpuMemoryMetrics?.[0]?.data?.result.find(
      (m) =>
        m.metric['exported_namespace'] === obj.metadata?.namespace &&
        m.metric['exported_pod'] === obj.metadata.name,
    );
    const currentValue = gpuMetric?.values?.[0]?.[1];
    return currentValue !== undefined ? humanizeRatio(parseInt(currentValue)).string : '-';
  };

  return (
    <>
      <TableData {...tableColumnInfo[0]} activeColumnIDs={activeColumnIDs}>
        <ResourceLink
          groupVersionKind={{
            kind: 'Pod',
            version: 'v1',
          }}
          name={obj.metadata?.name}
          namespace={obj.metadata?.namespace}
        />
      </TableData>
      <TableData {...tableColumnInfo[1]} activeColumnIDs={activeColumnIDs}>
        <ResourceLink
          groupVersionKind={{
            kind: 'Namespace',
            version: 'v1',
          }}
          name={obj.metadata?.namespace}
        />
      </TableData>
      <TableData {...tableColumnInfo[2]} activeColumnIDs={activeColumnIDs}>
        <PodStatus pod={obj} />
      </TableData>
      <TableData {...tableColumnInfo[3]} activeColumnIDs={activeColumnIDs}>
        {getCPUUsage()}
      </TableData>
      <TableData {...tableColumnInfo[4]} activeColumnIDs={activeColumnIDs}>
        {getMemoryUsage()}
      </TableData>
      <TableData {...tableColumnInfo[5]} activeColumnIDs={activeColumnIDs}>
        {getGPUUsage()}
      </TableData>
    </>
  );
};

const WorkloadsCard: React.FC = () => {
  const { t } = useTranslation(i18nNs);
  const { gpusLoading, selectedGPU, gpusError } = React.useContext(GPUDashboardContext);

  const [pods, podsLoaded, podsLoadError] = useK8sWatchResource<Pod[]>({
    groupVersionKind: {
      kind: 'Pod',
      version: 'v1',
    },
    namespaced: true,
    isList: true,
  });

  const loaded = !gpusLoading && podsLoaded;
  const loadError = podsLoadError || gpusError;

  const cpuMetrics = usePrometheusPoll({
    endpoint: PrometheusEndpoint.QUERY,
    query: cpuQuery,
  });

  const memoryMetrics = usePrometheusPoll({
    endpoint: PrometheusEndpoint.QUERY,
    query: memoryQuery,
  });

  const gpuMemoryMetrics = usePrometheusPoll({
    endpoint: PrometheusEndpoint.QUERY_RANGE,
    query: `sum (DCGM_FI_PROF_GR_ENGINE_ACTIVE{exported_pod=~".+"}) by (exported_namespace, exported_pod, UUID)`,
    timespan: ONE_DAY,
  });

  const cpuMetricsResponse = cpuMetrics[0];
  const memoryMetricsResponse = memoryMetrics[0];
  const gpuMetricsResponse = gpuMemoryMetrics[0];

  const columns = React.useMemo<TableColumn<Pod>[]>(
    () => [
      {
        title: t('Name'),
        sort: 'metadata.name',
        transforms: [sortable],
        props: { className: tableColumnInfo[0].className },
        id: tableColumnInfo[0].id,
      },
      {
        title: t('Namespace'),
        sort: 'metadata.namespace',
        transforms: [sortable],
        props: { className: tableColumnInfo[1].className },
        id: tableColumnInfo[1].id,
      },
      {
        title: t('Status'),
        sort: 'metadata.namespace',
        transforms: [sortable],
        props: { className: tableColumnInfo[2].className },
        id: tableColumnInfo[2].id,
      },
      {
        title: t('CPU'),
        sort: (data, direction) =>
          data.sort(
            sortResourceByValue<Pod>(direction, (obj) =>
              getPodMetricValue(cpuMetricsResponse, obj),
            ),
          ),
        transforms: [sortable],
        props: { className: tableColumnInfo[3].className },
        id: tableColumnInfo[3].id,
      },
      {
        title: t('Memory'),
        sort: (data, direction) =>
          data.sort(
            sortResourceByValue<Pod>(direction, (obj) =>
              getPodMetricValue(memoryMetricsResponse, obj),
            ),
          ),
        transforms: [sortable],
        props: { className: tableColumnInfo[4].className },
        id: tableColumnInfo[4].id,
      },
      {
        title: t('GPU'),
        sort: (data, direction) =>
          data.sort(
            sortResourceByValue<Pod>(direction, (obj) =>
              getPodMetricValue(gpuMetricsResponse, obj),
            ),
          ),
        transforms: [sortable],
        props: { className: tableColumnInfo[5].className },
        id: tableColumnInfo[5].id,
      },
    ],
    [t, cpuMetricsResponse, memoryMetricsResponse, gpuMetricsResponse],
  );

  const workloads = pods.filter((p) => {
    const exists = gpuMemoryMetrics?.[0]?.data?.result.some(
      (m) =>
        m.metric['exported_namespace'] === p.metadata?.namespace &&
        m.metric['exported_pod'] === p.metadata.name &&
        selectedGPU?.uuid === m.metric['UUID'],
    );
    return exists;
  });

  return (
    <Card>
      <CardTitle>{t('Workloads')}</CardTitle>
      <div className="ng-workloads-card">
        <CardBody>
          <WorkloadsContext.Provider
            value={{
              cpuMetrics,
              memoryMetrics,
              gpuMemoryMetrics,
            }}
          >
            <VirtualizedTable<Pod>
              data={workloads}
              unfilteredData={workloads}
              loaded={loaded && !gpuMemoryMetrics[1] && !!gpuMemoryMetrics[0]}
              loadError={loadError || gpuMemoryMetrics[2]}
              aria-label={t('Workloads')}
              columns={columns}
              Row={PodTableRow}
              NoDataEmptyMsg={NoDataEmptyMsg}
            />
          </WorkloadsContext.Provider>
        </CardBody>
      </div>
    </Card>
  );
};

export default WorkloadsCard;
