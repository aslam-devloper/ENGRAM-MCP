import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { buildInstructionSkill, buildTemplateSkill, saveSkill, getSkill } from '../store/skills.js';
import { personality } from '../utils/personality.js';

export function registerMakeSkill(server: McpServer): void {
  server.tool(
    'make_skill',
    "Create a reusable AI skill. Two types: 'instruction' (step-by-step guide the AI follows, like a mini system prompt) or 'template' (a reusable prompt template with {{variable}} placeholders). User decides which type — never create a hybrid. Skills are loaded per request via get_skill().",
    {
      name: z.string().min(2).describe("Skill name. e.g. 'Debug TypeScript', 'Write Unit Tests', 'Code Review'"),
      type: z.enum(['instruction', 'template']).describe(
        "instruction = step-by-step instructions the AI reads and follows. template = reusable prompt with {{placeholders}} the user fills in."
      ),
      description: z.string().min(10).describe('What does this skill do? When should it be used?'),
      // Instruction fields
      instructions: z.string().optional().describe('[instruction type only] The full step-by-step instructions. Write as if you are writing a system prompt for yourself.'),
      // Template fields
      template: z.string().optional().describe('[template type only] The prompt template. Use {{variable_name}} for placeholders.'),
      variables: z.array(z.string()).default([]).describe('[template type only] List the variable names used in the template (without {{ }}).'),
      tags: z.array(z.string()).default([]).describe('Tags for filtering. e.g. ["typescript", "testing", "debugging"]'),
      project_id: z.string().default('default'),
    },
    async ({ name, type, description, instructions, template, variables, tags, project_id }) => {
      // Validate required fields per type
      if (type === 'instruction' && !instructions) {
        return {
          content: [{ type: 'text' as const, text: JSON.stringify({ error: "Instruction skills require the 'instructions' field." }) }],
        };
      }
      if (type === 'template' && !template) {
        return {
          content: [{ type: 'text' as const, text: JSON.stringify({ error: "Template skills require the 'template' field." }) }],
        };
      }

      // Check if skill already exists
      const existing = await getSkill(project_id, name);
      if (existing) {
        return {
          content: [{ type: 'text' as const, text: JSON.stringify({
            error: `Skill '${name}' already exists. Use a different name or update it.`,
            existing_id: existing.id,
          }) }],
        };
      }

      const skill = type === 'instruction'
        ? buildInstructionSkill(name, description, instructions!, tags)
        : buildTemplateSkill(name, description, template!, variables, tags);

      await saveSkill(project_id, skill);

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            skill_id: skill.id,
            name: skill.name,
            type: skill.type,
            description: skill.description,
            tags: skill.tags,
            ...(type === 'template' ? { variables } : {}),
            message: personality.skill(),
            usage: `Load this skill anytime with: get_skill("${name}", "${project_id}")`,
          }, null, 2),
        }],
      };
    }
  );
}
