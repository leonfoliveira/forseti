package live.forseti.core.domain.event

import live.forseti.core.domain.entity.Announcement
import org.springframework.context.ApplicationEvent

/**
 * Event triggered when a new announcement is created
 */
class AnnouncementCreatedEvent(
    source: Any,
    val announcement: Announcement,
) : ApplicationEvent(source)
