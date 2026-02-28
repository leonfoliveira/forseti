package com.forsetijudge.infrastructure.adapter.dto.rabbitmq.body

import java.io.Serializable
import java.util.UUID

data class SubmissionQueueMessageBody(
    val submissionId: UUID,
) : Serializable
