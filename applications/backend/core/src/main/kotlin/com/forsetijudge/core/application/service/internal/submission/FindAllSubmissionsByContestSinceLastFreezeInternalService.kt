package com.forsetijudge.core.application.service.internal.submission

import com.forsetijudge.core.application.util.SafeLogger
import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.port.driven.repository.SubmissionRepository
import com.forsetijudge.core.port.driving.usecase.internal.submission.FindAllSubmissionsByContestSinceLastFreezeInternalUseCase
import com.forsetijudge.core.port.dto.response.submission.SubmissionResponseBodyDTO
import com.forsetijudge.core.port.dto.response.submission.toResponseBodyDTO
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class FindAllSubmissionsByContestSinceLastFreezeInternalService(
    private val submissionRepository: SubmissionRepository,
) : FindAllSubmissionsByContestSinceLastFreezeInternalUseCase {
    private val logger = SafeLogger(this::class)

    override fun execute(command: FindAllSubmissionsByContestSinceLastFreezeInternalUseCase.Command): List<Submission> {
        logger.info(
            "Finding all submissions for contest with id: ${command.contest.id} since last freeze",
        )

        val submissions = submissionRepository.findByContestIdAndCreatedAtGreaterThanEqual(command.contest.id, command.frozenAt)

        logger.info("Found ${submissions.size} submissions")
        return submissions
    }
}
