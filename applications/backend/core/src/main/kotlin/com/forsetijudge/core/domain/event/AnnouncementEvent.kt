package com.forsetijudge.core.domain.event

import java.util.UUID

abstract class AnnouncementEvent : BusinessEvent() {
    /**
     * Event published when an announcement is created
     *
     * @param announcement the created announcement
     */
    class Created(
        val announcementId: UUID,
    ) : AnnouncementEvent()
}
