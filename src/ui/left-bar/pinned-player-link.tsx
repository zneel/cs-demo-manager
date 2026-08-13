import React from 'react';
import clsx from 'clsx';
import type { PinnedPlayer } from 'csdm/common/types/pinned-player';
import { buildPlayerPath } from 'csdm/ui/routes-paths';
import { LeftBarLink } from './left-bar-link';
import { PinnedPlayerAvatar } from './pinned-player-avatar';

type Props = {
  player: PinnedPlayer;
};

export function PinnedPlayerLink({ player }: Props) {
  return (
    <LeftBarLink
      icon={(isActive) => {
        return (
          <div className={clsx('flex', isActive ? 'opacity-100' : 'opacity-50')}>
            <PinnedPlayerAvatar player={player} />
          </div>
        );
      }}
      tooltip={player.name}
      url={buildPlayerPath(player.steamId)}
    />
  );
}
