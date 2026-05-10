import { ProjectBrain, Checkpoint, Skill, InstructionSkill, TemplateSkill } from '../types/index.js';

export function brainToMarkdown(brain: ProjectBrain): string {
  const noteLines = brain.notes.map(n => `- **[${n.type.toUpperCase()}]** ${n.content} *(${new Date(n.createdAt).toLocaleDateString()})*`).join('\n');
  return `# 🧠 CORTEX Brain — ${brain.projectName}
> *Last updated: ${new Date(brain.updatedAt).toLocaleString()} | CORTEX v1.0.0*

## 📌 Overview
${brain.description || '_No description yet._'}

**Current Goal:** ${brain.currentGoal || '_Not set_'}
**Tech Stack:** ${brain.techStack.length > 0 ? brain.techStack.join(', ') : '_Not specified_'}

---

## ✅ Do's
${brain.dos.length > 0 ? brain.dos.map(d => `- ${d}`).join('\n') : '_None recorded yet._'}

## ❌ Don'ts
${brain.donts.length > 0 ? brain.donts.map(d => `- ${d}`).join('\n') : '_None recorded yet._'}

## 📏 Rules
${brain.rules.length > 0 ? brain.rules.map(r => `- ${r}`).join('\n') : '_None recorded yet._'}

## 📝 Notes & Discoveries
${brain.notes.length > 0 ? noteLines : '_No notes yet._'}

---
*Created: ${new Date(brain.createdAt).toLocaleString()}*
`;
}

export function checkpointToMarkdown(cp: Checkpoint): string {
  return `# 💾 Checkpoint — \`${cp.name}\`
> *Saved: ${new Date(cp.createdAt).toLocaleString()} | Project: ${cp.projectId}*

## 🎯 What We're Building
${cp.what_we_are_building}

## 📊 Current Status
${cp.current_status}

## 🧠 Mental Model
${cp.mental_model || '_Not recorded_'}

## 🔑 Key Decisions
${cp.key_decisions.length > 0 ? cp.key_decisions.map(d => `- ${d}`).join('\n') : '_None_'}

## 🚀 Next Steps
${cp.next_steps.map(s => `- [ ] ${s}`).join('\n')}

## 📁 Important Files
${cp.important_files.length > 0 ? cp.important_files.map(f => `- \`${f}\``).join('\n') : '_None specified_'}

---
*Checkpoint ID: \`${cp.id}\`*
`;
}

export function skillToMarkdown(skill: Skill): string {
  if (skill.type === 'instruction') {
    const s = skill as InstructionSkill;
    return `# 🛠️ Skill (Instruction) — ${s.name}
> *Created: ${new Date(s.createdAt).toLocaleString()} | Used: ${s.usageCount} times*

**Description:** ${s.description}
**Tags:** ${s.tags.map(t => `\`${t}\``).join(', ')}

---

## Instructions
${s.instructions}

---
*Skill ID: \`${s.id}\`*
`;
  }
  const s = skill as TemplateSkill;
  return `# 🧩 Skill (Template) — ${s.name}
> *Created: ${new Date(s.createdAt).toLocaleString()} | Used: ${s.usageCount} times*

**Description:** ${s.description}
**Tags:** ${s.tags.map(t => `\`${t}\``).join(', ')}
**Variables:** ${s.variables.map(v => `\`{{${v}}}\``).join(', ')}

---

## Template
\`\`\`
${s.template}
\`\`\`

---
*Skill ID: \`${s.id}\`*
`;
}
