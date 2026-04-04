package com.forsetijudge.core.domain.event

import java.util.UUID

interface AttachmentEvent {
    /**
     * Event published when an attachment is uploaded
     *
     * @param attachmentId the uploaded attachment
     */
    data class Uploaded(
        val attachmentId: UUID,
    ) : AttachmentEvent
}
