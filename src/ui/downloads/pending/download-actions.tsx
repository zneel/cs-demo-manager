import React from 'react';
import { Trans } from '@lingui/react/macro';
import { SeeDemoButton } from 'csdm/ui/downloads/see-demo-button';
import { CheckCircleIcon } from 'csdm/ui/icons/check-circle-icon';
import { ExclamationTriangleIcon } from 'csdm/ui/icons/exclamation-triangle-icon';
import { ExpiredIcon as ClockIcon } from 'csdm/ui/icons/expired-icon';
import { PendingIcon } from 'csdm/ui/icons/pending-icon';
import { Progress } from 'csdm/ui/components/progress';
import { DownloadStatus } from 'csdm/common/types/download-status';
import { useDownloadProgress } from './use-download-progress';
import { useDownloadStatus } from './use-download-status';
import { RemoveDownloadButton } from './remove-download-button';
import { RevealDemoInExplorerButton } from 'csdm/ui/downloads/reveal-demo-in-explorer-button';
import { FileCorruptedIcon } from 'csdm/ui/icons/file-corrupted-icon';
import type { Download } from 'csdm/common/download/download-types';
import { ErrorCode } from 'csdm/common/error-code';
import { useDownloadErrorCode } from './use-download-error-code';

function getErrorMessage(errorCode: ErrorCode | undefined) {
  switch (errorCode) {
    case ErrorCode.FaceItApiForbidden:
    case ErrorCode.FaceItApiUnauthorized:
      return <Trans>Your FACEIT API key is not allowed to use the FACEIT Download API.</Trans>;
    case ErrorCode.FaceItApiResourceNotFound:
      // FACEIT populates the demo's link before the demo is uploaded, it may not be available yet.
      return <Trans>The demo is not available on FACEIT, it may not have been uploaded yet.</Trans>;
    case ErrorCode.FaceItApiError:
    case ErrorCode.FaceItApiInvalidRequest:
      return <Trans>FACEIT returned an error while retrieving the demo download link.</Trans>;
    default:
      return <Trans>An error occurred while downloading the demo.</Trans>;
  }
}

type Props = {
  download: Download;
  demoFileName: string;
};

export function DownloadActions({ download, demoFileName }: Props) {
  const progress: { [downloadId: string]: number } = useDownloadProgress();
  const demoProgress = progress[download.id] ?? 0;
  const statusPerDownloadId: { [downloadId: string]: DownloadStatus } = useDownloadStatus();
  const status: DownloadStatus = statusPerDownloadId[download.id] || DownloadStatus.NotDownloaded;
  const errorCode = useDownloadErrorCode(download.id);
  let statusIcon: React.ReactNode | null = null;
  let bottomContent: React.ReactNode | null = null;

  switch (status) {
    case DownloadStatus.Downloading:
      bottomContent = <Progress value={demoProgress * 100} />;
      break;
    case DownloadStatus.Downloaded:
      statusIcon = <CheckCircleIcon className="w-16 text-green-400" />;
      bottomContent = (
        <div className="flex gap-4">
          <SeeDemoButton demoFileName={demoFileName} downloadStatus={status} />
          <RevealDemoInExplorerButton demoFileName={demoFileName} downloadStatus={status} />
        </div>
      );
      break;
    case DownloadStatus.Expired:
      statusIcon = <ClockIcon className="w-16 text-orange-400" />;
      bottomContent = (
        <p>
          <Trans>The download link has expired.</Trans>
        </p>
      );
      break;
    case DownloadStatus.Corrupted:
      statusIcon = <FileCorruptedIcon className="w-16 text-orange-400" />;
      bottomContent = (
        <p>
          <Trans>The downloaded demo is corrupted. You can retry later.</Trans>
        </p>
      );
      break;
    case DownloadStatus.Error:
      statusIcon = <ExclamationTriangleIcon className="w-16 text-red-400" />;
      bottomContent = <p className="text-right">{getErrorMessage(errorCode)}</p>;
      break;
    default:
      statusIcon = <PendingIcon className="w-16 text-gray-900" />;
  }

  return (
    <div className="flex h-full flex-1 flex-col items-end justify-between">
      <div className="flex items-center gap-8">
        {statusIcon}
        <RemoveDownloadButton download={download} />
      </div>
      {bottomContent}
    </div>
  );
}
