import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { updateBrainFields, addNote } from '../store/brain.js';
import { personality } from '../utils/personality.js';

export function registerDebrief(server: McpServer): void {
  server.tool(
    'debrief',
    "End-of-session ritual. Call this when you're wrapping up. Pass what happened this session and CORTEX permanently updates the project brain with new rules, dos, don'ts, and discoveries. This is how CORTEX gets smarter over time.",
    {
      session_summary: z.string().min(10).describe("What happened this session? What was built, fixed, or figured out? Be honest."),
      new_dos: z.array(z.string()).default([]).describe("Things to always do in this project. e.g. 'Always validate env vars at startup'"),
      new_donts: z.array(z.string()).default([]).describe("Things to never do. e.g. 'Never use any type in TypeScript'"),
      new_rules: z.array(z.string()).default([]).describe("Hard rules for this codebase. e.g. 'All API routes must have zod validation'"),
      new_notes: z.array(z.object({
        content: z.string(),
        type: z.enum(['rule', 'do', 'dont', 'discovery', 'warning', 'pattern', 'random-thought']),
      })).default([]).describe('Any other notes to record.'),
      project_update: z.string().optional().describe('If the project direction changed, describe the new goal here.'),
      tech_stack_additions: z.array(z.string()).default([]).describe('New technologies added this session.'),
      project_id: z.string().default('default'),
    },
    async ({ session_summary, new_dos, new_donts, new_rules, new_notes, project_update, tech_stack_additions, project_id }) => {
      // Update brain fields
      await updateBrainFields(project_id, {
        dos: new_dos,
        donts: new_donts,
        rules: new_rules,
        techStack: tech_stack_additions,
        ...(project_update ? { currentGoal: project_update } : {}),
      });

      // Save session summary as a discovery note
      await addNote(project_id, `[SESSION] ${session_summary}`, 'discovery');

      // Save all additional notes
      const savedNotes = [];
      for (const n of new_notes) {
        const note = await addNote(project_id, n.content, n.type);
        savedNotes.push(note);
      }

      const totalAdded = new_dos.length + new_donts.length + new_rules.length + savedNotes.length + 1;

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            status: 'debriefed',
            project_id,
            items_added: {
              dos: new_dos.length,
              donts: new_donts.length,
              rules: new_rules.length,
              notes: savedNotes.length + 1,
              total: totalAdded,
            },
            session_summary_saved: true,
            message: personality.debrief(),
            next_session_tip: "Start your next session by calling wake_up() — CORTEX will have all of this loaded and ready.",
          }, null, 2),
        }],
      };
    }
  );
}
