import en from './messages/en.json';

export type MessageId = keyof typeof en;
export type Messages = Record<MessageId, string>;

export const defaultLocale = 'en';

// Every JSON file in messages/ is a language, so adding one needs no code.
const loaders = import.meta.glob<Partial<Messages>>(['./messages/*.json', '!./messages/en.json'], {
  import: 'default',
});

const localeFromPath = (path: string): string => path.replace(/^.*\/(.+)\.json$/, '$1');

const loadersByLocale = new Map(
  Object.entries(loaders).map(([path, load]) => [localeFromPath(path), load]),
);

export const availableLocales: readonly string[] = [
  defaultLocale,
  ...loadersByLocale.keys(),
].sort();

/**
 * Picks the first available language from the user's preferences, as the
 * browser lists them. `pt-BR` matches `pt-BR` first and then `pt`.
 */
export function pickLocale(
  preferred: readonly string[],
  available: readonly string[] = availableLocales,
): string {
  const byLowerCase = new Map(available.map((locale) => [locale.toLowerCase(), locale]));
  for (const wanted of preferred) {
    const lower = wanted.toLowerCase();
    const match = byLowerCase.get(lower) ?? byLowerCase.get(lower.split('-')[0] ?? '');
    if (match !== undefined) {
      return match;
    }
  }
  return defaultLocale;
}

/** Loads a language's messages, with English for any message it lacks. */
export async function loadMessages(locale: string): Promise<Messages> {
  const load = loadersByLocale.get(locale);
  if (load === undefined) {
    return en;
  }
  return { ...en, ...(await load()) };
}
