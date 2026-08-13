import { useEffect } from 'react';
import { RendererServerMessageName } from 'csdm/server/renderer-server-message-name';
import type { ValveMatch } from 'csdm/common/types/valve-match';
import type { Demo } from 'csdm/common/types/demo';
import {
  currentSteamIdDetected,
  fetchLastMatchesError as fetchLastValveMatchesError,
  fetchLastMatchesSuccess as fetchLastValveMatchesSuccess,
  fetchLastMatchesStart as fetchLastValveMatchesStart,
} from 'csdm/ui/downloads/valve/valve-actions';
import {
  demoDownloadedInCurrentFolderLoaded,
  downloadDemoCorrupted,
  downloadDemoError,
  downloadDemoExpired,
  downloadDemoProgressChanged,
  downloadDemoSuccess,
  downloadsAdded,
} from 'csdm/ui/downloads/downloads-actions';
import { useDispatch } from '../../store/use-dispatch';
import type { WebSocketClient } from 'csdm/ui/web-socket-client';
import type { ErrorCode } from 'csdm/common/error-code';
import type {
  Download,
  DownloadDemoErrorPayload,
  DownloadDemoProgressPayload,
  DownloadDemoSuccess,
  DownloadIdentity,
} from 'csdm/common/download/download-types';

function useRegisterFetchLastValveMatchesListeners(client: WebSocketClient) {
  const dispatch = useDispatch();

  useEffect(() => {
    const onStart = () => {
      dispatch(fetchLastValveMatchesStart());
    };

    const onSuccess = (matches: ValveMatch[]) => {
      dispatch(fetchLastValveMatchesSuccess({ matches }));
    };

    const onError = (errorCode: ErrorCode) => {
      dispatch(fetchLastValveMatchesError({ errorCode }));
    };

    const onSteamIdDetected = (steamId: string) => {
      dispatch(currentSteamIdDetected({ steamId }));
    };

    client.on(RendererServerMessageName.FetchLastValveMatchesStart, onStart);
    client.on(RendererServerMessageName.FetchLastValveMatchesSuccess, onSuccess);
    client.on(RendererServerMessageName.FetchLastValveMatchesError, onError);
    client.on(RendererServerMessageName.FetchLastValveMatchesSteamIdDetected, onSteamIdDetected);

    return () => {
      client.off(RendererServerMessageName.FetchLastValveMatchesStart, onStart);
      client.off(RendererServerMessageName.FetchLastValveMatchesSuccess, onSuccess);
      client.off(RendererServerMessageName.FetchLastValveMatchesError, onError);
      client.off(RendererServerMessageName.FetchLastValveMatchesSteamIdDetected, onSteamIdDetected);
    };
  });
}

export function useRegisterDownloadsListeners(client: WebSocketClient) {
  const dispatch = useDispatch();

  useEffect(() => {
    const onDownloadsAdded = (downloads: Download[]) => {
      dispatch(downloadsAdded({ downloads }));
    };
    client.on(RendererServerMessageName.DownloadsAdded, onDownloadsAdded);

    const onDownloadProgress = (payload: DownloadDemoProgressPayload) => {
      dispatch(downloadDemoProgressChanged(payload));
    };
    client.on(RendererServerMessageName.DownloadDemoProgress, onDownloadProgress);

    const onDemoExpired = (identity: DownloadIdentity) => {
      dispatch(downloadDemoExpired(identity));
    };
    client.on(RendererServerMessageName.DownloadDemoExpired, onDemoExpired);

    const onDownloadDemoSuccess = (payload: DownloadDemoSuccess) => {
      dispatch(downloadDemoSuccess(payload));
    };
    client.on(RendererServerMessageName.DownloadDemoSuccess, onDownloadDemoSuccess);

    const onDownloadDemoCorrupted = (identity: DownloadIdentity) => {
      dispatch(downloadDemoCorrupted(identity));
    };
    client.on(RendererServerMessageName.DownloadDemoCorrupted, onDownloadDemoCorrupted);

    const onDownloadDemoError = (payload: DownloadDemoErrorPayload) => {
      dispatch(downloadDemoError(payload));
    };
    client.on(RendererServerMessageName.DownloadDemoError, onDownloadDemoError);

    const onDownloadedDemoInCurrentFolderLoaded = (demo: Demo) => {
      dispatch(demoDownloadedInCurrentFolderLoaded(demo));
    };
    client.on(RendererServerMessageName.DownloadDemoInCurrentFolderLoaded, onDownloadedDemoInCurrentFolderLoaded);

    return () => {
      client.off(RendererServerMessageName.DownloadsAdded, onDownloadsAdded);
      client.off(RendererServerMessageName.DownloadDemoProgress, onDownloadProgress);
      client.off(RendererServerMessageName.DownloadDemoExpired, onDemoExpired);
      client.off(RendererServerMessageName.DownloadDemoSuccess, onDownloadDemoSuccess);
      client.off(RendererServerMessageName.DownloadDemoCorrupted, onDownloadDemoCorrupted);
      client.off(RendererServerMessageName.DownloadDemoError, onDownloadDemoError);
      client.off(RendererServerMessageName.DownloadDemoInCurrentFolderLoaded, onDownloadedDemoInCurrentFolderLoaded);
    };
  });

  useRegisterFetchLastValveMatchesListeners(client);
}
