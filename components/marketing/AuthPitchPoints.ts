import { LayersIcon, MessagesSquareIcon, StarIcon } from 'lucide-react';

export const AUTH_PITCH_POINTS = [
  {
    icon: MessagesSquareIcon,
    title: 'Critique you can act on',
    body: 'Reviewers tell you what to cut, what to lead with, and why it matters for the roles you are actually chasing.',
  },
  {
    icon: StarIcon,
    title: 'Ratings with the reasons attached',
    body: 'Every score arrives with the written feedback that earned it, so you always know what to fix first.',
  },
  {
    icon: LayersIcon,
    title: 'Learn from the whole feed',
    body: 'Read strong resumes in your field and see exactly which lines the community rewarded.',
  },
] as const;
