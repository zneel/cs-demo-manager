import React from 'react';
import { Trans } from '@lingui/react/macro';
import type { FaceitMatch } from 'csdm/common/types/faceit-match';
import { buildDownloadsFromFaceitMatch } from 'csdm/common/download/build-faceit-demos';
import { CopyDemoLinkButton } from 'csdm/ui/components/buttons/copy-demo-link-button';
import { DownloadDemoButton } from '../download-demo-button';
import { RevealDemoInExplorerButton } from '../reveal-demo-in-explorer-button';
import { SeeDemoButton } from '../see-demo-button';
import { WatchDemoButton } from '../watch-demo-button';

type Props = {
  match: FaceitMatch;
};

// A FACEIT match holds one demo per map played, matches holding several of them (i.e. a best of 3) expose each demo
// so that they can be downloaded and watched individually.
export function Demos({ match }: Props) {
  const downloads = buildDownloadsFromFaceitMatch(match);
  if (downloads.length <= 1) {
    return null;
  }

  return (
    <div className="flex flex-col gap-y-8">
      <p className="text-body-strong">
        <Trans>Demos</Trans>
      </p>
      {downloads.map((download, index) => {
        const demo = match.demos[index];
        const position = index + 1;

        return (
          <div key={demo.id} className="flex items-center gap-x-8">
            <p className="selectable">
              <Trans>Map {position}</Trans>
            </p>
            <DownloadDemoButton status={demo.downloadStatus} download={download} />
            <RevealDemoInExplorerButton demoFileName={demo.fileName} downloadStatus={demo.downloadStatus} />
            <SeeDemoButton demoFileName={demo.fileName} downloadStatus={demo.downloadStatus} />
            <WatchDemoButton demoFileName={demo.fileName} game={match.game} downloadStatus={demo.downloadStatus} />
            <CopyDemoLinkButton link={demo.url} />
          </div>
        );
      })}
    </div>
  );
}
