export type Message = {
  id: string;
  defaultMessage: string;
  values?: Record<string, any>;
};

/**
 * Defines i18n messages.
 * Used by the extraction tool to find messages in the codebase.
 *
 * @param messages The messages to define.
 * @returns The same messages.
 */
export function defineMessages<
  TMessages extends Record<string, Omit<Message, "values">>,
>(messages: TMessages): TMessages {
  return messages;
}
