export const themeChoices = ['system', 'light', 'dark'] as const;
export type ThemeChoice = (typeof themeChoices)[number];

const storageKey = 'titan.theme';

const isThemeChoice = (value: unknown): value is ThemeChoice =>
  themeChoices.includes(value as ThemeChoice);

type PreferenceStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

// Storage can be missing or throw (private windows, blocked site data); the
// theme then simply follows the system.
function storage(): PreferenceStorage | undefined {
  try {
    return globalThis.localStorage;
  } catch {
    return undefined;
  }
}

export function readThemeChoice(store: PreferenceStorage | undefined = storage()): ThemeChoice {
  try {
    const value = store?.getItem(storageKey);
    return isThemeChoice(value) ? value : 'system';
  } catch {
    return 'system';
  }
}

export function saveThemeChoice(
  choice: ThemeChoice,
  store: PreferenceStorage | undefined = storage(),
): void {
  try {
    if (choice === 'system') {
      store?.removeItem(storageKey);
    } else {
      store?.setItem(storageKey, choice);
    }
  } catch {
    // Not remembered; it still applies to this page.
  }
}

/** `system` leaves the colours to `prefers-color-scheme` in the stylesheet. */
export function applyThemeChoice(choice: ThemeChoice, root: HTMLElement): void {
  if (choice === 'system') {
    delete root.dataset['theme'];
  } else {
    root.dataset['theme'] = choice;
  }
}
