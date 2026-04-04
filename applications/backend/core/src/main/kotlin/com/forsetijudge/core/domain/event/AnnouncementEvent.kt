package com.forsetijudge.core.domain.event

import java.util.UUID

interface AnnouncementEvent : BusinessEvent {
    /**
     * Event published when an announcement is created
     *
     * @param announcementId the created announcement
     */
    data class Created(
        val announcementId: UUID,
    ) : AnnouncementEvent
}
