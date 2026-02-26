package com.forsetijudge.core.domain.event

import com.forsetijudge.core.domain.entity.Attachment
import org.springframework.context.ApplicationEvent

object AttachmentsEvent {
    /**
     * Event published when an attachment is uploaded
     *
     * @param attachment the uploaded attachment
     */
    class Uploaded(
        val attachment: Attachment,
    ) : ApplicationEvent(Any())
}
