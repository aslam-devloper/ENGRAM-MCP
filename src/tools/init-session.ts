import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getBrain, saveBrain, updateBrainFields } from '../store/brain.js';
import { saveCheckpoint } from '../store/checkpoints.js';
import { listSkillsRaw } from '../store/skills.js';
import { personality } from '../utils/personality.js';
import { paths, writeJSON, writeMD } from '../utils/paths.js';
import { brainToMarkdown } from '../utils/markdown.js';
import { ConversationTurn } from '../types/index.js';

export function registerInitSession(server: McpServer): void {
  server.tool(
    'init_session',
    'FIRST-TIME SETUP. Call this once when starting fresh. Pass your current conversation history and CORTEX will scan it, extract project intelligence, and build your persistent brain. After this, use wake_up() at the start of every session instead.',
    {
      conversation_history: z.array(z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      })).describe('Your full conversation history so far. Pass as many turns as you have.'),
      project_id: z.string().default('default').describe("Project identifier. Use 'default' or a short project name like 'my-saas'."),
      project_name: z.string().optional().describe('Human-readable project name.'),
    },
    async ({ conversation_history, project_id, project_name }) => {
      const history = conversation_history as ConversationTurn[];

      // Extract intelligence from conversation
      const techStack = extractTechStack(history);
      const dos = extractPatterns(history, ['always', 'make sure', 'remember to', 'use ', 'prefer']);
      const donts = extractPatterns(history, ["don't", "never", "avoid", "don't use", "stop"]);
      const projectDesc = extractProjectDescription(history);
      const currentGoal = extractCurrentGoal(history);

      await updateBrainFields(project_id, {
        projectName: project_name ?? project_id,
        description: projectDesc,
        techStack,
        currentGoal,
        dos: dos.slice(0, 10),
        donts: donts.slice(0, 10),
      });

      // Save a genesis checkpoint
      const checkpoint = await saveCheckpoint({
        projectId: project_id,
        name: 'genesis-the-beginning-of-memory',
        what_we_are_building: currentGoal || 'Project initialization',
        current_status: `CORTEX initialized with ${history.length} conversation turns analyzed.`,
        key_decisions: dos.slice(0, 5),
        next_steps: ['Continue your work — CORTEX is now watching your back.'],
        mental_model: projectDesc,
        important_files: [],
      });

      const brain = await getBrain(project_id);
      const skills = await listSkillsRaw(project_id);

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            status: 'initialized',
            project_id,
            project_name: project_name ?? project_id,
            turns_analyzed: history.length,
            tech_stack_detected: techStack,
            dos_extracted: dos.slice(0, 5),
            donts_extracted: donts.slice(0, 5),
            genesis_checkpoint: checkpoint.name,
            skills_available: skills.length,
            brain_location: paths.brainJson(project_id),
            message: `🧠 CORTEX initialized. Scanned ${history.length} turns. Brain built. From now on, start sessions with wake_up("${project_id}").`,
            instructions: 'CORTEX is now active. At the START of every new session call wake_up(). When context fills up call save_checkpoint(). Discover something? call jot(). End of session? call debrief().',
            brain_summary: {
              description: brain.description,
              tech_stack: brain.techStack,
              dos: brain.dos,
              donts: brain.donts,
            },
          }, null, 2),
        }],
      };
    }
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────

function extractTechStack(history: ConversationTurn[]): string[] {
  const text = history.map(t => t.content).join(' ').toLowerCase();
  const techs = [
    'typescript', 'javascript', 'python', 'rust', 'go', 'java', 'c#', 'c++',
    'react', 'next.js', 'nextjs', 'vue', 'angular', 'svelte', 'solid',
    'node.js', 'nodejs', 'express', 'fastapi', 'django', 'flask', 'nestjs',
    'postgresql', 'postgres', 'mysql', 'sqlite', 'mongodb', 'redis',
    'prisma', 'drizzle', 'supabase', 'firebase',
    'docker', 'kubernetes', 'aws', 'gcp', 'azure', 'vercel', 'railway',
    'tailwind', 'shadcn', 'mui', 'chakra',
    'graphql', 'trpc', 'rest', 'websocket',
  ];
  return techs.filter(t => text.includes(t)).slice(0, 15);
}

function extractPatterns(history: ConversationTurn[], triggers: string[]): string[] {
  const results: string[] = [];
  for (const turn of history) {
    const lower = turn.content.toLowerCase();
    for (const trigger of triggers) {
      if (lower.includes(trigger)) {
        const sentences = turn.content.split(/[.!?\n]/).filter(s => s.toLowerCase().includes(trigger));
        results.push(...sentences.map(s => s.trim()).filter(s => s.length > 10 && s.length < 200));
      }
    }
  }
  return [...new Set(results)];
}

function extractProjectDescription(history: ConversationTurn[]): string {
  const userMsgs = history.filter(t => t.role === 'user').map(t => t.content);
  if (userMsgs.length === 0) return 'Project initialized via CORTEX.';
  const first = userMsgs[0] ?? '';
  return first.length > 300 ? first.substring(0, 300) + '...' : first;
}

function extractCurrentGoal(history: ConversationTurn[]): string {
  const last = history.filter(t => t.role === 'user').slice(-3).map(t => t.content).join(' ');
  const sentences = last.split(/[.!?\n]/).filter(s => s.trim().length > 10);
  return sentences[sentences.length - 1]?.trim() ?? 'Continue current task.';
}
