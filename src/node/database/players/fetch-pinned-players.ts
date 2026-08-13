import type { PinnedPlayer } from 'csdm/common/types/pinned-player';
import { fetchLastPlayersData } from './fetch-last-players-data';

export async function fetchPinnedPlayers(steamIds: string[]): Promise<PinnedPlayer[]> {
  const lastPlayersData = await fetchLastPlayersData(steamIds);

  // Players may not be in the database anymore (matches deleted…), in that case we fallback to their SteamID.
  return steamIds.map((steamId) => {
    const lastPlayerData = lastPlayersData.find((row) => {
      return row.steamId === steamId;
    });

    return {
      steamId,
      name: lastPlayerData?.lastKnownName ?? lastPlayerData?.name ?? steamId,
      avatar: lastPlayerData?.avatar ?? null,
    };
  });
}
