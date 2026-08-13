import type { PinnedPlayer } from 'csdm/common/types/pinned-player';
import { db } from '../database';
import { buildSteamAccountsFromSteamIds } from '../steam-accounts/build-steam-accounts-from-steam-ids';
import { insertSteamAccounts } from '../steam-accounts/insert-steam-accounts';

// Same expiration than the periodic sync with Steam done by the checkForNewBannedSteamAccounts task.
const STEAM_PROFILE_EXPIRATION_IN_MILLISECONDS = 3600 * 24 * 1000;

// Pinned players are displayed with their Steam profile name and avatar.
// The account is missing when the player has no analyzed demo yet (pinned from a Valve/FACEIT scoreboard…) and it may
// be outdated since Steam changes the avatar URL when a player updates its avatar.
// Only a few players are pinned, refreshing their profile is cheap and doesn't depend on the periodic sync with Steam
// which updates every known account at once and may be skipped or rate limited.
async function updateOutdatedSteamProfiles(steamIds: string[]) {
  const rows = await db
    .selectFrom('steam_accounts')
    .select(['steam_id', 'updated_at'])
    .where('steam_id', 'in', steamIds)
    .execute();

  const outdatedSteamIds = steamIds.filter((steamId) => {
    const row = rows.find((row) => {
      return row.steam_id === steamId;
    });

    return row === undefined || Date.now() - row.updated_at.getTime() >= STEAM_PROFILE_EXPIRATION_IN_MILLISECONDS;
  });

  if (outdatedSteamIds.length === 0) {
    return;
  }

  const steamAccounts = await buildSteamAccountsFromSteamIds(outdatedSteamIds);
  if (steamAccounts.length > 0) {
    // Rows are upserted, the updated_at column is bumped by a trigger which makes the next refresh happen a day later.
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
    await updateOutdatedSteamProfiles(steamIds);
  } catch (error) {
    // The Steam API may be unreachable, rate limited or the Steam API key may be invalid, it's not a reason to not
    // display pinned players. The name and avatar previously stored are used, or the player initials as a last resort.
    logger.warn('Error while fetching the Steam profiles of pinned players');
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
