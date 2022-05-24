import * as React from 'react';
import { Card, CardBody, CardTitle, Skeleton, CardFooter } from '@patternfly/react-core';
import {
  usePrometheusPoll,
  PrometheusEndpoint,
  HumanizeResult,
  Humanize,
} from '@openshift-console/dynamic-plugin-sdk';
import {
  ChartArea,
  ChartDonutUtilization,
  ChartGroup,
  ChartVoronoiContainer,
} from '@patternfly/react-charts';
import { useTranslation } from 'react-i18next';
import {
  getPrometheusResultScalarNumber,
  getPrometheusResultTimeSerie,
} from '../../../utils/prometheus';
import { i18nNs } from '../../../i18n';
import { timeFormatter } from '../../../utils/time';
import { useRefWidth } from '../../../hooks/use-ref-width';

import './MetricsCard.css';

type MetricsCardProps = {
  query: string;
  loading: boolean;
  humanize: Humanize;
  title: string;
  ariaTitle: string;
  ariaDesc: string;
  ariaRangeTitle: string;
  error: boolean;
  maxDomain?: number;
  maxQuery?: string;
  defaultUnit?: string;
};

const MetricsCard: React.FC<MetricsCardProps> = ({
  query,
  loading,
  ariaTitle,
  title,
  maxDomain = 0,
  ariaDesc,
  ariaRangeTitle,
  humanize,
  defaultUnit,
  maxQuery,
  error,
}) => {
  const { t } = useTranslation(i18nNs);
  const [containerRef, width] = useRefWidth();
  const [result, queryLoading, queryError] = usePrometheusPoll({
    endpoint: PrometheusEndpoint.QUERY,
    // do not run the query if there is an error
    query: error || loading ? undefined : query,
  });

  const [maxResult, maxLoading, maxError] = usePrometheusPoll({
    endpoint: PrometheusEndpoint.QUERY,
    // do not run the query if there is an error
    query: error || loading ? undefined : maxQuery,
  });

  const timeSerie = getPrometheusResultTimeSerie(result);
  const max = maxDomain || getPrometheusResultScalarNumber(maxResult);

  loading = loading || queryLoading || maxLoading || !result || !max;

  error =
    error ||
    !!queryError ||
    !!maxError ||
    (!loading && (timeSerie === undefined || max === undefined));
  const timeData = timeSerie?.map((pair) => ({
    x: pair.time,
    y: pair.value,
  }));

  let actualInPercents;
  const latestValue = timeData?.[timeData?.length - 1].y;
  let currentValue: HumanizeResult | undefined = undefined;
  if (!error && latestValue !== undefined) {
    currentValue = humanize(latestValue, defaultUnit);
    actualInPercents = max ? (latestValue / max) * 100 : 0;
  }

  return (
    <Card className="ng-metrics-card">
      <CardTitle className="pf-u-text-align-center">{title}</CardTitle>
      <CardBody>
        {loading && !error ? (
          <Skeleton shape="circle" width="100%" screenreaderText={t('Loading card content')} />
        ) : (
          <ChartDonutUtilization
            ariaDesc={title}
            ariaTitle={ariaTitle}
            constrainToVisibleArea={true}
            data={error ? { x: 0 } : { x: title, y: actualInPercents }}
            labels={({ datum }) => (datum.x ? `${title}: ${currentValue?.string}` : null)}
            title={error ? t('Not available') : `${currentValue?.string}`}
            thresholds={[{ value: 60 }, { value: 80 }]}
          />
        )}
      </CardBody>
      <CardFooter className="ng-metrics-card">
        {loading && !error ? (
          <div style={{ height: '70px' }}>
            <Skeleton width="100%" height="100%" screenreaderText={t('Loading card content')} />
          </div>
        ) : (
          !error && (
            <div ref={containerRef} className="ng-metrics-card__graph">
              <ChartGroup
                ariaDesc={ariaDesc}
                ariaTitle={ariaRangeTitle}
                containerComponent={
                  <ChartVoronoiContainer
                    activateData={false}
                    voronoiDimension="x"
                    labels={({ datum }) =>
                      `${
                        humanize(datum.y, defaultUnit, currentValue?.unit).string
                      } at ${timeFormatter.format(new Date(datum.x * 1000))}`
                    }
                  />
                }
                height={60}
                width={width}
                maxDomain={{ y: timeData ? Math.max(...timeData.map((td) => td.y)) * 1.2 : 0 }}
                padding={0}
              >
                <ChartArea data={timeData} scale={{ x: 'time', y: 'linear' }} height={90} />
              </ChartGroup>
            </div>
          )
        )}
      </CardFooter>
    </Card>
  );
};

export default MetricsCard;
