export const DownloadStatus = {
  NotDownloaded: 'not-downloaded',
  Downloaded: 'downloaded',
  // Only some demos of a match holding several demos have been downloaded.
  PartiallyDownloaded: 'partially-downloaded',
  Downloading: 'downloading',
  Error: 'error',
  Expired: 'expired',
  Corrupted: 'corrupted',
} as const;

export type DownloadStatus = (typeof DownloadStatus)[keyof typeof DownloadStatus];
