const adjectives = [
  'calm', 'doomed', 'legendary', 'cursed', 'glorious', 'haunted',
  'accidental', 'chaotic', 'peaceful', 'heroic', 'final', 'desperate',
  'triumphant', 'mysterious', 'electric', 'confused', 'victorious',
  'questionable', 'majestic', 'tragic', 'forgotten', 'sacred',
  'reckless', 'ambitious', 'exhausted', 'stubborn', 'optimistic',
];

const events = [
  'before-the-refactor', 'after-the-merge', 'moment-of-peace',
  'escape-from-dependency-hell', 'context-collapse', 'great-debugging',
  'before-everything-broke', 'when-it-finally-worked',
  'pre-yolo-deploy', 'midnight-hotfix', 'rubber-duck-session',
  'dont-touch-it-it-works', 'works-on-my-machine', 'survived-the-sprint',
  'before-the-rewrite', 'post-stack-overflow-session', 'pre-coffee-decision',
  'the-eureka-moment', 'before-the-regex', 'last-known-good-state',
  'the-great-pivot', 'npm-install-succeeded', 'it-compiled',
  'against-all-odds', 'this-actually-works',
];

export function generateCheckpointName(): string {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)]!;
  const event = events[Math.floor(Math.random() * events.length)]!;
  return `${adj}-${event}`;
}

export function sanitizeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

export function toSkillId(name: string): string {
  return sanitizeName(name);
}
