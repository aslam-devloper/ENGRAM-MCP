import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getBrain } from '../store/brain.js';
import { listCheckpoints, getLatestCheckpoint } from '../store/checkpoints.js';
import { listSkillsRaw } from '../store/skills.js';

export function registerBrainDump(server: McpServer): void {
  server.tool(
    'brain_dump',
    'Get EVERYTHING CORTEX knows about a project in one shot. Full brain + recent checkpoints + all skills. Use when you need the full picture fast, or when onboarding into a project cold.',
    {
      project_id: z.string().default('default').describe('Project to dump.'),
      max_checkpoints: z.number().int().min(1).max(10).default(3).describe('How many recent checkpoints to include.'),
      include_skills: z.boolean().default(true).describe('Whether to include full skill details.'),
    },
    async ({ project_id, max_checkpoints, include_skills }) => {
      const [brain, allCheckpoints, latestCheckpoint, skills] = await Promise.all([
        getBrain(project_id),
        listCheckpoints(project_id),
        getLatestCheckpoint(project_id),
        include_skills ? listSkillsRaw(project_id) : Promise.resolve([]),
      ]);

      const recentCheckpoints = allCheckpoints.slice(0, max_checkpoints);

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            project: {
              id: project_id,
              name: brain.projectName,
              description: brain.description,
              tech_stack: brain.techStack,
              current_goal: brain.currentGoal,
              created_at: brain.createdAt,
              last_updated: brain.updatedAt,
            },
            intelligence: {
              dos: brain.dos,
              donts: brain.donts,
              rules: brain.rules,
              notes_count: brain.notes.length,
              notes: brain.notes,
            },
            checkpoints: {
              total: allCheckpoints.length,
              latest: latestCheckpoint ? {
                name: latestCheckpoint.name,
                what: latestCheckpoint.what_we_are_building,
                status: latestCheckpoint.current_status,
                next_steps: latestCheckpoint.next_steps,
                saved_at: latestCheckpoint.createdAt,
              } : null,
              recent: recentCheckpoints,
            },
            skills: include_skills ? skills.map(s => ({
              id: s.id,
              name: s.name,
              type: s.type,
              description: s.description,
              tags: s.tags,
              usage_count: s.usageCount,
              ...(s.type === 'instruction' ? { instructions: s.instructions } : {}),
              ...(s.type === 'template' ? { template: s.template, variables: s.variables } : {}),
            })) : `${skills.length} skills available. Call brain_dump with include_skills=true to see them.`,
            meta: {
              brain_file: `~/.cortex/projects/${project_id}/brain.json`,
              brain_md: `~/.cortex/projects/${project_id}/brain.md`,
              checkpoints_dir: `~/.cortex/projects/${project_id}/checkpoints/`,
              skills_dir: `~/.cortex/projects/${project_id}/skills/`,
            },
          }, null, 2),
        }],
      };
    }
  );
}
