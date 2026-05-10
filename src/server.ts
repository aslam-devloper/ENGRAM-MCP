import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerInitSession } from './tools/init-session.js';
import { registerSaveCheckpoint } from './tools/save-checkpoint.js';
import { registerWakeUp } from './tools/wake-up.js';
import { registerJot } from './tools/jot.js';
import { registerBrainDump } from './tools/brain-dump.js';
import { registerDebrief } from './tools/debrief.js';
import { registerMakeSkill } from './tools/make-skill.js';
import { registerGetSkill } from './tools/get-skill.js';
import { registerListSkills } from './tools/list-skills.js';
import { registerCheckPulse } from './tools/check-pulse.js';

const ENGRAM_PROTOCOL = [
  'ENGRAM — Your AI\'s persistent memory trace.',
  'MANDATORY PROTOCOL:',
  '1. SESSION START      -> Call wake_up() immediately.',
  '2. FIRST EVER RUN    -> If wake_up() returns no_memory_yet, call init_session() with history.',
  '3. CONTEXT ~70% FULL -> Call save_checkpoint(), then continue.',
  '4. DISCOVERY         -> Call jot() immediately.',
  '5. EVERY ~20 MSGS    -> Call check_pulse().',
  '6. SESSION END       -> Call debrief().',
  '7. SKILLS            -> list_skills() / get_skill(name) / make_skill().',
  '',
  'TOOLS:',
  'wake_up, init_session, save_checkpoint, jot, debrief,',
  'brain_dump, check_pulse, make_skill, get_skill, list_skills',
  '',
  'Storage: ~/.engram/ or $ENGRAM_HOME. JSON + Markdown dual format.',
].join('\n');

export function createServer(): McpServer {
  const server = new McpServer({
    name: 'engram-mcp',
    version: '1.0.0',
  });

  // Expose protocol as an MCP prompt so any AI client can read it
  server.prompt(
    'engram_protocol',
    'Full ENGRAM usage protocol and tool reference. Read when unsure how to use ENGRAM.',
    {},
    async () => ({
      messages: [{
        role: 'user' as const,
        content: { type: 'text' as const, text: ENGRAM_PROTOCOL },
      }],
    })
  );

  // Register all 10 tools
  registerInitSession(server);
  registerSaveCheckpoint(server);
  registerWakeUp(server);
  registerJot(server);
  registerBrainDump(server);
  registerDebrief(server);
  registerMakeSkill(server);
  registerGetSkill(server);
  registerListSkills(server);
  registerCheckPulse(server);

  return server;
}
