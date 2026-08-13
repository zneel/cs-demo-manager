import { DownloadStatus } from 'csdm/common/types/download-status';
import { downloadDemoQueue } from 'csdm/server/download-queue';
import type { FaceitDownload } from 'csdm/common/download/download-types';
import { buildDownloadsFromFaceitMatch } from 'csdm/common/download/build-faceit-demos';
import { fetchCurrentFaceitAccount } from 'csdm/node/database/faceit-account/fetch-current-faceit-account';
import { fetchLastFaceitMatches } from 'csdm/node/faceit/fetch-last-faceit-matches';
import { fetchDownloadHistories } from 'csdm/node/database/download-history/fetch-download-histories';

export async function downloadLastFaceitMatches() {
  const currentAccount = await fetchCurrentFaceitAccount();
  if (!currentAccount) {
    return [];
  }

  const [matches, downloadHistories] = await Promise.all([
    fetchLastFaceitMatches(currentAccount.id),
    fetchDownloadHistories(),
  ]);

  const downloadedIds = downloadHistories.map((history) => history.download_id);
  // A match may hold several demos (i.e. a best of 3), each of them is downloaded on its own.
  const downloads: FaceitDownload[] = matches.flatMap((match) => {
    return buildDownloadsFromFaceitMatch(match).filter((download) => {
      const demo = match.demos.find(({ id }) => id === download.id);

      return demo?.downloadStatus === DownloadStatus.NotDownloaded && !downloadedIds.includes(download.id);
    });
  });

  const downloadsAdded = await downloadDemoQueue.addDownloads(downloads);

  return downloadsAdded;
}
