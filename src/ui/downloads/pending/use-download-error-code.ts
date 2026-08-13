import { usePendingDownloadsState } from './use-pending-downloads-state';

export function useDownloadErrorCode(downloadId: string) {
  const { errorCode } = usePendingDownloadsState();

  return errorCode[downloadId];
}
