import * as React from 'react';
import {
  Card,
  CardBody,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListTerm,
  Flex,
  FlexItem,
} from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { GPUInfo } from '../utils/gpuInfo';

type GPUInfoCardProps = {
  selectedGpu?: GPUInfo;
};

export const GPUInfoCard: React.FC<GPUInfoCardProps> = ({ selectedGpu }) => {
  const { t } = useTranslation('plugin__console-plugin-nvidia-gpu');

  return (
    <Card isFlat>
      <CardBody>
        {selectedGpu ? (
          <DescriptionList>
            <Flex>
              <FlexItem>
                <DescriptionListTerm>{t('Model')}</DescriptionListTerm>
                <DescriptionListDescription>{selectedGpu.modelName}</DescriptionListDescription>
              </FlexItem>

              <FlexItem>
                <DescriptionListTerm>{t('Pod')}</DescriptionListTerm>
                <DescriptionListDescription>{selectedGpu.hostname}</DescriptionListDescription>
              </FlexItem>
            </Flex>
          </DescriptionList>
        ) : (
          t('No GPU can be found in the cluster.')
        )}
      </CardBody>
    </Card>
  );
};
