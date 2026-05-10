import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { paths, readJSON, writeJSON } from '../utils/paths.js';
import { listCheckpoints } from '../store/checkpoints.js';
import { personality } from '../utils/personality.js';
import { PulseState } from '../types/index.js';

// Thresholds
const YELLOW_THRESHOLD = 15;  // messages before yellow warning
const RED_THRESHOLD = 25;     // messages before red (4th wall breaking) warning
const CODE_BLOCK_YELLOW = 8;  // code blocks before warning

export function registerCheckPulse(server: McpServer): void {
  server.tool(
    'check_pulse',
    "Self-monitoring tool. Call this every ~20 messages to check context health. CORTEX will tell you if you need to save a checkpoint NOW. Also increments message/code counters. Pass code_blocks_written if you've been generating code.",
    {
      messages_since_last_check: z.number().int().min(0).default(1).describe('How many messages have passed since last check_pulse call.'),
      code_blocks_written: z.number().int().min(0).default(0).describe('How many code blocks have been generated since last check.'),
      project_id: z.string().default('default'),
    },
    async ({ messages_since_last_check, code_blocks_written, project_id }) => {
      // Load or init pulse
      let pulse = await readJSON<PulseState>(paths.pulse(project_id));
      if (!pulse) {
        pulse = {
          messageCount: 0,
          codeBlocksWritten: 0,
          sessionStartedAt: new Date().toISOString(),
        };
      }

      // Update counters
      pulse.messageCount += messages_since_last_check;
      pulse.codeBlocksWritten += code_blocks_written;
      await writeJSON(paths.pulse(project_id), pulse);

      // Determine health
      const isCodeHeavy = pulse.codeBlocksWritten >= CODE_BLOCK_YELLOW;
      const isRed = pulse.messageCount >= RED_THRESHOLD || (isCodeHeavy && pulse.messageCount >= YELLOW_THRESHOLD);
      const isYellow = !isRed && (pulse.messageCount >= YELLOW_THRESHOLD || isCodeHeavy);

      const checkpoints = await listCheckpoints(project_id);
      const lastCheckpoint = checkpoints[0];
      const minutesSinceCheckpoint = lastCheckpoint
        ? Math.round((Date.now() - new Date(lastCheckpoint.createdAt).getTime()) / 60000)
        : null;

      let warningLevel: 'green' | 'yellow' | 'red' = 'green';
      let message = '✅ Context is healthy. Keep going.';
      let action_required = false;

      if (isRed) {
        warningLevel = 'red';
        message = personality.fourthWall();
        action_required = true;
      } else if (isYellow) {
        warningLevel = 'yellow';
        message = `⚠️ Context getting full (${pulse.messageCount} messages, ${pulse.codeBlocksWritten} code blocks). Consider a checkpoint soon.`;
        action_required = false;
      }

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            health: warningLevel,
            message,
            action_required,
            stats: {
              total_messages_this_session: pulse.messageCount,
              code_blocks_written: pulse.codeBlocksWritten,
              session_started: pulse.sessionStartedAt,
              last_checkpoint: lastCheckpoint?.name ?? 'none',
              minutes_since_checkpoint: minutesSinceCheckpoint,
            },
            recommendation: action_required
              ? `🚨 Call save_checkpoint() NOW. Then continue. Project: '${project_id}'`
              : warningLevel === 'yellow'
              ? `Consider calling save_checkpoint() in the next few messages.`
              : `All good. Check again in ~${RED_THRESHOLD - pulse.messageCount} messages.`,
          }, null, 2),
        }],
      };
    }
  );
}
