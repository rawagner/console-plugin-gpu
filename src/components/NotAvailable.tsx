import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { i18nNs } from '../i18n';

import '@patternfly/react-styles/css/utilities/Text/text.css';

const NotAvailable = () => {
  const { t } = useTranslation(i18nNs);
  return <div className="pf-u-color-200">{t('Not available')}</div>;
};

export default NotAvailable;
