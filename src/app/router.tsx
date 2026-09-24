import {
  createRootRoute,
  createRoute,
  createRouter,
  type RouterHistory,
  type RouteIds,
} from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { ActivityPage } from '@/features/activity';
import { CalendarPage } from '@/features/calendar';
import { ChatPage } from '@/features/chat';
import { HouseholdPage } from '@/features/household';
import { NotesPage } from '@/features/notes';
import { NotificationsPage } from '@/features/notifications';
import { RemindersPage } from '@/features/reminders';
import { SettingsPage } from '@/features/settings';
import { TasksPage } from '@/features/tasks';
import { TodayPage } from '@/features/today';
import { TrackersPage } from '@/features/trackers';
import { Layout } from './Layout.tsx';
import { NotFound } from './NotFound.tsx';

const rootRoute = createRootRoute({ component: Layout, notFoundComponent: NotFound });

const screen = <TPath extends string>(path: TPath, component: () => ReactNode) =>
  createRoute({ getParentRoute: () => rootRoute, path, component });

const routeTree = rootRoute.addChildren([
  screen('/', TodayPage),
  screen('/chat', ChatPage),
  screen('/tasks', TasksPage),
  screen('/calendar', CalendarPage),
  screen('/notes', NotesPage),
  screen('/trackers', TrackersPage),
  screen('/reminders', RemindersPage),
  screen('/notifications', NotificationsPage),
  screen('/activity', ActivityPage),
  screen('/settings', SettingsPage),
  screen('/household', HouseholdPage),
]);

export function createAppRouter(history?: RouterHistory) {
  return createRouter({
    routeTree,
    ...(history === undefined ? {} : { history }),
    defaultPreload: 'intent',
    scrollRestoration: true,
  });
}

export type AppRouter = ReturnType<typeof createAppRouter>;
export type AppPath = Exclude<RouteIds<typeof routeTree>, '__root__'>;

declare module '@tanstack/react-router' {
  interface Register {
    router: AppRouter;
  }
}
