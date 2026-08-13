import type { ErrorCode } from 'csdm/common/error-code';
import type { Game } from 'csdm/common/types/counter-strike';
import type { FaceitMatch } from 'csdm/common/types/faceit-match';
import type { ValveMatch } from 'csdm/common/types/valve-match';
import type { FiveEPlayMatch } from '../types/5eplay-match';
import type { RenownMatch } from '../types/renown-match';

export const DownloadSource = {
  Valve: 'valve',
  Faceit: 'faceit',
  '5EPlay': '5eplay',
  Renown: 'renown',
} as const;
export type DownloadSource = (typeof DownloadSource)[keyof typeof DownloadSource];

// A match may hold several demos (i.e. a best of 3), downloads are identified by their own id instead of the match's
// id. It's the match's id when the match holds a single demo.
export type DownloadIdentity = {
  id: string;
  matchId: string;
};

export type DownloadDemoProgressPayload = DownloadIdentity & {
  progress: number;
};

export type DownloadDemoErrorPayload = DownloadIdentity & {
  errorCode: ErrorCode | undefined;
};

export type DownloadDemoSuccess = {
  download: Download;
  demoChecksum: string;
};

type BaseDownload = DownloadIdentity & {
  game: Game;
  fileName: string;
  demoUrl: string;
};

export type ValveDownload = BaseDownload & {
  source: typeof DownloadSource.Valve;
  match: ValveMatch;
};

export type FaceitDownload = BaseDownload & {
  source: typeof DownloadSource.Faceit;
  match: FaceitMatch;
};

export type FiveEPlayDownload = BaseDownload & {
  source: (typeof DownloadSource)['5EPlay'];
  match: FiveEPlayMatch;
};

export type RenownDownload = BaseDownload & {
  source: typeof DownloadSource.Renown;
  match: RenownMatch;
};

export type Download = ValveDownload | FaceitDownload | FiveEPlayDownload | RenownDownload;
