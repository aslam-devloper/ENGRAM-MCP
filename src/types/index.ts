export type NoteType = 'rule' | 'do' | 'dont' | 'discovery' | 'warning' | 'pattern' | 'random-thought';
export type SkillType = 'instruction' | 'template';

export interface Note {
  id: string;
  content: string;
  type: NoteType;
  createdAt: string;
}

export interface ProjectBrain {
  projectId: string;
  projectName: string;
  description: string;
  techStack: string[];
  currentGoal: string;
  dos: string[];
  donts: string[];
  rules: string[];
  notes: Note[];
  createdAt: string;
  updatedAt: string;
}

export interface Checkpoint {
  id: string;
  name: string;
  projectId: string;
  what_we_are_building: string;
  current_status: string;
  key_decisions: string[];
  next_steps: string[];
  mental_model: string;
  important_files: string[];
  createdAt: string;
}

export interface InstructionSkill {
  id: string;
  name: string;
  type: 'instruction';
  description: string;
  instructions: string;
  tags: string[];
  createdAt: string;
  usageCount: number;
}

export interface TemplateSkill {
  id: string;
  name: string;
  type: 'template';
  description: string;
  template: string;
  variables: string[];
  tags: string[];
  createdAt: string;
  usageCount: number;
}

export type Skill = InstructionSkill | TemplateSkill;

export interface CortexConfig {
  version: string;
  defaultProject: string;
  firstRun: boolean;
  installedAt: string;
}

export interface ConversationTurn {
  role: 'user' | 'assistant';
  content: string;
}

export interface PulseState {
  messageCount: number;
  codeBlocksWritten: number;
  lastCheckpointName?: string;
  lastCheckpointAt?: string;
  sessionStartedAt: string;
}
