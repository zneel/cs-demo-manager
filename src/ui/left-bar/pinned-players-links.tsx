import React from 'react';
import { Trans } from '@lingui/react/macro';
import { UserIcon } from 'csdm/ui/icons/user-icon';
import { RoutePath } from 'csdm/ui/routes-paths';
import { LeftBarLink } from './left-bar-link';
import { PinnedPlayerLink } from './pinned-player-link';
import { usePinnedPlayers } from './use-pinned-players';

export function PinnedPlayersLinks() {
  const pinnedPlayers = usePinnedPlayers();

  if (pinnedPlayers.length === 0) {
    return (
      <LeftBarLink
        icon={<UserIcon />}
        tooltip={<Trans context="Tooltip">Pinned players</Trans>}
        url={RoutePath.PinnedPlayers}
      />
    );
  }

  return pinnedPlayers.map((player) => {
    return <PinnedPlayerLink key={player.steamId} player={player} />;
  });
}
