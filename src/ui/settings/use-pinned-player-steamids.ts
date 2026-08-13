import { useSettings } from './use-settings';

export function usePinnedPlayerSteamIds() {
  const settings = useSettings();

  return settings.pinnedPlayerSteamIds;
}
