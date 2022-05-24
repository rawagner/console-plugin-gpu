import * as React from 'react';
import {
  Page,
  PageSection,
  Split,
  SplitItem,
  Stack,
  StackItem,
  Title,
  Grid,
  GridItem,
} from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import InfoCard from './Cards/InfoCard';
import GPUSelector from './GPUSelector';
import { GPUDashboardGraphs } from './Cards/GPUDashboardGraphs';
import WorkloadsCard from './Cards/WorkloadsCard';
import { i18nNs } from '../../i18n';
import { useGPUDashboardContextValues, GPUDashboardContext } from './GPUDashboardContext';
import MIGCard from './Cards/MIGCard';

const GPUDashboard: React.FC = () => {
  const { t } = useTranslation(i18nNs);
  const gpuContextValues = useGPUDashboardContextValues();

  return (
    <GPUDashboardContext.Provider value={gpuContextValues}>
      <Page>
        <PageSection isFilled>
          <Stack hasGutter>
            <StackItem>
              <Split hasGutter>
                <SplitItem isFilled>
                  <Title headingLevel="h1">{t('GPUs')}</Title>
                </SplitItem>
                <SplitItem>
                  <GPUSelector />
                </SplitItem>
              </Split>
            </StackItem>
            <StackItem>
              <Grid hasGutter>
                <GridItem span={6}>
                  <MIGCard />
                </GridItem>
                <GridItem span={6}>
                  <InfoCard />
                </GridItem>
              </Grid>
            </StackItem>
            <StackItem>
              <GPUDashboardGraphs />
            </StackItem>
            <StackItem>
              <WorkloadsCard />
            </StackItem>
          </Stack>
        </PageSection>
      </Page>
    </GPUDashboardContext.Provider>
  );
};

export default GPUDashboard;
