import * as React from 'react';
import { PrometheusEndpoint, usePrometheusPoll } from '@openshift-console/dynamic-plugin-sdk';

export type GPUInfo = {
  uuid: string;
  hostname: string;
  device: string;
  modelName: string;
  // More will come. One day...
};

/**
 * Get a list of all GPUs in the cluster and their details.
 *
 * Since the details are not sufficiently exported atm (TODO: Add Jira link to track),
 * we hack it to get list of UUIDs at least.
 */ export const useAllGPUsInfo = (): [GPUInfo[], /* error */ any, /* loading */ boolean] => {
  const [result, error, loading] = usePrometheusPoll({
    endpoint: PrometheusEndpoint.QUERY,
    query: 'DCGM_FI_DEV_GPU_UTIL',
  });

  const gpus = React.useMemo(
    () =>
      result?.data?.result?.map((res) => ({
        uuid: res.metric?.UUID,
        hostname: res.metric?.Hostname,
        device: res.metric?.device,
        modelName: res.metric?.modelName,
      })),
    [result],
  );

  return [gpus, error, loading];
};
