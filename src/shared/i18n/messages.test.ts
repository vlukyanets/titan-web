import { TYPE, parse, type MessageFormatElement } from '@formatjs/icu-messageformat-parser';
import { describe, expect, it } from 'vitest';

const files = import.meta.glob<Record<string, string>>('./messages/*.json', {
  eager: true,
  import: 'default',
});
const byName = new Map(
  Object.entries(files).map(([path, messages]) => [path.replace('./messages/', ''), messages]),
);

const english = byName.get('en.json') ?? {};
const translations = [...byName.keys()].filter((file) => file !== 'en.json');

function argumentNames(elements: MessageFormatElement[], names = new Set<string>()): Set<string> {
  for (const element of elements) {
    if (element.type === TYPE.literal || element.type === TYPE.pound) {
      continue;
    }
    names.add(element.value);
    if (element.type === TYPE.plural || element.type === TYPE.select) {
      for (const option of Object.values(element.options)) {
        argumentNames(option.value, names);
      }
    } else if (element.type === TYPE.tag) {
      argumentNames(element.children, names);
    }
  }
  return names;
}

const sorted = (names: Set<string>) => [...names].sort();

describe.each(['en.json', ...translations])('%s', (file) => {
  const messages = byName.get(file) ?? {};

  it('has exactly the English message ids', () => {
    expect(Object.keys(messages).sort()).toEqual(Object.keys(english).sort());
  });

  it.each(Object.keys(messages))('%s is valid ICU with the English arguments', (id) => {
    const message = messages[id] ?? '';
    const reference = english[id] ?? '';
    expect(message.trim()).not.toBe('');
    expect(sorted(argumentNames(parse(message)))).toEqual(sorted(argumentNames(parse(reference))));
  });
});
