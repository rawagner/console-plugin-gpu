/* eslint-disable */
import * as React from 'react';
import { InProgressIcon } from '@patternfly/react-icons';
import GenericStatus from './GenericStatus';
import { RedExclamationCircleIcon, GreenCheckCircleIcon, BlueInfoCircleIcon } from './icons';

export const ErrorStatus: React.FC<any> = (props) => (
  <GenericStatus {...props} Icon={RedExclamationCircleIcon} />
);
ErrorStatus.displayName = 'ErrorStatus';

export const InfoStatus: React.FC<any> = (props) => (
  <GenericStatus {...props} Icon={BlueInfoCircleIcon} />
);
InfoStatus.displayName = 'InfoStatus';

export const ProgressStatus: React.FC<any> = (props) => (
  <GenericStatus {...props} Icon={InProgressIcon} />
);
ProgressStatus.displayName = 'ProgressStatus';

export const SuccessStatus: React.FC<any> = (props) => (
  <GenericStatus {...props} Icon={GreenCheckCircleIcon} />
);
SuccessStatus.displayName = 'SuccessStatus';
