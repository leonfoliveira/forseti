package io.github.leonfoliveira.forseti.common.application.port.driving

import io.github.leonfoliveira.forseti.common.application.domain.entity.Submission
import java.util.UUID

interface UpdateSubmissionUseCase {
    fun fail(submissionId: UUID): Submission

    fun rerun(id: UUID): Submission

    fun updateAnswer(
        submissionId: UUID,
        answer: Submission.Answer,
        force: Boolean = false,
    ): Submission
}
