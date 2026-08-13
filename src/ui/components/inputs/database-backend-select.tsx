import React from 'react';
import { Trans } from '@lingui/react/macro';
import { Select } from 'csdm/ui/components/inputs/select';
import { DatabaseBackend } from 'csdm/common/types/database-backend';

type Props = {
  backend: DatabaseBackend;
  onChange: (backend: DatabaseBackend) => void;
  isDisabled?: boolean;
};

export function DatabaseBackendSelect({ backend, onChange, isDisabled = false }: Props) {
  return (
    <Select<DatabaseBackend>
      label={<Trans context="Select label">Database</Trans>}
      value={backend}
      isDisabled={isDisabled}
      onChange={onChange}
      options={[
        {
          value: DatabaseBackend.Pglite,
          label: <Trans context="Database backend">Embedded (recommended)</Trans>,
        },
        {
          value: DatabaseBackend.Postgresql,
          label: <Trans context="Database backend">PostgreSQL server</Trans>,
        },
      ]}
    />
  );
}
