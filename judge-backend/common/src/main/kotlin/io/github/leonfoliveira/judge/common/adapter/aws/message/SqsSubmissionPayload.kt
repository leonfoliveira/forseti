package io.github.leonfoliveira.judge.common.adapter.aws.message

import java.io.Serializable
import java.util.UUID

data class SqsSubmissionPayload(
    val contestId: UUID,
    val submissionId: UUID,
) : Serializable
