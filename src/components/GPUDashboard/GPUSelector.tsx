import * as React from 'react';
import { SelectOption, DropdownPosition, Select, Card, Spinner } from '@patternfly/react-core';
import { GPUDashboardContext } from './GPUDashboardContext';
import { useTranslation } from '../../i18n';

const GPUSelector: React.FC = () => {
  const { t } = useTranslation();
  const { selectedGPU, gpus, setSelectedGPU, gpusLoading, gpusError } =
    React.useContext(GPUDashboardContext);
  const [isOpen, setOpen] = React.useState(false);

  const isDisabled = !gpus?.length || !!gpusError || gpusLoading;

  let items: React.ReactElement[];

  if (gpusLoading) {
    items = [
      <SelectOption key="disabled" value={t('Loading GPUs')}>
        <Spinner size="md" /> {t('Loading GPUs')}
      </SelectOption>,
    ];
  } else if (!gpus?.length || gpusError) {
    items = [<SelectOption key="disabled" value={t('No GPU found')} />];
  } else {
    items = gpus.map((gpu) => (
      <SelectOption
        key={gpu.uuid}
        value={gpu.uuid}
        description={`Node: ${gpu.nodeName}, Model: ${gpu.modelName}`}
      />
    ));
  }

  return (
    <Card>
      <Select
        onSelect={(e, selection: string) => {
          setSelectedGPU(selection);
          setOpen(false);
        }}
        onToggle={setOpen}
        isOpen={isOpen}
        isDisabled={isDisabled}
        position={DropdownPosition.right}
        selections={selectedGPU?.uuid}
      >
        {items}
      </Select>
    </Card>
  );
};

export default GPUSelector;
