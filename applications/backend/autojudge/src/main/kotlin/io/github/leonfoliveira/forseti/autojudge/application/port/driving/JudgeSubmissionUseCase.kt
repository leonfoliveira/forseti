package io.github.leonfoliveira.forseti.autojudge.application.port.driving

import java.util.UUID

interface JudgeSubmissionUseCase {
    fun judge(
        contestId: UUID,
        submissionId: UUID,
    )
}
