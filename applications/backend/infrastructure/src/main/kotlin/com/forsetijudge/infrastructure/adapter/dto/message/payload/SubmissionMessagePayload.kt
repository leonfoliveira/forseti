package com.forsetijudge.infrastructure.adapter.dto.message.payload

import java.io.Serializable
import java.util.UUID

/**
 * Payload for submission messages sent via RabbitMQ
 *
 * @param contestId The ID of the contest
 * @param submissionId The ID of the submission
 */
data class SubmissionMessagePayload(
    val contestId: UUID,
    val submissionId: UUID,
) : Serializable
