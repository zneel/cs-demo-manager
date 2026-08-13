import type { PinnedPlayer } from 'csdm/common/types/pinned-player';
import { db } from '../database';
import { buildSteamAccountsFromSteamIds } from '../steam-accounts/build-steam-accounts-from-steam-ids';
import { insertSteamAccounts } from '../steam-accounts/insert-steam-accounts';

// Players can be pinned from places where they don't have any analyzed demo yet (Valve/FACEIT last matches
// scoreboards…), their name and avatar are then only available through the Steam API.
async function insertMissingSteamAccounts(steamIds: string[]) {
  const rows = await db.selectFrom('steam_accounts').select('steam_id').where('steam_id', 'in', steamIds).execute();
  const missingSteamIds = steamIds.filter((steamId) => {
    return !rows.some((row) => {
      return row.steam_id === steamId;
    });
  });

  if (missingSteamIds.length === 0) {
    return;
  }

  const steamAccounts = await buildSteamAccountsFromSteamIds(missingSteamIds);
  if (steamAccounts.length > 0) {
    await insertSteamAccounts(steamAccounts);
  }
}

function fetchSteamAccounts(steamIds: string[]) {
  return db
    .selectFrom('steam_accounts')
    .leftJoin('steam_account_overrides', 'steam_account_overrides.steam_id', 'steam_accounts.steam_id')
    .select([
      'steam_accounts.steam_id as steamId',
      db.fn.coalesce('steam_account_overrides.name', 'steam_accounts.name').as('name'),
      'steam_accounts.avatar as avatar',
    ])
    .where('steam_accounts.steam_id', 'in', steamIds)
    .execute();
}

// Last in-game name of each player, used when a player has no Steam account synced.
function fetchLastInGameNames(steamIds: string[]) {
  return db
    .selectFrom('players')
    .innerJoin('demos', 'demos.checksum', 'players.match_checksum')
    .select(['players.steam_id as steamId', 'players.name as name'])
    .distinctOn('players.steam_id')
    .where('players.steam_id', 'in', steamIds)
    .orderBy('players.steam_id')
    .orderBy('demos.date', 'desc')
    .execute();
}

export async function fetchPinnedPlayers(steamIds: string[]): Promise<PinnedPlayer[]> {
  if (steamIds.length === 0) {
    return [];
  }

  try {
    await insertMissingSteamAccounts(steamIds);
  } catch (error) {
    // The Steam API may be unreachable or rate limited, it's not a reason to not display pinned players.
    logger.warn('Error while fetching Steam accounts of pinned players');
    logger.warn(error);
  }

  const [steamAccounts, lastInGameNames] = await Promise.all([
    fetchSteamAccounts(steamIds),
    fetchLastInGameNames(steamIds),
  ]);

  return steamIds.map((steamId) => {
    const steamAccount = steamAccounts.find((account) => {
      return account.steamId === steamId;
    });
    const player = lastInGameNames.find((row) => {
      return row.steamId === steamId;
    });

    return {
      steamId,
      name: steamAccount?.name ?? player?.name ?? steamId,
      avatar: steamAccount?.avatar ?? null,
    };
  });
}
