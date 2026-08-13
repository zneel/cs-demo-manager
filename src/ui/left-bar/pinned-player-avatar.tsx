import React, { useState } from 'react';
import clsx from 'clsx';
import type { PinnedPlayer } from 'csdm/common/types/pinned-player';

const SIZE_IN_PIXELS = 24;

// Backgrounds are light enough to keep the initials readable in black.
const backgroundClassNames = ['bg-cs-yellow', 'bg-cs-green', 'bg-cs-orange', 'bg-cs-blue'];

function getBackgroundClassName(steamId: string) {
  // djb2, SteamIDs share a long common prefix and summing their characters would give the same color to most of them.
  let hash = 5381;
  for (const character of steamId) {
    hash = (hash * 33 + (character.codePointAt(0) ?? 0)) | 0;
  }

  return backgroundClassNames[Math.abs(hash) % backgroundClassNames.length];
}

function getInitials({ steamId, name }: PinnedPlayer) {
  // Players without a Steam account nor an analyzed demo are named after their SteamID, its last digits are the only
  // part that tells them apart.
  if (name === steamId) {
    return steamId.slice(-2);
  }

  // Segmented instead of sliced because Steam names often contain emojis and other multi code point characters.
  const characters = Array.from(new Intl.Segmenter().segment(name.trim()), (segment) => {
    return segment.segment;
  });

  return characters.slice(0, 2).join('').toUpperCase();
}

type Props = {
  player: PinnedPlayer;
};

// Steam avatars are missing when the Steam API is unreachable or when the account has never been synced, and their URL
// may also be outdated since Steam changes it when a player updates its avatar.
// Initials are used in both cases, the shared default avatar would make all pinned players look the same.
export function PinnedPlayerAvatar({ player }: Props) {
  // Holding the URL rather than a boolean resets the fallback once the player gets a new avatar.
  const [unreachableAvatarUrl, setUnreachableAvatarUrl] = useState<string | null>(null);
  const hasAvatar = player.avatar !== null && player.avatar !== '' && player.avatar !== unreachableAvatarUrl;

  const onError = () => {
    setUnreachableAvatarUrl(player.avatar);
  };

  if (!hasAvatar) {
    return (
      <div
        className={clsx(
          'flex items-center justify-center border border-gray-300 text-caption text-black',
          getBackgroundClassName(player.steamId),
        )}
        style={{
          width: SIZE_IN_PIXELS,
          height: SIZE_IN_PIXELS,
        }}
      >
        {getInitials(player)}
      </div>
    );
  }

  return (
    <img
      className="border border-gray-300"
      src={player.avatar ?? undefined}
      onError={onError}
      style={{
        width: SIZE_IN_PIXELS,
        height: SIZE_IN_PIXELS,
      }}
    />
  );
}
