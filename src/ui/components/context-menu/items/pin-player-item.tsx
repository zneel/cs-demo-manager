import React from 'react';
import { Trans } from '@lingui/react/macro';
import { useUpdateSettings } from 'csdm/ui/settings/use-update-settings';
import { usePinnedPlayerSteamIds } from 'csdm/ui/settings/use-pinned-player-steamids';
import { ContextMenuItem } from '../context-menu-item';

type Props = {
  steamId: string;
};

export function PinPlayerItem({ steamId }: Props) {
  const updateSettings = useUpdateSettings();
  const pinnedPlayerSteamIds = usePinnedPlayerSteamIds();
  const isPinned = pinnedPlayerSteamIds.includes(steamId);

  const onClick = async () => {
    const steamIds = isPinned
      ? pinnedPlayerSteamIds.filter((pinnedPlayerSteamId) => {
          return pinnedPlayerSteamId !== steamId;
        })
      : [...pinnedPlayerSteamIds, steamId];

    await updateSettings(
      {
        pinnedPlayerSteamIds: steamIds,
      },
      {
        preserveSourceArray: true,
      },
    );
  };

  return (
    <ContextMenuItem onClick={onClick}>
      {isPinned ? (
        <Trans context="Context menu">Unpin this player</Trans>
      ) : (
        <Trans context="Context menu">Pin this player</Trans>
      )}
    </ContextMenuItem>
  );
}
