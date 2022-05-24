import * as React from 'react';

import { GPUInfo, useGPUsInfo } from '../../hooks/use-gpus-info';

type GPUDashboardContextValues = {
  gpus: GPUInfo[];
  gpusLoading: boolean;
  gpusError: unknown;
  selectedGPU?: GPUInfo;
  setSelectedGPU: (uuid: string) => void;
};

export const GPUDashboardContext = React.createContext<GPUDashboardContextValues>({
  gpus: [],
  gpusLoading: false,
  gpusError: undefined,
  selectedGPU: undefined,
  // eslint-disable-next-line
  setSelectedGPU: () => {},
});

export const useGPUDashboardContextValues = (): GPUDashboardContextValues => {
  const [gpus, gpusLoading, gpusError] = useGPUsInfo();
  const [gpuUuid, setSelectedGPU] = React.useState<string>();

  const selectedGPU = gpus?.find((gpuInfo) => gpuInfo.uuid === gpuUuid) || gpus?.[0];

  React.useEffect(() => {
    if (!gpuUuid && gpus?.length) {
      setSelectedGPU(gpus[0].uuid);
    }
  }, [gpuUuid, gpus]);

  return {
    gpus,
    gpusLoading,
    gpusError,
    selectedGPU,
    setSelectedGPU,
  };
};
