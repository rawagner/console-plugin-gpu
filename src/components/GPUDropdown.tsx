import * as React from 'react';
import { Dropdown, DropdownItem, DropdownPosition, DropdownToggle } from '@patternfly/react-core';
import { CaretDownIcon } from '@patternfly/react-icons';
import { GPUInfo } from '../utils/gpuInfo';

type GPUDropdownProps = {
  gpus?: GPUInfo[];
  onSelect: (uuid: string) => void;
  selectedUuid?: string;
  className?: string;
};

export const GPUDropdown: React.FC<GPUDropdownProps> = ({
  selectedUuid,
  gpus,
  onSelect,
  className,
}) => {
  const [isOpen, setOpen] = React.useState(false);

  const toggle = (
    <DropdownToggle onToggle={() => setOpen(!isOpen)} toggleIndicator={CaretDownIcon}>
      {selectedUuid}
    </DropdownToggle>
  );

  const items =
    gpus?.map((gpu) => (
      <DropdownItem key={gpu.uuid} id={gpu.uuid}>
        {gpu.uuid}
      </DropdownItem>
    )) || [];

  return (
    <Dropdown
      onSelect={(e) => {
        onSelect(e.currentTarget.id);
        setOpen(false);
      }}
      dropdownItems={items}
      toggle={toggle}
      isOpen={isOpen}
      className={className}
      disabled={!gpus?.length}
      position={DropdownPosition.right}
    />
  );
};
