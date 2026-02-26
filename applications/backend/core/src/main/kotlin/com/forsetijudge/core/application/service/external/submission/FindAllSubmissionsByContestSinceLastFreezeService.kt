package com.forsetijudge.core.application.service.external.submission

import com.forsetijudge.core.application.util.ContestAuthorizer
import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.domain.model.ExecutionContext
import com.forsetijudge.core.port.driven.repository.ContestRepository
import com.forsetijudge.core.port.driven.repository.MemberRepository
import com.forsetijudge.core.port.driven.repository.SubmissionRepository
import com.forsetijudge.core.port.driving.usecase.external.submission.FindAllSubmissionsByContestSinceLastFreezeUseCase
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class FindAllSubmissionsByContestSinceLastFreezeService(
    private val contestRepository: ContestRepository,
    private val memberRepository: MemberRepository,
    private val submissionRepository: SubmissionRepository,
) : FindAllSubmissionsByContestSinceLastFreezeUseCase {
    private val logger = LoggerFactory.getLogger(this::class.java)

    @Transactional(readOnly = true)
    override fun execute(command: FindAllSubmissionsByContestSinceLastFreezeUseCase.Command): List<Submission> {
        val contextContestId = ExecutionContext.getContestId()
        val contextMemberId = ExecutionContext.getMemberId()

        logger.info(
            "Finding all submissions for contest with id: $contextContestId since last freeze",
        )

        val contest =
            contestRepository.findById(contextContestId)
                ?: throw NotFoundException("Could not find contest with id: $contextContestId")
        val member =
            memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId)
                ?: throw NotFoundException("Could not find member with id: $contextMemberId in this contest")

        ContestAuthorizer(contest, member)
            .or({ it.requireMemberCanAccessNotStartedContest() }, { it.requireContestStarted() })
            .throwIfErrors()

        val submissions = submissionRepository.findByContestIdAndCreatedAtGreaterThanEqual(contest.id, command.frozenAt)

        logger.info("Found ${submissions.size} submissions")
        return submissions
    }
}
