import { fetchPinnedPlayers } from 'csdm/node/database/players/fetch-pinned-players';
import { handleError } from '../../handle-error';

export async function fetchPinnedPlayersHandler(steamIds: string[]) {
  try {
    const players = await fetchPinnedPlayers(steamIds);

    return players;
  } catch (error) {
    handleError(error, 'Error while fetching pinned players');
  }
}
