import { describe, expect, it } from 'vite-plus/test';
import { DownloadStatus } from 'csdm/common/types/download-status';
import { getDemosDownloadStatus } from './get-demos-download-status';

describe('Get demos download status', () => {
  it('given a match without demo, when getting its download status, then it is expired', () => {
    // Given
    const statuses: DownloadStatus[] = [];

    // When
    const status = getDemosDownloadStatus(statuses);

    // Then
    expect(status).toBe(DownloadStatus.Expired);
  });

  it('given a match with a single demo, when getting its download status, then the demo status is returned', () => {
    // Given
    const statuses = [DownloadStatus.Downloaded, DownloadStatus.NotDownloaded, DownloadStatus.Expired];

    // When
    const results = statuses.map((status) => getDemosDownloadStatus([status]));

    // Then
    expect(results).toStrictEqual([DownloadStatus.Downloaded, DownloadStatus.NotDownloaded, DownloadStatus.Expired]);
  });

  it('given a match whose demos are all downloaded, when getting its download status, then it is downloaded', () => {
    // Given
    const statuses = [DownloadStatus.Downloaded, DownloadStatus.Downloaded];

    // When
    const status = getDemosDownloadStatus(statuses);

    // Then
    expect(status).toBe(DownloadStatus.Downloaded);
  });

  it('given a match with only some demos downloaded, when getting its download status, then it is partially downloaded', () => {
    // Given
    const statuses = [DownloadStatus.Downloaded, DownloadStatus.NotDownloaded];

    // When
    const status = getDemosDownloadStatus(statuses);

    // Then
    expect(status).toBe(DownloadStatus.PartiallyDownloaded);
  });

  it('given a match with a demo being downloaded, when getting its download status, then it is downloading', () => {
    // Given
    const statuses = [DownloadStatus.Downloaded, DownloadStatus.Downloading];

    // When
    const status = getDemosDownloadStatus(statuses);

    // Then
    expect(status).toBe(DownloadStatus.Downloading);
  });

  it('given a match with a failing demo, when getting its download status, then the failure is reported', () => {
    // Given
    const statuses = [
      [DownloadStatus.Downloaded, DownloadStatus.Error],
      [DownloadStatus.Downloaded, DownloadStatus.Corrupted],
    ];

    // When
    const results = statuses.map(getDemosDownloadStatus);

    // Then
    expect(results).toStrictEqual([DownloadStatus.Error, DownloadStatus.Corrupted]);
  });

  it('given a match whose demos are all expired, when getting its download status, then it is expired', () => {
    // Given
    const statuses = [DownloadStatus.Expired, DownloadStatus.Expired];

    // When
    const status = getDemosDownloadStatus(statuses);

    // Then
    expect(status).toBe(DownloadStatus.Expired);
  });

  it('given a match with only some demos expired, when getting its download status, then it is not downloaded', () => {
    // Given
    const statuses = [DownloadStatus.Expired, DownloadStatus.NotDownloaded];

    // When
    const status = getDemosDownloadStatus(statuses);

    // Then
    expect(status).toBe(DownloadStatus.NotDownloaded);
  });
});
