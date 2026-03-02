package com.forsetijudge.core.domain.event

import org.springframework.context.ApplicationEvent
import java.util.UUID

object AttachmentsEvent {
    /**
     * Event published when an attachment is uploaded
     *
     * @param attachment the uploaded attachment
     */
    class Uploaded(
        val attachmentId: UUID,
    ) : ApplicationEvent(Any())
}
