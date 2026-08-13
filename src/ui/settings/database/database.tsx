import React from 'react';
import { Trans } from '@lingui/react/macro';
import { PortInput } from '../../components/inputs/port-input';
import { DatabaseNameInput } from '../../components/inputs/database-name-input';
import { UsernameInput } from '../../components/inputs/username-input';
import { PasswordInput } from '../../components/inputs/password-input';
import { DisconnectDatabaseButton } from './disconnect-database-button';
import { useDatabaseSettings } from './use-database-settings';
import { HostnameInput } from 'csdm/ui/components/inputs/hostname-input';
import { DatabaseBackend } from 'csdm/common/types/database-backend';

export function Database() {
  const databaseSettings = useDatabaseSettings();

  return (
    <div className="flex max-w-[264px] flex-col gap-y-8">
      {databaseSettings.backend === DatabaseBackend.Postgresql ? (
        <>
          <HostnameInput hostname={databaseSettings.hostname} />
          <DatabaseNameInput databaseName={databaseSettings.database} />
          <UsernameInput username={databaseSettings.username} />
          <PasswordInput password={databaseSettings.password} />
          <PortInput port={databaseSettings.port} />
        </>
      ) : (
        <p>
          <Trans>The app is using its embedded database, no PostgreSQL server is required.</Trans>
        </p>
      )}
      <div className="mt-12">
        <DisconnectDatabaseButton />
      </div>
    </div>
  );
}
