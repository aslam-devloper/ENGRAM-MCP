import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { saveCheckpoint, checkpointExists, listCheckpoints } from '../store/checkpoints.js';
import { personality } from '../utils/personality.js';
import { generateCheckpointName, sanitizeName } from '../utils/name-gen.js';

export function registerSaveCheckpoint(server: McpServer): void {
  server.tool(
    'save_checkpoint',
    'Save the current session state as a named checkpoint. Call this when: (1) context window is ~70% full, (2) before a risky change, (3) at a meaningful milestone. Generates a funny name automatically if you skip custom_name.',
    {
      what_we_are_building: z.string().describe('One sentence: what is the current task right now?'),
      current_status: z.string().describe("What's done? What's in progress? What's blocked?"),
      next_steps: z.array(z.string()).min(1).describe('Ordered list of exactly what to do after resuming. Be specific.'),
      key_decisions: z.array(z.string()).default([]).describe('Important decisions made this session.'),
      mental_model: z.string().default('').describe('How do you understand this codebase right now? Architecture, patterns, gotchas.'),
      important_files: z.array(z.string()).default([]).describe('File paths relevant to the current task.'),
      custom_name: z.string().optional().describe('Optional custom checkpoint name. Auto-generated if omitted.'),
      project_id: z.string().default('default').describe("Project identifier. Match what you used in init_session or wake_up."),
    },
    async ({ what_we_are_building, current_status, next_steps, key_decisions, mental_model, important_files, custom_name, project_id }) => {
      let name = custom_name ? sanitizeName(custom_name) : generateCheckpointName();

      // Avoid name collision
      let attempt = 0;
      while (await checkpointExists(project_id, name) && attempt < 5) {
        name = generateCheckpointName();
        attempt++;
      }

      const checkpoint = await saveCheckpoint({
        projectId: project_id,
        name,
        what_we_are_building,
        current_status,
        next_steps,
        key_decisions,
        mental_model,
        important_files,
      });

      const allCheckpoints = await listCheckpoints(project_id);

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            checkpoint_name: checkpoint.name,
            checkpoint_id: checkpoint.id,
            saved_at: checkpoint.createdAt,
            project_id,
            total_checkpoints: allCheckpoints.length,
            message: personality.save(),
            tip: `Resume this session by calling: wake_up("${project_id}", "${checkpoint.name}")`,
          }, null, 2),
        }],
      };
    }
  );
}
