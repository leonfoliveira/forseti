package io.leonfoliveira.judge.core.service.submission

import io.leonfoliveira.judge.core.domain.entity.Submission
import io.leonfoliveira.judge.core.domain.exception.NotFoundException
import io.leonfoliveira.judge.core.repository.ContestRepository
import org.springframework.stereotype.Service

@Service
class FindSubmissionService(
    private val contestRepository: ContestRepository,
) {
    fun findAllByContest(contestId: Int): List<Submission> {
        val contest =
            contestRepository.findById(contestId).orElseThrow {
                NotFoundException("Could not find contest with id = $contestId")
            }
        if (!contest.hasStarted()) {
            throw NotFoundException("Contest has not started yet")
        }
        val submissions =
            contest.members.map {
                it.submissions
            }.flatten()

        return submissions.sortedBy { it.createdAt }
    }
}
