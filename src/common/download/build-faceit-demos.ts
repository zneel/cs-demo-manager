import { DownloadStatus } from 'csdm/common/types/download-status';
import type { FaceitDemo, FaceitMatch } from 'csdm/common/types/faceit-match';
import type { FaceitDownload } from './download-types';
import { DownloadSource } from './download-types';

// Builds the demos of a FACEIT match from the resource URLs returned by the Data API.
// A match holding a single demo keeps the match's id as both its download id and its file name, so that demos
// downloaded before multi-demo matches were supported are still recognized. Matches holding several demos suffix them
// with the map's position in the match (i.e. <matchId>-1, <matchId>-2...).
export function buildFaceitDemos(matchId: string, demoUrls: string[]): FaceitDemo[] {
  return demoUrls.map((url, index) => {
    const suffix = demoUrls.length > 1 ? `-${index + 1}` : '';
    const name = `${matchId}${suffix}`;

    return {
      id: name,
      url,
      fileName: name,
      downloadStatus: DownloadStatus.NotDownloaded,
    };
  });
}

export function buildDownloadsFromFaceitMatch(match: FaceitMatch): FaceitDownload[] {
  return match.demos.map((demo) => {
    return {
      id: demo.id,
      matchId: match.id,
      demoUrl: demo.url,
      fileName: demo.fileName,
      game: match.game,
      source: DownloadSource.Faceit,
      match,
    };
  });
}
