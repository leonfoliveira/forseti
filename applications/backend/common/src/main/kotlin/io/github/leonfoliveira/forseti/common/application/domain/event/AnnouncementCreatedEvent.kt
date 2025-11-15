package io.github.leonfoliveira.forseti.common.application.domain.event

import io.github.leonfoliveira.forseti.common.application.domain.entity.Announcement
import org.springframework.context.ApplicationEvent

/**
 * Event triggered when a new announcement is created
 */
class AnnouncementCreatedEvent(
    source: Any,
    val announcement: Announcement,
) : ApplicationEvent(source)
