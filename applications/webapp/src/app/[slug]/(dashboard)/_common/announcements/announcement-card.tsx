import { Card } from "@/app/_lib/component/base/display/card";
import { FormattedDateTime } from "@/app/_lib/component/format/formatted-datetime";
import { AnnouncementResponseDTO } from "@/core/port/dto/response/announcement/AnnouncementResponseDTO";

type Props = {
  announcement: AnnouncementResponseDTO;
};

export function AnnouncementCard({ announcement }: Props) {
  return (
    <Card key={announcement.id} data-testid="announcement">
      <Card.Body>
        <div className="flex w-full justify-between">
          <div>
            <p
              className="text-sm font-semibold"
              data-testid="announcement-member-name"
            >
              {announcement.member.name}
            </p>
          </div>
          <p
            className="text-default-400 text-xs"
            data-testid="announcement-created-at"
          >
            <FormattedDateTime timestamp={announcement.createdAt} />
          </p>
        </div>
        <p className="mt-3" data-testid="announcement-text">
          {announcement.text}
        </p>
      </Card.Body>
    </Card>
  );
}
