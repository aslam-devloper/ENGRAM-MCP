import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { addNote } from '../store/brain.js';
import { personality } from '../utils/personality.js';
import { NoteType } from '../types/index.js';

export function registerJot(server: McpServer): void {
  server.tool(
    'jot',
    "Write a note, rule, observation, or warning to the project brain. Call this IMMEDIATELY when you discover something important — a pattern that works, a bug that was hard to find, a rule for this codebase, anything worth remembering across sessions.",
    {
      content: z.string().min(5).describe('The note content. Be specific and actionable.'),
      type: z.enum(['rule', 'do', 'dont', 'discovery', 'warning', 'pattern', 'random-thought'])
        .describe("Note type. Use 'rule' for coding standards, 'do'/'dont' for behavior, 'discovery' for findings, 'warning' for gotchas, 'pattern' for recurring solutions."),
      project_id: z.string().default('default').describe('Project identifier.'),
    },
    async ({ content, type, project_id }) => {
      const note = await addNote(project_id, content, type as NoteType);
      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            note_id: note.id,
            type: note.type,
            content: note.content,
            saved_at: note.createdAt,
            project_id,
            message: personality.jot(),
          }, null, 2),
        }],
      };
    }
  );
}
