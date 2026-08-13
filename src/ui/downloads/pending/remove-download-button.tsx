import React from 'react';
import { Trans } from '@lingui/react/macro';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { abortDownload } from './pending-actions';
import { RemoveButton } from 'csdm/ui/components/buttons/remove-button';
import { useShowToast } from 'csdm/ui/components/toasts/use-show-toast';
import type { Download } from 'csdm/common/download/download-types';

type Props = {
  download: Download;
};

export function RemoveDownloadButton({ download }: Props) {
  const client = useWebSocketClient();
  const dispatch = useDispatch();
  const showToast = useShowToast();

  const onClick = async () => {
    try {
      await client.send({
        name: RendererClientMessageName.AbortDownload,
        payload: download.id,
      });
      dispatch(abortDownload({ id: download.id, matchId: download.matchId }));
    } catch (error) {
      showToast({
        content: <Trans>An error occurred</Trans>,
        id: 'remove-download-error',
        type: 'error',
      });
    }
  };

  return <RemoveButton onClick={onClick} />;
}
