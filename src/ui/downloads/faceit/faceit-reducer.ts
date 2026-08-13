import { createReducer } from '@reduxjs/toolkit';
import { Status } from 'csdm/common/types/status';
import { DownloadStatus } from 'csdm/common/types/download-status';
import type { ErrorCode } from 'csdm/common/error-code';
import type { FaceitMatch } from 'csdm/common/types/faceit-match';
import type { FaceitAccount } from 'csdm/common/types/faceit-account';
import { initializeAppSuccess } from 'csdm/ui/bootstrap/bootstrap-actions';
import {
  downloadDemoCorrupted,
  downloadsAdded,
  downloadDemoExpired,
  downloadDemoSuccess,
  downloadDemoError,
} from '../downloads-actions';
import { DownloadSource } from 'csdm/common/download/download-types';
import type { DownloadIdentity } from 'csdm/common/download/download-types';
import { getDemosDownloadStatus } from 'csdm/common/download/get-demos-download-status';
import { abortDownload, abortDownloads } from '../pending/pending-actions';
import { downloadFolderChanged } from '../../settings/settings-actions';
import { accountAdded, fetchLastMatchesStart, accountsUpdated, matchSelected } from './faceit-actions';
import { fetchLastMatchesSuccess } from './faceit-actions';
import { fetchLastMatchesError } from './faceit-actions';

type FaceitState = {
  readonly status: Status;
  readonly accounts: FaceitAccount[];
  readonly matches: FaceitMatch[];
  readonly errorCode: ErrorCode | undefined;
  readonly selectedMatchId: string | undefined;
};

const initialState: FaceitState = {
  status: Status.Idle,
  accounts: [],
  matches: [],
  errorCode: undefined,
  selectedMatchId: undefined,
};

// A match may hold several demos (i.e. a best of 3), the status of the match summarizes the status of each of them.
function updateDemoStatus(state: FaceitState, { id, matchId }: DownloadIdentity, status: DownloadStatus) {
  const match = state.matches.find((match) => match.id === matchId);
  if (match === undefined) {
    return;
  }

  const demo = match.demos.find((demo) => demo.id === id);
  if (demo === undefined) {
    return;
  }

  demo.downloadStatus = status;
  match.downloadStatus = getDemosDownloadStatus(match.demos.map((demo) => demo.downloadStatus));
}

export const faceitReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(fetchLastMatchesStart, (state) => {
      state.status = Status.Loading;
    })
    .addCase(fetchLastMatchesSuccess, (state, action) => {
      state.status = Status.Success;
      state.matches = action.payload.matches;
      if (action.payload.matches.length > 0) {
        state.selectedMatchId = action.payload.matches[0].id;
      }
    })
    .addCase(fetchLastMatchesError, (state, action) => {
      state.status = Status.Error;
      state.errorCode = action.payload.errorCode;
    })
    .addCase(matchSelected, (state, action) => {
      state.selectedMatchId = action.payload.matchId;
    })
    .addCase(downloadsAdded, (state, action) => {
      for (const download of action.payload.downloads) {
        if (download.source !== DownloadSource.Faceit) {
          continue;
        }

        updateDemoStatus(state, download, DownloadStatus.Downloading);
      }
    })
    .addCase(downloadDemoSuccess, (state, action) => {
      updateDemoStatus(state, action.payload.download, DownloadStatus.Downloaded);
    })
    .addCase(downloadDemoExpired, (state, action) => {
      updateDemoStatus(state, action.payload, DownloadStatus.Expired);
    })
    .addCase(downloadDemoCorrupted, (state, action) => {
      updateDemoStatus(state, action.payload, DownloadStatus.Corrupted);
    })
    .addCase(downloadDemoError, (state, action) => {
      updateDemoStatus(state, action.payload, DownloadStatus.Error);
    })
    .addCase(abortDownload, (state, action) => {
      updateDemoStatus(state, action.payload, DownloadStatus.NotDownloaded);
    })
    .addCase(abortDownloads, (state) => {
      for (const match of state.matches) {
        for (const demo of match.demos) {
          if (demo.downloadStatus === DownloadStatus.Downloading) {
            demo.downloadStatus = DownloadStatus.NotDownloaded;
          }
        }
        match.downloadStatus = getDemosDownloadStatus(match.demos.map((demo) => demo.downloadStatus));
      }
    })
    .addCase(initializeAppSuccess, (state, action) => {
      state.accounts = action.payload.faceitAccounts;
    })
    .addCase(accountAdded, (state, action) => {
      state.accounts.push(action.payload.account);
    })
    .addCase(accountsUpdated, (state, action) => {
      return {
        ...initialState,
        accounts: action.payload.accounts,
      };
    })
    .addCase(downloadFolderChanged, () => {
      return initialState;
    });
});
