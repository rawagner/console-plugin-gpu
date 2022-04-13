import * as React from 'react';
import { Popover, Stack, StackItem } from '@patternfly/react-core';
import { BlueInfoCircleIcon } from '@openshift-console/dynamic-plugin-sdk';

type GPUDashboardCardInfoProps = {
  header: string;
  actualInfo: string;
  timeInfo?: string;
};

export const GPUDashboardCardInfo: React.FC<GPUDashboardCardInfoProps> = ({
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
