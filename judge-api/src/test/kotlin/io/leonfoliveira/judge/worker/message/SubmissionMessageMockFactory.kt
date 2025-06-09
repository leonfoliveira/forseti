package io.leonfoliveira.judge.worker.message

import io.leonfoliveira.judge.worker.consumer.message.SubmissionMessage
import java.util.UUID

object SubmissionMessageMockFactory {
    fun build(id: UUID = UUID.randomUUID()) =
        SubmissionMessage(
            id = id,
        )
}
