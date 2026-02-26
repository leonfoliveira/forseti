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
import com.forsetijudge.core.port.driving.usecase.external.submission.UpdateAnswerSubmissionUseCase
import org.springframework.context.ApplicationEventPublisher
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class UpdateAnswerSubmissionService(
    private val submissionRepository: SubmissionRepository,
    private val memberRepository: MemberRepository,
    private val applicationEventPublisher: ApplicationEventPublisher,
) : UpdateAnswerSubmissionUseCase {
    private val logger = SafeLogger(this::class)

    @Transactional
    override fun execute(command: UpdateAnswerSubmissionUseCase.Command): Submission {
        val contextContestId = ExecutionContext.getContestId()
        val contextMemberId = ExecutionContext.getMemberId()

        logger.info(
            "Updating answer for submission with id: ${command.submissionId} to answer: ${command.answer}",
        )

        val submission =
            submissionRepository.findByIdAndContestId(command.submissionId, contextContestId)
                ?: throw NotFoundException("Could not find submission with id: ${command.submissionId} in this contest")
        val member =
            memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId)
                ?: throw NotFoundException("Could not find member with id: $contextContestId in this contest")

        ContestAuthorizer(submission.contest, member)
            .requireMemberType(Member.Type.ROOT, Member.Type.ADMIN, Member.Type.JUDGE)
            .throwIfErrors()

        submission.status = Submission.Status.JUDGED
        submission.answer = command.answer

        submissionRepository.save(submission)
        applicationEventPublisher.publishEvent(SubmissionEvent.Updated(submission))

        logger.info("Submission answer updated successfully")
        return submission
    }
}
