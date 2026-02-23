package com.forsetijudge.core.domain.event

import com.forsetijudge.core.domain.entity.Announcement

abstract class AnnouncementEvent(
    announcement: Announcement,
) : BusinessEvent<Announcement>(announcement) {
    /**
     * Event published when an announcement is created
     *
     * @param announcement the created announcement
     */
    class Created(
        announcement: Announcement,
    ) : AnnouncementEvent(announcement)
}
