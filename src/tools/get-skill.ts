import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getSkill, incrementSkillUsage } from '../store/skills.js';
import { InstructionSkill, TemplateSkill } from '../types/index.js';

export function registerGetSkill(server: McpServer): void {
  server.tool(
    'get_skill',
    "Load a specific skill by name. For instruction skills, read and follow the instructions. For template skills, fill in the {{variables}} with the provided values and use the completed prompt.",
    {
      name: z.string().describe('Skill name or ID to load.'),
      project_id: z.string().default('default'),
      variables: z.record(z.string()).optional().describe('[template skills only] Key-value map to fill template variables. e.g. {"component": "LoginForm", "framework": "Vitest"}'),
    },
    async ({ name, project_id, variables }) => {
      const skill = await getSkill(project_id, name);
      if (!skill) {
        return {
          content: [{ type: 'text' as const, text: JSON.stringify({
            error: `Skill '${name}' not found in project '${project_id}'.`,
            tip: "Call list_skills() to see all available skills.",
          }) }],
        };
      }

      await incrementSkillUsage(project_id, skill.id);

      if (skill.type === 'instruction') {
        const s = skill as InstructionSkill;
        return {
          content: [{
            type: 'text' as const,
            text: JSON.stringify({
              skill_id: s.id,
              name: s.name,
              type: 'instruction',
              description: s.description,
              instructions: s.instructions,
              directive: 'READ AND FOLLOW the instructions above for this task.',
              usage_count: s.usageCount + 1,
            }, null, 2),
          }],
        };
      }

      // Template skill
      const s = skill as TemplateSkill;
      let filled = s.template;
      const missingVars: string[] = [];

      for (const variable of s.variables) {
        const value = variables?.[variable];
        if (value) {
          filled = filled.replace(new RegExp(`\\{\\{${variable}\\}\\}`, 'g'), value);
        } else {
          missingVars.push(variable);
        }
      }

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            skill_id: s.id,
            name: s.name,
            type: 'template',
            description: s.description,
            variables_required: s.variables,
            variables_provided: variables ?? {},
            missing_variables: missingVars,
            filled_template: filled,
            raw_template: s.template,
            directive: missingVars.length > 0
              ? `⚠️ Template has ${missingVars.length} unfilled variable(s): ${missingVars.join(', ')}. Provide them via the 'variables' field.`
              : '✅ Template fully filled. Use the filled_template as your prompt.',
            usage_count: s.usageCount + 1,
          }, null, 2),
        }],
      };
    }
  );
}
