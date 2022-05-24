import { k8sGet, K8sKind, SetFeatureFlag } from '@openshift-console/dynamic-plugin-sdk';

// Copy&pasted to avoid using React hooks
const DeploymentModel: K8sKind = {
  label: 'Deployment',
  labelKey: 'Deployment',
  apiVersion: 'v1',
  apiGroup: 'apps',
  plural: 'deployments',
  abbr: 'D',
  namespaced: true,
  propagationPolicy: 'Foreground',
  kind: 'Deployment',
  id: 'deployment',
  labelPlural: 'Deployments',
  labelPluralKey: 'Deployments',
};

export const handler = async (setFeatureFlag: SetFeatureFlag) => {
  try {
    await k8sGet({
      model: DeploymentModel,
      name: 'gpu-operator',
      ns: 'nvidia-gpu-operator',
    });
    setFeatureFlag('GPU_OPERATOR', true);
  } catch (err) {
    setFeatureFlag('GPU_OPERATOR', false);
  }
};
