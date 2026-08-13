import { createAction } from '@reduxjs/toolkit';
import type { Demo } from 'csdm/common/types/demo';
import type {
  Download,
  DownloadDemoErrorPayload,
  DownloadDemoProgressPayload,
  DownloadDemoSuccess,
  DownloadIdentity,
} from 'csdm/common/download/download-types';

export const downloadDemoError = createAction<DownloadDemoErrorPayload>('downloads/downloadDemoError');
export const downloadDemoExpired = createAction<DownloadIdentity>('downloads/downloadDemoExpired');
export const downloadDemoSuccess = createAction<DownloadDemoSuccess>('downloads/downloadDemoSuccess');
export const downloadDemoCorrupted = createAction<DownloadIdentity>('downloads/downloadDemoCorrupted');
export const downloadsAdded = createAction<{ downloads: Download[] }>('downloads/downloadsAdded');
export const downloadDemoProgressChanged = createAction<DownloadDemoProgressPayload>('downloads/downloadProgress');
export const demoDownloadedInCurrentFolderLoaded = createAction<Demo>('downloads/demoDownloadedInCurrentFolderLoaded');
