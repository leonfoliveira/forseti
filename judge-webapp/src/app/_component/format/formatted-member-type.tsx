import { MemberType } from "@/core/domain/enumerate/MemberType";
import { defineMessages, FormattedMessage } from "react-intl";

const messages = defineMessages({
  [MemberType.ROOT]: {
    id: "_component.format.formatted-member-type.root",
    defaultMessage: "Root",
  },
  [MemberType.CONTESTANT]: {
    id: "_component.format.formatted-member-type.contestant",
    defaultMessage: "Contestant",
  },
  [MemberType.JUDGE]: {
    id: "_component.format.formatted-member-type.judge",
    defaultMessage: "Judge",
  },
});

export function FormattedMemberType({ memberType }: { memberType: MemberType }) {
  return <FormattedMessage {...messages[memberType]} />;
}
