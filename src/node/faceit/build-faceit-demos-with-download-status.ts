import type { FaceitDemo } from 'csdm/common/types/faceit-match';
import { buildFaceitDemos } from 'csdm/common/download/build-faceit-demos';
import { getProtectedDemoDownloadStatus } from 'csdm/node/download/get-download-status';

export async function buildFaceitDemosWithDownloadStatus(
  matchId: string,
  demoUrls: string[],
  downloadFolderPath: string | undefined,
): Promise<FaceitDemo[]> {
  const demos = buildFaceitDemos(matchId, demoUrls);

  return Promise.all(
    demos.map(async (demo) => {
      return {
        ...demo,
        downloadStatus: await getProtectedDemoDownloadStatus(downloadFolderPath, demo.fileName, demo.url),
      };
    }),
  );
}
