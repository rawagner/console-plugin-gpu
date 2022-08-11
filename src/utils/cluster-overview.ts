import { GetQuery } from '@openshift-console/dynamic-plugin-sdk';

export const getGPUUtilizationQuery: GetQuery = () =>
  'count(count by (UUID,GPU_I_ID) (DCGM_FI_PROF_GR_ENGINE_ACTIVE{exported_pod=~".+"})) or vector(0)';
export const getGPUTotalUtilizationQuery: GetQuery = () =>
  'count(count by (UUID,GPU_I_ID) (DCGM_FI_PROF_GR_ENGINE_ACTIVE)) or vector(0)';

export const getPowerUsageUtilizationQuery: GetQuery = () =>
  'sum(max by (UUID) (DCGM_FI_DEV_POWER_USAGE))';

export const getMemoryQuery: GetQuery = () =>
  'count(count by (UUID,GPU_I_ID) (DCGM_FI_DEV_MEM_COPY_UTIL))';
