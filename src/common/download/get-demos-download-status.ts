import { DownloadStatus } from 'csdm/common/types/download-status';

// Returns the download status of a match from the status of each of its demos.
// Matches holding several demos (i.e. a best of 3) are downloaded one demo at a time, the match's status summarizes
// them: an in-progress or failing demo takes precedence over the demos already downloaded so that the issue is not
// hidden, and a match is fully downloaded only once all its demos are.
export function getDemosDownloadStatus(statuses: DownloadStatus[]): DownloadStatus {
  if (statuses.length === 0) {
    return DownloadStatus.Expired;
  }

  if (statuses.every((status) => status === DownloadStatus.Downloaded)) {
    return DownloadStatus.Downloaded;
  }

  const statusesByPriority = [
    DownloadStatus.Downloading,
    DownloadStatus.Corrupted,
    DownloadStatus.Error,
    DownloadStatus.PartiallyDownloaded,
  ];
  for (const status of statusesByPriority) {
    if (statuses.includes(status)) {
      return status;
    }
  }

  if (statuses.includes(DownloadStatus.Downloaded)) {
    return DownloadStatus.PartiallyDownloaded;
  }

  if (statuses.every((status) => status === DownloadStatus.Expired)) {
    return DownloadStatus.Expired;
  }

  return DownloadStatus.NotDownloaded;
}
