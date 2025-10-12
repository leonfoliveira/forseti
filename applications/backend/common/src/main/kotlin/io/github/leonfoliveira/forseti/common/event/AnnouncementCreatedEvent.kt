package io.github.leonfoliveira.forseti.common.event

import io.github.leonfoliveira.forseti.common.domain.entity.Announcement
import org.springframework.context.ApplicationEvent

class AnnouncementCreatedEvent(
    source: Any,
    val announcement: Announcement,
) : ApplicationEvent(source)
