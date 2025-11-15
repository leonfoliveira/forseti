package io.github.leonfoliveira.forseti.common.application.port.driving

import io.github.leonfoliveira.forseti.common.application.domain.entity.Submission
import java.util.UUID

interface FindSubmissionUseCase {
    fun findById(submissionId: UUID): Submission

    fun findAllByContest(contestId: UUID): List<Submission>

    fun findAllByMember(memberId: UUID): List<Submission>
}
