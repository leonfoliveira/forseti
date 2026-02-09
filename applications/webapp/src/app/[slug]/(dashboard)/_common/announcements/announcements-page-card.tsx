import { Megaphone } from "lucide-react";

import { FormattedDateTime } from "@/app/_lib/component/i18n/formatted-datetime";
import { Card, CardContent } from "@/app/_lib/component/shadcn/card";
import { AnnouncementResponseDTO } from "@/core/port/dto/response/announcement/AnnouncementResponseDTO";

type Props = {
  announcement: AnnouncementResponseDTO;
};

export function AnnouncementsPageCard({ announcement }: Props) {
  return (
    <Card
      key={announcement.id}
      className="border-l-warning border-l-4"
      data-testid="announcement-card"
    >
      <CardContent>
        <div className="flex items-center gap-6">
          <Megaphone size={24} />
          <div>
            <div className="">
              <p
                className="text-sm font-semibold"
                data-testid="announcement-member-name"
              >
                {announcement.member.name}
              </p>
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
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
