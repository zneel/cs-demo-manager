import React from 'react';
import { Trans } from '@lingui/react/macro';
import { ExclamationTriangleIcon } from 'csdm/ui/icons/exclamation-triangle-icon';
import { ExternalLink } from 'csdm/ui/components/external-link';
import { useSettings } from 'csdm/ui/settings/use-settings';

export function FaceitDownloadsWarning() {
  const { faceitApiKey } = useSettings();

  if (faceitApiKey !== '') {
    return null;
  }

  return (
    <div className="mx-auto flex items-center gap-x-8 py-8">
      <ExclamationTriangleIcon className="size-32 text-orange-700" />
      <div>
        <p className="selectable">
          <Trans>
            FACEIT restricted demo downloads through a{' '}
            <ExternalLink href="https://docs.faceit.com/getting-started/Guides/download-api">
              private Download API
            </ExternalLink>
            . To download demos you have to provide a FACEIT API key that has been granted access to it.
          </Trans>
        </p>
        <p className="selectable">
          <Trans>
            You can request access to the Download API from{' '}
            <ExternalLink href="https://fce.gg/downloads-api-application">this form</ExternalLink> and then enter your
            API key in the <strong>Integrations</strong> settings.
          </Trans>
        </p>
        <p className="selectable">
          <Trans>In the meantime, you have to download demos from your browser.</Trans>
        </p>
      </div>
    </div>
  );
}
