package com.forsetijudge.core.port.driven.queue.payload

import java.io.Serializable
import java.util.UUID

data class SubmissionQueuePayload(
    val submissionId: UUID,
) : Serializable
