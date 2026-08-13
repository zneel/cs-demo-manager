import type { Game } from 'csdm/common/types/counter-strike';
import type { DownloadStatus } from 'csdm/common/types/download-status';

export type FaceitPlayer = {
  id: string;
  name: string;
  avatarUrl: string;
  teamId: string;
  teamName: string;
  killCount: number;
  assistCount: number;
  deathCount: number;
  headshotCount: number;
  headshotPercentage: number;
  killDeathRatio: number;
  killPerRound: number;
  mvpCount: number;
  threeKillCount: number;
  fourKillCount: number;
  fiveKillCount: number;
};

export type FaceitTeam = {
  id: string;
  name: string;
  score: number;
  firstHalfScore: number;
  secondHalfScore: number;
  overtimeScore: number;
};

// A FACEIT match may hold several demos, one per map played (i.e. a best of 3).
export type FaceitDemo = {
  // Identity of the demo's download, it's the match's id when the match holds a single demo.
  id: string;
  // The FACEIT resource URL of the demo, it requires the Download API to be downloaded.
  url: string;
  // Name of the demo file in the download folder, without its extension.
  fileName: string;
  downloadStatus: DownloadStatus;
};

export type FaceitMatch = {
  id: string;
  game: Game;
  date: string;
  durationInSeconds: number;
  demos: FaceitDemo[];
  mapName: string;
  gameMode: string;
  url: string;
  players: FaceitPlayer[];
  teams: FaceitTeam[];
  winnerId: string;
  winnerName: string;
  downloadStatus: DownloadStatus;
};
