import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { listSkillsRaw } from '../store/skills.js';
import { Skill } from '../types/index.js';

export function registerListSkills(server: McpServer): void {
  server.tool(
    'list_skills',
    'List all available skills for a project. Filter by type or tags. Use this to discover what skills exist before calling get_skill().',
    {
      project_id: z.string().default('default'),
      filter_type: z.enum(['instruction', 'template', 'all']).default('all').describe('Filter by skill type.'),
      filter_tags: z.array(z.string()).default([]).describe('If provided, only return skills that have ALL of these tags.'),
    },
    async ({ project_id, filter_type, filter_tags }) => {
      let skills: Skill[] = await listSkillsRaw(project_id);

      if (filter_type !== 'all') {
        skills = skills.filter(s => s.type === filter_type);
      }
      if (filter_tags.length > 0) {
        skills = skills.filter(s => filter_tags.every(tag => s.tags.includes(tag)));
      }

      skills.sort((a, b) => b.usageCount - a.usageCount);

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            project_id,
            total_skills: skills.length,
            filtered_by: { type: filter_type, tags: filter_tags },
            skills: skills.map(s => ({
              id: s.id,
              name: s.name,
              type: s.type,
              description: s.description,
              tags: s.tags,
              usage_count: s.usageCount,
              created_at: s.createdAt,
            })),
            tip: skills.length === 0
              ? "No skills yet. Create one with make_skill()."
              : `Load any skill with: get_skill("<name>", "${project_id}")`,
          }, null, 2),
        }],
      };
    }
  );
}
