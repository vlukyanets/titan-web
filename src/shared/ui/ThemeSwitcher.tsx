import { useId, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import {
  applyThemeChoice,
  readThemeChoice,
  saveThemeChoice,
  themeChoices,
  type ThemeChoice,
} from './theme.ts';

const labels = {
  system: 'theme.system',
  light: 'theme.light',
  dark: 'theme.dark',
} as const satisfies Record<ThemeChoice, string>;

export function ThemeSwitcher() {
  const intl = useIntl();
  const id = useId();
  const [choice, setChoice] = useState(readThemeChoice);

  const change = (next: ThemeChoice) => {
    setChoice(next);
    saveThemeChoice(next);
    applyThemeChoice(next, document.documentElement);
  };

  return (
    <div className="flex items-center gap-2 text-sm">
      <label htmlFor={id} className="sr-only">
        <FormattedMessage id="theme.label" />
      </label>
      <select
        id={id}
        value={choice}
        onChange={(event) => {
          change(event.target.value as ThemeChoice);
        }}
        className="h-8 rounded-md border border-border bg-background px-2 text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        {themeChoices.map((value) => (
          <option key={value} value={value}>
            {intl.formatMessage({ id: labels[value] })}
          </option>
        ))}
      </select>
    </div>
  );
}
