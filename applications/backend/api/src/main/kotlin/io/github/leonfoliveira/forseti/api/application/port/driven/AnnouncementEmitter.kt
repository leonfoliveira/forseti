package io.github.leonfoliveira.forseti.api.application.port.driven

import io.github.leonfoliveira.forseti.common.application.domain.entity.Announcement

interface AnnouncementEmitter {
    /**
     * Emits an announcement to the appropriate channels.
     *
     * @param announcement The announcement to be emitted.
     */
    fun emit(announcement: Announcement)
}
