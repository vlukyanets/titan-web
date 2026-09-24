import {
  Activity,
  Bell,
  BellRing,
  CalendarDays,
  ChartLine,
  House,
  ListChecks,
  MessageSquare,
  NotebookPen,
  Settings,
  Sun,
  type LucideIcon,
} from 'lucide-react';
import type { MessageId } from '@/shared/i18n';
import type { AppPath } from './router.tsx';

export interface NavigationItem {
  to: AppPath;
  label: MessageId;
  icon: LucideIcon;
}

// Screens in the order of the Web UI spec.
export const navigation: readonly NavigationItem[] = [
  { to: '/', label: 'nav.today', icon: Sun },
  { to: '/chat', label: 'nav.chat', icon: MessageSquare },
  { to: '/tasks', label: 'nav.tasks', icon: ListChecks },
  { to: '/calendar', label: 'nav.calendar', icon: CalendarDays },
  { to: '/notes', label: 'nav.notes', icon: NotebookPen },
  { to: '/trackers', label: 'nav.trackers', icon: ChartLine },
  { to: '/reminders', label: 'nav.reminders', icon: BellRing },
  { to: '/notifications', label: 'nav.notifications', icon: Bell },
  { to: '/activity', label: 'nav.activity', icon: Activity },
  { to: '/settings', label: 'nav.settings', icon: Settings },
  { to: '/household', label: 'nav.household', icon: House },
];
