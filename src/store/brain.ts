import { ProjectBrain, Note, NoteType } from '../types/index.js';
import { paths, readJSON, writeJSON, writeMD, ensureDirs } from '../utils/paths.js';
import { brainToMarkdown } from '../utils/markdown.js';
import { randomUUID } from 'crypto';

function defaultBrain(projectId: string): ProjectBrain {
  return {
    projectId,
    projectName: projectId,
    description: '',
    techStack: [],
    currentGoal: '',
    dos: [],
    donts: [],
    rules: [],
    notes: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function getBrain(projectId: string): Promise<ProjectBrain> {
  await ensureDirs(projectId);
  const existing = await readJSON<ProjectBrain>(paths.brainJson(projectId));
  return existing ?? defaultBrain(projectId);
}

export async function saveBrain(brain: ProjectBrain): Promise<void> {
  brain.updatedAt = new Date().toISOString();
  await ensureDirs(brain.projectId);
  await writeJSON(paths.brainJson(brain.projectId), brain);
  await writeMD(paths.brainMd(brain.projectId), brainToMarkdown(brain));
}

export async function addNote(
  projectId: string,
  content: string,
  type: NoteType
): Promise<Note> {
  const brain = await getBrain(projectId);
  const note: Note = { id: randomUUID(), content, type, createdAt: new Date().toISOString() };
  brain.notes.push(note);
  await saveBrain(brain);
  return note;
}

export async function updateBrainFields(
  projectId: string,
  fields: Partial<Pick<ProjectBrain, 'projectName' | 'description' | 'techStack' | 'currentGoal' | 'dos' | 'donts' | 'rules'>>
): Promise<ProjectBrain> {
  const brain = await getBrain(projectId);
  if (fields.projectName) brain.projectName = fields.projectName;
  if (fields.description) brain.description = fields.description;
  if (fields.techStack) brain.techStack = [...new Set([...brain.techStack, ...fields.techStack])];
  if (fields.currentGoal) brain.currentGoal = fields.currentGoal;
  if (fields.dos) brain.dos = [...new Set([...brain.dos, ...fields.dos])];
  if (fields.donts) brain.donts = [...new Set([...brain.donts, ...fields.donts])];
  if (fields.rules) brain.rules = [...new Set([...brain.rules, ...fields.rules])];
  await saveBrain(brain);
  return brain;
}
