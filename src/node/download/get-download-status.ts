import path from 'node:path';
import fs from 'fs-extra';
import { DownloadStatus } from 'csdm/common/types/download-status';
import { isDownloadLinkExpired } from 'csdm/node/download/is-download-link-expired';

async function isDemoInDownloadFolder(downloadFolderPath: string | undefined, matchId: string | number) {
  if (downloadFolderPath === undefined) {
    return false;
  }

  const demoPath = path.join(downloadFolderPath, `${matchId}.dem`);

  return fs.pathExists(demoPath);
}

export async function getDownloadStatus(
  downloadFolderPath: string | undefined,
  matchId: string | number,
  demoUrl: string,
) {
  const demoExists = await isDemoInDownloadFolder(downloadFolderPath, matchId);
  if (demoExists) {
    return DownloadStatus.Downloaded;
  }

  const downloadLinkExpired = await isDownloadLinkExpired(demoUrl);
  if (downloadLinkExpired) {
    return DownloadStatus.Expired;
  }

  return DownloadStatus.NotDownloaded;
}

// Some providers protect their demos links, the only way to know if a link is still valid is to try to download it.
export async function getProtectedDemoDownloadStatus(
  downloadFolderPath: string | undefined,
  matchId: string | number,
  demoUrl: string,
) {
  const demoExists = await isDemoInDownloadFolder(downloadFolderPath, matchId);
  if (demoExists) {
    return DownloadStatus.Downloaded;
  }

  if (demoUrl === '') {
    return DownloadStatus.Expired;
  }

  return DownloadStatus.NotDownloaded;
}
