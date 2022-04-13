import * as React from 'react';
import {
  ChartArea,
  ChartDonutUtilization,
  ChartGroup,
  ChartVoronoiContainer,
} from '@patternfly/react-charts';
import { CardBody, CardFooter } from '@patternfly/react-core';
import { humanize } from '@openshift-console/dynamic-plugin-sdk';
import { GPUDashboardCardGraphsProps } from './types';

export const GPUDashboardCardGraphs: React.FC<GPUDashboardCardGraphsProps> = ({
  title,
  ariaTitle,
  rangeTitle,
  rangeDescription,
  scalarValue,
  timeSerie,
  unit,
  maxDomain,
  thresholds,
}) => {
  const now = new Date();
  const getDatumLabel = ({ datum }) => {
    const dateTime = new Date(datum.x * 1000);
    return `${humanize.fromNow(dateTime, now)}: ${datum.y}`;
  };

  const timeData = timeSerie.map((pair) => ({
    name: title,
    x: pair.time,
    y: pair.value,
  }));

  if (!maxDomain) {
    // TODO: read that from GPU info once it is available
    maxDomain = Math.max(...timeSerie.map((pair) => pair.value));
  }

  const actualInPercents = (scalarValue / maxDomain) * 100;
  maxDomain = maxDomain * 1.2; // Add 20% for the sparkline chart. Can we have minus values for something??

  return (
    <>
      <CardBody>
        <ChartDonutUtilization
          ariaDesc={title}
          ariaTitle={ariaTitle}
          constrainToVisibleArea={true}
          data={{ x: title, y: actualInPercents }}
          labels={({ datum }) => (datum.x ? `${datum.x}: ${datum.y}${unit}` : null)}
          // subTitle=""
          title={`${scalarValue}${unit}`}
          thresholds={thresholds}
        />
      </CardBody>
      <CardFooter>
        <ChartGroup
          ariaDesc={rangeDescription}
          ariaTitle={rangeTitle}
          containerComponent={
            <ChartVoronoiContainer labels={getDatumLabel} constrainToVisibleArea={true} />
          }
          height={90}
          maxDomain={{ y: maxDomain }}
          padding={0}
        >
          <ChartArea data={timeData} />
        </ChartGroup>
      </CardFooter>
    </>
  );
};
