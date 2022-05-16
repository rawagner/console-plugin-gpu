import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { sortable } from '@patternfly/react-table';
import classNames from 'classnames';
import {
  VirtualizedTable,
  useActiveColumns,
  TableColumn,
  RowProps,
  TableData,
  ResourceLink,
  useListPageFilter,
  ListPageFilter,
} from '@openshift-console/dynamic-plugin-sdk';
import { Pod, podReference } from '../resources';
import { fuzzyCaseInsensitive } from '../utils/utils';

const tableColumnInfo = [
  { className: '', id: 'name' },
  { className: '', id: 'namespace' },
  // { className: classNames('pf-m-hidden', 'pf-m-visible-on-sm'), id: 'nodeRef' },
  // { className: classNames('pf-m-hidden', 'pf-m-visible-on-md'), id: 'phase' },
  // { className: classNames('pf-m-hidden', 'pf-m-visible-on-lg'), id: 'provider' },
  // { className: classNames('pf-m-hidden', 'pf-m-visible-on-xl'), id: 'region' },
  // { className: classNames('pf-m-hidden', 'pf-m-visible-on-xl'), id: 'avail' },
  // { className: Kebab.columnClass, id: '' },
];

const MachineTableRow: React.FC<RowProps<Pod>> = ({ obj, activeColumnIDs }) => {
  // const nodeName = getMachineNodeName(obj);
  // const region = getMachineRegion(obj);
  // const zone = getMachineZone(obj);
  // const providerState = getMachineProviderState(obj);
  return (
    <>
      <TableData
        {...tableColumnInfo[0]}
        className={classNames(tableColumnInfo[0].className, 'co-break-word')}
        activeColumnIDs={activeColumnIDs}
      >
        <ResourceLink
          kind={podReference}
          name={obj.metadata.name}
          namespace={obj.metadata.namespace}
        />
      </TableData>
      <TableData
        {...tableColumnInfo[1]}
        className={classNames(tableColumnInfo[1].className, 'co-break-word')}
        activeColumnIDs={activeColumnIDs}
      >
        <ResourceLink kind="Namespace" name={obj.metadata.namespace} />
      </TableData>
      {/* <TableData {...tableColumnInfo[2]} activeColumnIDs={activeColumnIDs}>
        {nodeName ? <NodeLink name={nodeName} /> : '-'}
      </TableData>
      <TableData {...tableColumnInfo[3]} activeColumnIDs={activeColumnIDs}>
        <Status status={getMachinePhase(obj)} />
      </TableData>
      <TableData {...tableColumnInfo[4]} activeColumnIDs={activeColumnIDs}>
        {providerState ?? '-'}
      </TableData>
      <TableData {...tableColumnInfo[5]} activeColumnIDs={activeColumnIDs}>
        {region || '-'}
      </TableData>
      <TableData {...tableColumnInfo[6]} activeColumnIDs={activeColumnIDs}>
        {zone || '-'}
      </TableData>
      <TableData {...tableColumnInfo[7]} activeColumnIDs={activeColumnIDs}>
        <ResourceKebab actions={menuActions} kind={machineReference} resource={obj} />
      </TableData> */}
    </>
  );
};

export const GPUPods: React.FC<{
  gpuUuid?: string;
}> = ({ gpuUuid }) => {
  const { t } = useTranslation('plugin__console-plugin-nvidia-gpu');
  const loading = !gpuUuid;

  // TODO: filter by Node
  const gpuPodsColumns = React.useMemo<TableColumn<Pod>[]>(
    () => [
      {
        title: t('public~Name'),
        sort: 'metadata.name',
        transforms: [sortable],
        props: { className: tableColumnInfo[0].className },
        id: tableColumnInfo[0].id,
      },
      {
        title: t('public~Namespace'),
        sort: 'metadata.namespace',
        transforms: [sortable],
        props: { className: tableColumnInfo[1].className },
        id: tableColumnInfo[1].id,
      },
      // {
      //   title: t('public~Node'),
      //   sort: 'status.nodeRef.name',
      //   transforms: [sortable],
      //   props: { className: tableColumnInfo[2].className },
      //   id: tableColumnInfo[2].id,
      // },
      // {
      //   title: t('public~Phase'),
      //   sort: (data, direction) => data.sort(sortResourceByValue(direction, getMachinePhase)),
      //   transforms: [sortable],
      //   props: { className: tableColumnInfo[3].className },
      //   id: tableColumnInfo[3].id,
      // },
      // {
      //   title: t('public~Provider state'),
      //   sort: 'status.providerStatus.instanceState',
      //   transforms: [sortable],
      //   props: { className: tableColumnInfo[4].className },
      //   id: tableColumnInfo[4].id,
      // },
      // {
      //   title: t('public~Region'),
      //   sort: "metadata.labels['machine.openshift.io/region']",
      //   transforms: [sortable],
      //   props: { className: tableColumnInfo[5].className },
      //   id: tableColumnInfo[5].id,
      // },
      // {
      //   title: t('public~Availability zone'),
      //   sort: "metadata.labels['machine.openshift.io/zone']",
      //   transforms: [sortable],
      //   props: { className: tableColumnInfo[6].className },
      //   id: tableColumnInfo[6].id,
      // },
      // {
      //   title: '',
      //   props: { className: tableColumnInfo[7].className },
      //   id: tableColumnInfo[7].id,
      // },
    ],
    [t],
  );

  const [columns] = useActiveColumns({
    columns: gpuPodsColumns,
    showNamespaceOverride: false,
    columnManagementID: undefined,
  });

  const podFilter = [{ type: 'name', filter: (str /* TODO: type*/, machine: Pod): boolean => {
    // TODO
    const node: string = _.get(machine, 'status.nodeRef.name');
    return (
      fuzzyCaseInsensitive(str.selected?.[0], machine.metadata.name) ||
      (node && fuzzyCaseInsensitive(str.selected?.[0], node))
    );
  }}];

  const [data, filteredData, onFilterChange] = useListPageFilter(pods, podFilter);

  return (
    <>
      <ListPageFilter
        data={data}
        loaded={!loading}
        onFilterChange={onFilterChange}
        hideNameLabelFilters={hideNameLabelFilters}
        hideLabelFilter={hideLabelFilter}
        hideColumnManagement={hideColumnManagement}
      />

      <VirtualizedTable<Pod>
        data={filteredData}
        unfilteredData={machines}
        loaded={!loading}
        loadError={loadError}
        aria-label={t('Pods requesting GPU')}
        columns={columns}
        Row={MachineTableRow}
      />
    </>
  );
};
