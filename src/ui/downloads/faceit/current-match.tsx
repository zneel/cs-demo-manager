import React from 'react';
import { Trans } from '@lingui/react/macro';
import { ActionBar as CommonActionBar } from 'csdm/ui/components/action-bar';
import { WatchDemoButton } from 'csdm/ui/downloads/watch-demo-button';
import { Status } from 'csdm/common/types/status';
import { buildDownloadsFromFaceitMatch } from 'csdm/common/download/build-faceit-demos';
import { DownloadDemoButton } from '../download-demo-button';
import { DownloadDemosButton } from '../download-demos-button';
import { RevealDemoInExplorerButton } from '../reveal-demo-in-explorer-button';
import { Match } from './match';
import { useCurrentMatch } from './use-current-match';
import { SeeDemoButton } from 'csdm/ui/downloads/see-demo-button';
import { CopyDemoLinkButton } from 'csdm/ui/components/buttons/copy-demo-link-button';
import { OpenLinkButton } from 'csdm/ui/components/buttons/open-link-button';

function SeeOnFaceitButton() {
  const match = useCurrentMatch();

  return (
    <OpenLinkButton url={match.url}>
      <Trans context="Button">See on FACEIT</Trans>
    </OpenLinkButton>
  );
}

function DownloadButton() {
  const match = useCurrentMatch();
  const downloads = buildDownloadsFromFaceitMatch(match);

  if (downloads.length === 1) {
    return <DownloadDemoButton status={match.downloadStatus} download={downloads[0]} />;
  }

  // Matches holding several demos (i.e. a best of 3) queue all of them at once, each demo also has its own actions
  // in the match's demos list.
  return <DownloadDemosButton downloads={downloads} loadingStatus={Status.Success} />;
}

function ActionBar() {
  const match = useCurrentMatch();
  // Actions targeting a single demo file are available per demo in the match's demos list when there are several.
  const demo = match.demos.length === 1 ? match.demos[0] : undefined;

  return (
    <CommonActionBar
      left={
        <>
          <DownloadButton />
          {demo && (
            <>
              <RevealDemoInExplorerButton demoFileName={demo.fileName} downloadStatus={demo.downloadStatus} />
              <SeeDemoButton demoFileName={demo.fileName} downloadStatus={demo.downloadStatus} />
              <WatchDemoButton demoFileName={demo.fileName} game={match.game} downloadStatus={demo.downloadStatus} />
              <CopyDemoLinkButton link={demo.url} />
            </>
          )}
          <SeeOnFaceitButton />
        </>
      }
    />
  );
}

export function CurrentMatch() {
  const match = useCurrentMatch();

  return (
    <div className="flex flex-1 flex-col overflow-auto">
      <ActionBar />
      <Match match={match} />
    </div>
  );
}
