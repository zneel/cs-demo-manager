import { createReducer } from '@reduxjs/toolkit';
import type { Download } from 'csdm/common/download/download-types';
import type { ErrorCode } from 'csdm/common/error-code';
import { DownloadStatus } from 'csdm/common/types/download-status';
import { initializeAppSuccess } from 'csdm/ui/bootstrap/bootstrap-actions';
import {
  downloadDemoCorrupted,
  downloadDemoError,
  downloadDemoExpired,
  downloadDemoProgressChanged,
  downloadDemoSuccess,
  downloadsAdded,
} from '../downloads-actions';
import { abortDownload, abortDownloads } from './pending-actions';

export type PendingDownloadsState = {
  readonly downloads: Download[];
  readonly progress: { [downloadId: string]: number };
  readonly status: { [downloadId: string]: DownloadStatus };
  readonly errorCode: { [downloadId: string]: ErrorCode | undefined };
};

const initialState: PendingDownloadsState = {
  downloads: [],
  progress: {},
  status: {},
  errorCode: {},
};

export const pendingDownloadsReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(downloadsAdded, (state, action) => {
      for (const download of action.payload.downloads) {
        state.progress[download.id] = 0;
        state.status[download.id] = DownloadStatus.NotDownloaded;
        const alreadyExists = state.downloads.some(({ id }) => {
          return id === download.id;
        });
        if (!alreadyExists) {
          state.downloads.push(download);
        }
      }
    })
    .addCase(downloadDemoProgressChanged, (state, action) => {
      const { id, progress } = action.payload;
      state.progress[id] = progress;
      state.status[id] = DownloadStatus.Downloading;
    })
    .addCase(downloadDemoSuccess, (state, action) => {
      state.status[action.payload.download.id] = DownloadStatus.Downloaded;
    })
    .addCase(downloadDemoError, (state, action) => {
      state.status[action.payload.id] = DownloadStatus.Error;
      state.errorCode[action.payload.id] = action.payload.errorCode;
    })
    .addCase(downloadDemoExpired, (state, action) => {
      state.status[action.payload.id] = DownloadStatus.Expired;
    })
    .addCase(downloadDemoCorrupted, (state, action) => {
      state.status[action.payload.id] = DownloadStatus.Corrupted;
    })
    .addCase(abortDownload, (state, action) => {
      const { id } = action.payload;
      delete state.status[id];
      delete state.progress[id];
      delete state.errorCode[id];
      state.downloads = state.downloads.filter((download) => download.id !== id);
    })
    .addCase(abortDownloads, () => {
      return initialState;
    })
    .addCase(initializeAppSuccess, (state, action) => {
      for (const download of action.payload.downloads) {
        const alreadyExists = state.downloads.some(({ id }) => {
          return id === download.id;
        });
        if (!alreadyExists) {
          state.downloads.push(download);
        }
      }
    });
});
