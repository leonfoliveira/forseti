package io.github.leonfoliveira.judge.common.event

import io.github.leonfoliveira.judge.common.domain.entity.Announcement
import org.springframework.context.ApplicationEvent

class AnnouncementCreatedEvent(
    source: Any,
    val announcement: Announcement,
) : ApplicationEvent(source)
