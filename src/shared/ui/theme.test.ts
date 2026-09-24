import { describe, expect, it } from 'vitest';
import { applyThemeChoice, readThemeChoice, saveThemeChoice } from './theme.ts';

const memoryStorage = () => {
  const items = new Map<string, string>();
  return {
    getItem: (key: string) => items.get(key) ?? null,
    setItem: (key: string, value: string) => void items.set(key, value),
    removeItem: (key: string) => void items.delete(key),
  };
};

describe('theme choice', () => {
  it('remembers a manual choice and forgets it for system', () => {
    const store = memoryStorage();
    saveThemeChoice('dark', store);
    expect(readThemeChoice(store)).toBe('dark');
    saveThemeChoice('system', store);
    expect(readThemeChoice(store)).toBe('system');
  });

  it('follows the system for unknown values and missing or failing storage', () => {
    const store = memoryStorage();
    store.setItem('titan.theme', 'purple');
    expect(readThemeChoice(store)).toBe('system');
    expect(readThemeChoice(undefined)).toBe('system');

    const failing = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
      removeItem: () => {
        throw new Error('blocked');
      },
    };
    expect(readThemeChoice(failing)).toBe('system');
    expect(() => {
      saveThemeChoice('light', failing);
    }).not.toThrow();
  });

  it('sets data-theme on the root only for a manual choice', () => {
    const root = document.createElement('html');
    applyThemeChoice('light', root);
    expect(root.dataset['theme']).toBe('light');
    applyThemeChoice('system', root);
    expect(root.hasAttribute('data-theme')).toBe(false);
  });
});
