import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getBrain } from '../store/brain.js';
import { getLatestCheckpoint, getCheckpoint, listCheckpoints } from '../store/checkpoints.js';
import { listSkillsRaw } from '../store/skills.js';
import { personality } from '../utils/personality.js';
import { paths, writeJSON } from '../utils/paths.js';
import { PulseState } from '../types/index.js';

export function registerWakeUp(server: McpServer): void {
  server.tool(
    'wake_up',
    'Call this at the START of every new session — before doing anything else. Loads the last checkpoint + project brain + all skills. Gives you full context to resume instantly without re-explaining anything.',
    {
      project_id: z.string().default('default').describe("Project to load. Use 'default' or your project name."),
      checkpoint_name: z.string().optional().describe('Specific checkpoint to load. Loads the latest if omitted.'),
    },
    async ({ project_id, checkpoint_name }) => {
      const [brain, checkpoint, allCheckpoints, skills] = await Promise.all([
        getBrain(project_id),
        checkpoint_name ? getCheckpoint(project_id, checkpoint_name) : getLatestCheckpoint(project_id),
        listCheckpoints(project_id),
        listSkillsRaw(project_id),
      ]);

      // Reset pulse for new session
      const pulse: PulseState = {
        messageCount: 0,
        codeBlocksWritten: 0,
        lastCheckpointName: checkpoint?.name,
        lastCheckpointAt: checkpoint?.createdAt,
        sessionStartedAt: new Date().toISOString(),
      };
      await writeJSON(paths.pulse(project_id), pulse);

      const isFirstSession = allCheckpoints.length === 0 && !checkpoint;

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            status: isFirstSession ? 'no_memory_yet' : 'resumed',
            message: isFirstSession
              ? "🆕 No memory found. I'm a blank slate. Call init_session() with your conversation history to build the brain."
              : personality.wakeUp(),
            project: {
              id: project_id,
              name: brain.projectName,
              description: brain.description,
              tech_stack: brain.techStack,
              current_goal: brain.currentGoal,
            },
            last_checkpoint: checkpoint ? {
              name: checkpoint.name,
              saved_at: checkpoint.createdAt,
              what_we_are_building: checkpoint.what_we_are_building,
              current_status: checkpoint.current_status,
              mental_model: checkpoint.mental_model,
              next_steps: checkpoint.next_steps,
              key_decisions: checkpoint.key_decisions,
              important_files: checkpoint.important_files,
            } : null,
            brain: {
              dos: brain.dos,
              donts: brain.donts,
              rules: brain.rules,
              notes: brain.notes.slice(-20), // last 20 notes
            },
            skills: skills.map(s => ({
              id: s.id,
              name: s.name,
              type: s.type,
              description: s.description,
              tags: s.tags,
            })),
            available_checkpoints: allCheckpoints,
            cortex_instructions: [
              "Call save_checkpoint() when context gets heavy (~70% full).",
              "Call jot() whenever you discover something important.",
              "Call check_pulse() every ~20 messages to self-monitor context health.",
              "Call debrief() at end of session to extract intelligence.",
              "Call get_skill(name) to load and use a specific skill.",
            ],
          }, null, 2),
        }],
      };
    }
  );
}
