import React from 'react';
import { Navigate } from 'react-router';
import { Trans } from '@lingui/react/macro';
import { usePinnedPlayerSteamIds } from 'csdm/ui/settings/use-pinned-player-steamids';
import { CenteredContent } from 'csdm/ui/components/content';
import { buildPlayerPath } from '../routes-paths';

export function PinnedPlayers() {
  const pinnedPlayerSteamIds = usePinnedPlayerSteamIds();
  const [firstPinnedPlayerSteamId] = pinnedPlayerSteamIds;

  if (firstPinnedPlayerSteamId === undefined) {
    return (
      <CenteredContent>
        <p>
          <Trans>No pinned player found.</Trans>
        </p>
        <p>
          <Trans>You can pin players from scoreboards or the players list.</Trans>
        </p>
      </CenteredContent>
    );
  }

  return <Navigate to={buildPlayerPath(firstPinnedPlayerSteamId)} />;
}
