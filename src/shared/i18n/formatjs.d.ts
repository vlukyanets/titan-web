import type { MessageId } from './locales.ts';

// Message ids are checked against en.json at compile time.
declare global {
  namespace FormatjsIntl {
    interface Message {
      ids: MessageId;
    }
  }
}
