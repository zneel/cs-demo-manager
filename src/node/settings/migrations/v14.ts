import type { Settings } from '../settings';
import type { Migration } from '../migration';
import { isBlankString } from 'csdm/common/string/is-empty-string';

const v14: Migration = {
  schemaVersion: 14,
  run: (settings: Settings) => {
    // @ts-expect-error The pinnedPlayerSteamId setting has been replaced by pinnedPlayerSteamIds
    const pinnedPlayerSteamId: unknown = settings.pinnedPlayerSteamId;
    settings.pinnedPlayerSteamIds =
      typeof pinnedPlayerSteamId === 'string' && !isBlankString(pinnedPlayerSteamId) ? [pinnedPlayerSteamId] : [];
    // @ts-expect-error Remove the deprecated pinnedPlayerSteamId setting
    delete settings.pinnedPlayerSteamId;

    return Promise.resolve(settings);
  },
};

export default v14;
