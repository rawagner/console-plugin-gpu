import {
  PrometheusEndpoint,
  useK8sWatchResource,
  usePrometheusPoll,
} from '@openshift-console/dynamic-plugin-sdk';
import * as _ from 'lodash';
import { Node, Pod } from '../resources';
import { useDeepCompareMemoize } from './use-deep-memoize';

export type GPUInfo = {
  uuid: string;
  podname: string;
  namespace: string;
  modelName: string;
  nodeName: string;
};

/**
 * Get a list of all GPUs in the cluster and their details.
 *
 */
export const useGPUsInfo = (): [GPUInfo[], /* loading */ boolean, /* error */ unknown] => {
  const [result, loading, error] = usePrometheusPoll({
    endpoint: PrometheusEndpoint.QUERY,
    query: 'DCGM_FI_PROF_GR_ENGINE_ACTIVE',
  });

  const gpus = useDeepCompareMemoize(
    _.uniqBy(
      result?.data?.result?.map((res) => ({
        uuid: res.metric?.UUID,
        podname: res.metric?.pod,
        namespace: res.metric?.namespace,
        modelName: res.metric?.modelName,
        nodeName: res.metric?.Hostname,
      })),
      (g) => g.uuid,
    ),
  );

  return [gpus, loading, error];
};

export const useGPUNode = (gpu?: GPUInfo): [Node | undefined, boolean, unknown] => {
  const [pod, podLoaded, podError] = useK8sWatchResource<Pod>(
    gpu
      ? {
          groupVersionKind: {
            kind: 'Pod',
            version: 'v1',
          },
          name: gpu.podname,
          namespace: gpu.namespace,
          isList: false,
        }
      : null,
  );

  const [node, nodeLoaded, nodeError] = useK8sWatchResource<Node>(
    pod?.spec?.nodeName
      ? {
          groupVersionKind: {
            kind: 'Node',
            version: 'v1',
          },
          name: pod.spec.nodeName,
          isList: false,
        }
      : null,
  );

  return [node, nodeLoaded && podLoaded, podError || nodeError];
};
