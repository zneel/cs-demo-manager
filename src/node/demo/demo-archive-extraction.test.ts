import { describe, expect, it } from 'vite-plus/test';
import path from 'node:path';
import os from 'node:os';
import zlib from 'node:zlib';
import fs from 'node:fs/promises';
import { extractDemosFromArchive, getDemosToExtractFromArchive } from './demo-archive-extraction';

describe('Demo archive extraction', () => {
  const demoContent = 'PBDEMS2 fake demo content';

  async function createArchive(fileName: string, bytes: Buffer) {
    const folderPath = await fs.mkdtemp(path.join(os.tmpdir(), 'csdm-archive-'));
    const archivePath = path.join(folderPath, fileName);
    await fs.writeFile(archivePath, bytes);

    return archivePath;
  }

  it('should extract a demo from a .zst archive', async () => {
    const archivePath = await createArchive('match.dem.zst', zlib.zstdCompressSync(Buffer.from(demoContent)));

    const demosToExtract = await getDemosToExtractFromArchive(archivePath);
    expect(demosToExtract).toHaveLength(1);
    expect(demosToExtract[0].destinationPath).toBe(archivePath.slice(0, -'.zst'.length));

    await extractDemosFromArchive(archivePath, demosToExtract);
    const extractedContent = await fs.readFile(demosToExtract[0].destinationPath, 'utf8');
    expect(extractedContent).toBe(demoContent);
  });

  it('should extract a demo from a .gz archive', async () => {
    const archivePath = await createArchive('match.dem.gz', zlib.gzipSync(Buffer.from(demoContent)));

    const demosToExtract = await getDemosToExtractFromArchive(archivePath);
    expect(demosToExtract).toHaveLength(1);

    await extractDemosFromArchive(archivePath, demosToExtract);
    const extractedContent = await fs.readFile(demosToExtract[0].destinationPath, 'utf8');
    expect(extractedContent).toBe(demoContent);
  });

  it('should not extract a .zst archive that does not hold a demo', async () => {
    const archivePath = await createArchive('notes.txt.zst', zlib.zstdCompressSync(Buffer.from(demoContent)));

    const demosToExtract = await getDemosToExtractFromArchive(archivePath);
    expect(demosToExtract).toHaveLength(0);
  });

  it('should not extract a .zst archive whose demo already exists', async () => {
    const archivePath = await createArchive('match.dem.zst', zlib.zstdCompressSync(Buffer.from(demoContent)));
    await fs.writeFile(archivePath.slice(0, -'.zst'.length), demoContent);

    const demosToExtract = await getDemosToExtractFromArchive(archivePath);
    expect(demosToExtract).toHaveLength(0);
  });

  it('should not leave a temporary file behind when the .zst archive is corrupted', async () => {
    const archivePath = await createArchive('match.dem.zst', Buffer.from('not a zstd archive'));

    const demosToExtract = await getDemosToExtractFromArchive(archivePath);
    await expect(extractDemosFromArchive(archivePath, demosToExtract)).rejects.toThrow();

    const fileNames = await fs.readdir(path.dirname(archivePath));
    expect(fileNames).toStrictEqual(['match.dem.zst']);
  });
});
