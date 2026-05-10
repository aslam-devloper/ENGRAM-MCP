import { homedir } from 'os';
import { join } from 'path';
import { mkdir, readFile, writeFile, access } from 'fs/promises';
import { constants } from 'fs';

export const CORTEX_VERSION = '1.0.0';

export function getCortexHome(): string {
  return process.env['ENGRAM_HOME'] ?? join(homedir(), '.engram');
}

export const paths = {
  home: () => getCortexHome(),
  config: () => join(getCortexHome(), 'cortex.config.json'),
  projects: () => join(getCortexHome(), 'projects'),
  project: (id: string) => join(getCortexHome(), 'projects', id),
  brainJson: (id: string) => join(getCortexHome(), 'projects', id, 'brain.json'),
  brainMd: (id: string) => join(getCortexHome(), 'projects', id, 'brain.md'),
  checkpointsDir: (id: string) => join(getCortexHome(), 'projects', id, 'checkpoints'),
  checkpointJson: (id: string, name: string) => join(getCortexHome(), 'projects', id, 'checkpoints', `${name}.json`),
  checkpointMd: (id: string, name: string) => join(getCortexHome(), 'projects', id, 'checkpoints', `${name}.md`),
  skillsDir: (id: string) => join(getCortexHome(), 'projects', id, 'skills'),
  skillJson: (id: string, skillId: string) => join(getCortexHome(), 'projects', id, 'skills', `${skillId}.json`),
  skillMd: (id: string, skillId: string) => join(getCortexHome(), 'projects', id, 'skills', `${skillId}.md`),
  pulse: (id: string) => join(getCortexHome(), 'projects', id, 'pulse.json'),
};

export async function ensureDirs(projectId: string): Promise<void> {
  const home = getCortexHome();
  await mkdir(paths.checkpointsDir(projectId), { recursive: true });
  await mkdir(paths.skillsDir(projectId), { recursive: true });
  void home;
}

export async function ensureCortexHome(): Promise<void> {
  await mkdir(join(getCortexHome(), 'projects'), { recursive: true });
}

export async function fileExists(p: string): Promise<boolean> {
  try { await access(p, constants.F_OK); return true; } catch { return false; }
}

export async function readJSON<T>(p: string): Promise<T | null> {
  try { return JSON.parse(await readFile(p, 'utf-8')) as T; } catch { return null; }
}

export async function writeJSON<T>(p: string, data: T): Promise<void> {
  await writeFile(p, JSON.stringify(data, null, 2), 'utf-8');
}

export async function writeMD(p: string, content: string): Promise<void> {
  await writeFile(p, content, 'utf-8');
}
