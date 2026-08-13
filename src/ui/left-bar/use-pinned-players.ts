import { useEffect, useState } from 'react';
import type { PinnedPlayer } from 'csdm/common/types/pinned-player';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { usePinnedPlayerSteamIds } from 'csdm/ui/settings/use-pinned-player-steamids';

// Returns the pinned players with their name and avatar.
// Players are returned in the same order as the pinned SteamIDs setting.
// While names are being fetched (or if the fetch failed) the SteamID is used as name.
export function usePinnedPlayers(): PinnedPlayer[] {
  const client = useWebSocketClient();
  const steamIds = usePinnedPlayerSteamIds();
  const [players, setPlayers] = useState<PinnedPlayer[]>([]);
  // Settings are replaced on each update, the key prevents fetching players again when unrelated settings change.
  const steamIdsKey = steamIds.join(',');

  useEffect(() => {
    let isEffectActive = true;

    const fetchPlayers = async () => {
      if (steamIdsKey === '') {
        setPlayers([]);
        return;
      }

      try {
        const pinnedPlayers = await client.send({
          name: RendererClientMessageName.FetchPinnedPlayers,
          payload: steamIdsKey.split(','),
        });
        if (isEffectActive) {
          setPlayers(pinnedPlayers);
        }
      } catch (error) {
        logger.error('Error while fetching pinned players');
        logger.error(error);
      }
    };

    void fetchPlayers();

    return () => {
      isEffectActive = false;
    };
  }, [client, steamIdsKey]);

  return steamIds.map((steamId) => {
    const player = players.find((pinnedPlayer) => {
      return pinnedPlayer.steamId === steamId;
    });

    return player ?? { steamId, name: steamId, avatar: null };
  });
}
