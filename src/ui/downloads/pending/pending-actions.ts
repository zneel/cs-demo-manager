import { createAction } from '@reduxjs/toolkit';
import type { DownloadIdentity } from 'csdm/common/download/download-types';

export const abortDownload = createAction<DownloadIdentity>('downloads/pending/abortDemoDownload');
export const abortDownloads = createAction('downloads/pending/abortDownloads');
