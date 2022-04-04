import {
  ChartArea,
  ChartDonutUtilization,
  ChartGroup,
  ChartVoronoiContainer,
} from '@patternfly/react-charts';
import {
  Card,
  CardBody,
  CardFooter,
  CardTitle,
  Gallery,
  Page,
  PageSection,
} from '@patternfly/react-core';
import * as React from 'react';

/* Chaotic list of TODOs:
  - Add "New" badge in gpu-dashboard nav item - replace string by a component in console-extensions.json
*/

// https://issues.redhat.com/browse/MGMT-9263
// https://miro.com/app/board/uXjVOeUB2B4=/?moveToWidget=3458764514332229879&cot=14

const GPUDashboard: React.FC = () => {
  return (
    <Page>
      <PageSection isFilled>
        <Gallery>
          <Card>
            <CardTitle className="pf-u-text-align-center">GPU utilization</CardTitle>
            <CardBody>
              <ChartDonutUtilization
                ariaDesc="GPU utilization"
                ariaTitle="Donut GPU utilization"
                constrainToVisibleArea={true}
                data={{ x: 'Not used', y: 55 }}
                labels={({ datum }) => (datum.x ? `GPU utilization: ${datum.y}%` : null)}
                // subTitle=""
                title="55%"
              />
            </CardBody>
            <CardFooter>
              <ChartGroup
                ariaDesc="GPU utilization over time"
                ariaTitle="Sparkline GPU utilization"
                containerComponent={
                  <ChartVoronoiContainer
                    labels={({ datum }) => `GPU utilization at ${datum.x}: ${datum.y}`}
                    constrainToVisibleArea
                  />
                }
                height={70}
                maxDomain={{ y: 100 }}
                padding={0}
              >
                <ChartArea
                  data={[
                    { name: 'Utilization', x: '2015', y: 30 },
                    { name: 'Utilization', x: '2016', y: 40 },
                    { name: 'Utilization', x: '2017', y: 80 },
                    { name: 'Utilization', x: '2018', y: 60 },
                  ]}
                />
              </ChartGroup>
            </CardFooter>
          </Card>
        </Gallery>
      </PageSection>
    </Page>
  );
};

export default GPUDashboard;
