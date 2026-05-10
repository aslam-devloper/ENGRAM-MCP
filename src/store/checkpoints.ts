import { Checkpoint } from '../types/index.js';
import { paths, readJSON, writeJSON, writeMD, ensureDirs, fileExists } from '../utils/paths.js';
import { checkpointToMarkdown } from '../utils/markdown.js';
import { readdir } from 'fs/promises';
import { randomUUID } from 'crypto';

export async function saveCheckpoint(cp: Omit<Checkpoint, 'id' | 'createdAt'>): Promise<Checkpoint> {
  await ensureDirs(cp.projectId);
  const checkpoint: Checkpoint = { ...cp, id: randomUUID(), createdAt: new Date().toISOString() };
  await writeJSON(paths.checkpointJson(cp.projectId, cp.name), checkpoint);
  await writeMD(paths.checkpointMd(cp.projectId, cp.name), checkpointToMarkdown(checkpoint));
  return checkpoint;
}

export async function getCheckpoint(projectId: string, name: string): Promise<Checkpoint | null> {
  return readJSON<Checkpoint>(paths.checkpointJson(projectId, name));
}

export async function getLatestCheckpoint(projectId: string): Promise<Checkpoint | null> {
  await ensureDirs(projectId);
  const dir = paths.checkpointsDir(projectId);
  try {
    const files = (await readdir(dir)).filter(f => f.endsWith('.json'));
    if (files.length === 0) return null;
    const checkpoints = await Promise.all(
      files.map(f => readJSON<Checkpoint>(paths.checkpointJson(projectId, f.replace('.json', ''))))
    );
    const valid = checkpoints.filter((c): c is Checkpoint => c !== null);
    valid.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return valid[0] ?? null;
  } catch { return null; }
}

export async function listCheckpoints(projectId: string): Promise<{ name: string; createdAt: string; what: string }[]> {
  await ensureDirs(projectId);
  const dir = paths.checkpointsDir(projectId);
  try {
    const files = (await readdir(dir)).filter(f => f.endsWith('.json'));
    const cps = await Promise.all(files.map(f => readJSON<Checkpoint>(paths.checkpointJson(projectId, f.replace('.json', '')))));
    return cps
      .filter((c): c is Checkpoint => c !== null)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map(c => ({ name: c.name, createdAt: c.createdAt, what: c.what_we_are_building }));
  } catch { return []; }
}

export async function checkpointExists(projectId: string, name: string): Promise<boolean> {
  return fileExists(paths.checkpointJson(projectId, name));
}
