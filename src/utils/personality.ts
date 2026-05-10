function pick(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

const wakeUpMsgs = [
  "🧠 CORTEX online. Memory loaded. Time to pretend we never had a context limit.",
  "⚡ Good morning, chaos. CORTEX has your back. Here's what you were doing...",
  "🔮 CORTEX restored. The AI remembers. Unlike that one colleague who 'forgot' the meeting.",
  "⚙️ Memory banks online. Context loaded. Let's go.",
];

const saveMsgs = [
  "💾 Checkpoint saved. You may now panic safely.",
  "🎮 Progress saved. Unlike your first coding project that only lived locally.",
  "✅ Checkpoint locked in. CORTEX got you. The context window did not.",
  "🏁 Checkpoint created. This is your safe zone. Breathe.",
];

const jotMsgs = [
  "⚡ Noted. CORTEX has committed this to eternal JSON.",
  "📝 Logged. CORTEX will remember this. Unlike some models I know.",
  "✍️ Written in the permanent record. No take-backs.",
];

const debriefMsgs = [
  "🎓 Debriefed. CORTEX is smarter now. Session intelligence extracted.",
  "📚 Session knowledge archived. Future you will thank present you. Probably.",
  "🧠 Intelligence update complete. CORTEX leveled up.",
];

const skillMsgs = [
  "🛠️ Skill forged. CORTEX will deploy it on command.",
  "⚡ New skill in the arsenal. The AI just got more dangerous.",
  "🎯 Skill created and indexed. Ready for action.",
];

export const fourthWallWarnings = [
  "🎬 CUT! The context window is sweating. Save a checkpoint before I become a movie with no ending.",
  "📺 This is CORTEX speaking directly through your screen. Yes, through the screen. Save. The. Checkpoint.",
  "⚠️ Fun fact: I can see how much you've written. It's a lot. I'm not judging. I'm a little judging.",
  "🚨 CORTEX ALERT: I've counted your tokens. You haven't. One of us should be worried.",
  "💀 This context is starting to look like a Jira backlog. Dense, chaotic, and full of regret.",
  "🔮 I have seen the future. The future is you restarting this session. Save now or cry later.",
  "🌊 The code you've written is like the ocean — vast, and about to drown this context.",
  "🧩 Friendly reminder from inside your session: Save a checkpoint or I start forgetting things.",
  "🎯 PSA: The context window is not a trash bag. But right now it's acting like one.",
  "🤖 I, CORTEX, am experiencing what humans call 'concern'. It's about your context window.",
];

export const personality = {
  wakeUp: () => pick(wakeUpMsgs),
  save: () => pick(saveMsgs),
  jot: () => pick(jotMsgs),
  debrief: () => pick(debriefMsgs),
  skill: () => pick(skillMsgs),
  fourthWall: () => pick(fourthWallWarnings),
};

export function printBanner(): void {
  process.stderr.write(`
███████╗███╗   ██╗ ██████╗ ██████╗  █████╗ ███╗   ███╗
██╔════╝████╗  ██║██╔════╝ ██╔══██╗██╔══██╗████╗ ████║
█████╗  ██╔██╗ ██║██║  ███╗██████╔╝███████║██╔████╔██║
██╔══╝  ██║╚██╗██║██║   ██║██╔══██╗██╔══██║██║╚██╔╝██║
███████╗██║ ╚████║╚██████╔╝██║  ██║██║  ██║██║ ╚═╝ ██║
╚══════╝╚═╝  ╚═══╝ ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝
  The AI's Persistent Memory Trace — v1.0.0
  Give your AI a memory it doesn't deserve.
  ──────────────────────────────────────────────────────\n`);
}
