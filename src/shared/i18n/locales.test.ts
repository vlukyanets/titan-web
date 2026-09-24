import { describe, expect, it } from 'vitest';
import en from './messages/en.json';
import { availableLocales, loadMessages, pickLocale } from './locales.ts';

describe('pickLocale', () => {
  const available = ['en', 'pt-BR', 'ru', 'uk'];

  it('takes the first preference that is available', () => {
    expect(pickLocale(['de', 'uk', 'ru'], available)).toBe('uk');
  });

  it('matches a regional preference to its base language', () => {
    expect(pickLocale(['ru-RU'], available)).toBe('ru');
  });

  it('prefers an exact regional match, ignoring case', () => {
    expect(pickLocale(['pt-br'], available)).toBe('pt-BR');
  });

  it('falls back to English', () => {
    expect(pickLocale(['de-DE', 'fr'], available)).toBe('en');
    expect(pickLocale([], available)).toBe('en');
  });
});

describe('loadMessages', () => {
  it('ships English, Russian and Ukrainian', () => {
    expect(availableLocales).toEqual(expect.arrayContaining(['en', 'ru', 'uk']));
  });

  it('answers English for an unknown language', async () => {
    await expect(loadMessages('xx')).resolves.toEqual(en);
  });

  it('loads a translation with every English id', async () => {
    const messages = await loadMessages('uk');
    expect(Object.keys(messages).sort()).toEqual(Object.keys(en).sort());
  });
});
