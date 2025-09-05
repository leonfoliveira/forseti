export type Message = {
  id: string;
  defaultMessage: string;
  values?: Record<string, any>;
};

export function defineMessages<
  TMessages extends Record<string, Omit<Message, "values">>,
>(messages: TMessages): TMessages {
  return messages;
}
