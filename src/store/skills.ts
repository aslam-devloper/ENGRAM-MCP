import { Skill, InstructionSkill, TemplateSkill } from '../types/index.js';
import { paths, readJSON, writeJSON, writeMD, ensureDirs } from '../utils/paths.js';
import { skillToMarkdown } from '../utils/markdown.js';
import { readdir } from 'fs/promises';
import { toSkillId } from '../utils/name-gen.js';

export async function saveSkill(projectId: string, skill: Skill): Promise<void> {
  await ensureDirs(projectId);
  await writeJSON(paths.skillJson(projectId, skill.id), skill);
  await writeMD(paths.skillMd(projectId, skill.id), skillToMarkdown(skill));
}

export async function getSkill(projectId: string, nameOrId: string): Promise<Skill | null> {
  const id = toSkillId(nameOrId);
  const byId = await readJSON<Skill>(paths.skillJson(projectId, id));
  if (byId) return byId;
  // fallback: scan all skills
  const all = await listSkillsRaw(projectId);
  return all.find(s => s.name.toLowerCase() === nameOrId.toLowerCase()) ?? null;
}

export async function listSkillsRaw(projectId: string): Promise<Skill[]> {
  await ensureDirs(projectId);
  const dir = paths.skillsDir(projectId);
  try {
    const files = (await readdir(dir)).filter(f => f.endsWith('.json'));
    const skills = await Promise.all(files.map(f => readJSON<Skill>(paths.skillJson(projectId, f.replace('.json', '')))));
    return skills.filter((s): s is Skill => s !== null);
  } catch { return []; }
}

export async function incrementSkillUsage(projectId: string, skillId: string): Promise<void> {
  const skill = await readJSON<Skill>(paths.skillJson(projectId, skillId));
  if (!skill) return;
  skill.usageCount++;
  await saveSkill(projectId, skill);
}

export function buildInstructionSkill(
  name: string,
  description: string,
  instructions: string,
  tags: string[]
): InstructionSkill {
  return {
    id: toSkillId(name),
    name,
    type: 'instruction',
    description,
    instructions,
    tags,
    createdAt: new Date().toISOString(),
    usageCount: 0,
  };
}

export function buildTemplateSkill(
  name: string,
  description: string,
  template: string,
  variables: string[],
  tags: string[]
): TemplateSkill {
  return {
    id: toSkillId(name),
    name,
    type: 'template',
    description,
    template,
    variables,
    tags,
    createdAt: new Date().toISOString(),
    usageCount: 0,
  };
}
