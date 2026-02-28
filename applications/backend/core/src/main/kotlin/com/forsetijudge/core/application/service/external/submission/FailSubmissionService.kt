package com.forsetijudge.core.application.service.external.submission

import com.forsetijudge.core.application.util.ContestAuthorizer
import com.forsetijudge.core.application.util.SafeLogger
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.domain.event.SubmissionEvent
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.domain.model.ExecutionContext
import com.forsetijudge.core.port.driven.repository.MemberRepository
import com.forsetijudge.core.port.driven.repository.SubmissionRepository
import com.forsetijudge.core.port.driving.usecase.external.submission.FailSubmissionUseCase
import org.springframework.context.ApplicationEventPublisher
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class FailSubmissionService(
    private val submissionRepository: SubmissionRepository,
    private val memberRepository: MemberRepository,
    private val applicationEventPublisher: ApplicationEventPublisher,
) : FailSubmissionUseCase {
    private val logger = SafeLogger(this::class)

    @Transactional
    override fun execute(command: FailSubmissionUseCase.Command) {
        val contextMemberId = ExecutionContext.getMemberId()

        logger.info("Failing submission with id: ${command.submissionId}")

        val submission =
            submissionRepository.findById(command.submissionId)
                ?: throw NotFoundException("Could not find submission with id: ${command.submissionId} in this contest")
        val member =
            memberRepository.findById(contextMemberId)
                ?: throw NotFoundException("Could not find member with id: $contextMemberId in this contest")

        ContestAuthorizer(submission.contest, member)
            .requireMemberType(Member.Type.API)
            .throwIfErrors()

        if (submission.status != Submission.Status.JUDGING) {
            logger.info("Submission with id: ${submission.id} is not in judging status. Skipping failing submission.")
            return
        }

        submission.status = Submission.Status.FAILED

        submissionRepository.save(submission)
        applicationEventPublisher.publishEvent(SubmissionEvent.Updated(submission))

        logger.info("Submission failed successfully")
    }
}
