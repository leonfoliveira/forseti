package com.forsetijudge.core.application.service.internal.submission

import com.forsetijudge.core.application.util.SafeLogger
import com.forsetijudge.core.domain.entity.Contest
import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.port.driven.repository.SubmissionRepository
import org.springframework.stereotype.Service
import java.time.OffsetDateTime

@Service
class SubmissionFinder(
    private val submissionRepository: SubmissionRepository,
) {
    private val logger = SafeLogger(this::class)

    fun findAllByContestSinceLastFreeze(
        contest: Contest,
        frozenAt: OffsetDateTime,
    ): List<Submission> {
        logger.info(
            "Finding all submissions for contest with id: ${contest.id} since last freeze",
        )

        val submissions = submissionRepository.findByContestIdAndCreatedAtGreaterThanEqual(contest.id, frozenAt)

        logger.info("Found ${submissions.size} submissions")
        return submissions
    }
}
