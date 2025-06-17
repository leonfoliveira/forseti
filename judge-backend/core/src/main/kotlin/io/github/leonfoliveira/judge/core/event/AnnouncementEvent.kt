package io.github.leonfoliveira.judge.core.event

import io.github.leonfoliveira.judge.core.domain.entity.Announcement
import org.springframework.context.ApplicationEvent

class AnnouncementEvent(
    source: Any,
    val announcement: Announcement,
    val isDeleted: Boolean = false,
) : ApplicationEvent(source)
