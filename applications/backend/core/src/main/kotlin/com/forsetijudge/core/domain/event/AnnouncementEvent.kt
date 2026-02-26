package com.forsetijudge.core.domain.event

import com.forsetijudge.core.domain.entity.Announcement

abstract class AnnouncementEvent : BusinessEvent() {
    /**
     * Event published when an announcement is created
     *
     * @param announcement the created announcement
     */
    class Created(
        val announcement: Announcement,
    ) : AnnouncementEvent()
}
