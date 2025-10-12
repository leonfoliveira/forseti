package io.github.leonfoliveira.forseti.common.adapter.rabbitmq.message

import java.io.Serializable
import java.util.UUID

data class SubmissionMessagePayload(
    val contestId: UUID,
    val submissionId: UUID,
) : Serializable
