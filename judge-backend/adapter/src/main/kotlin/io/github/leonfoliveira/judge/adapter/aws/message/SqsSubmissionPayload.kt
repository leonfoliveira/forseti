package io.github.leonfoliveira.judge.adapter.aws.message

import java.io.Serializable
import java.util.UUID

data class SqsSubmissionPayload(
    val submissionId: UUID,
) : Serializable
