/* eslint-disable */
import * as React from 'react';
import classNames from 'classnames';

const MEMO: any = {};

const CamelCaseWrap: React.FC<CamelCaseWrapProps> = ({ value, dataTest }) => {
  if (!value) {
    return '-';
  }

  if (MEMO[value]) {
    return MEMO[value];
  }

  // Add word break points before capital letters (but keep consecutive capital letters together).
  const words = value.match(/[A-Z]+[^A-Z]*|[^A-Z]+/g);
  const rendered = (
    <span data-test={dataTest}>
      {words?.map((word, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <React.Fragment key={i}>
          {word}
          {i !== words.length - 1 && <wbr />}
        </React.Fragment>
      ))}
    </span>
  );
  MEMO[value] = rendered;
  return rendered;
};

type CamelCaseWrapProps = {
  value: string;
  dataTest?: string;
};

type StatusIconAndTextProps = any & {
  icon?: React.ReactElement;
  spin?: boolean;
};

const StatusIconAndText: React.FC<StatusIconAndTextProps> = ({
  icon,
  title,
  spin,
  iconOnly,
  noTooltip,
  className,
}) => {
  if (!title) {
    return <>-</>;
  }

  return (
    <span
      className={classNames('co-icon-and-text', className)}
      title={iconOnly && !noTooltip ? title : undefined}
    >
      {icon &&
        React.cloneElement(icon, {
          className: classNames(
            spin && 'fa-spin',
            icon.props.className,
            !iconOnly && 'co-icon-and-text__icon co-icon-flex-child',
          ),
        })}
      {!iconOnly && <CamelCaseWrap value={title} dataTest="status-text" />}
    </span>
  );
};

export default StatusIconAndText;
