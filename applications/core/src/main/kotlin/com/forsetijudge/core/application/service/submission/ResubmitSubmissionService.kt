package com.forsetijudge.core.application.service.submission

import com.forsetijudge.core.application.helper.AuthenticationHelper
import com.forsetijudge.core.application.helper.BusinessEventPublisher
import com.forsetijudge.core.application.helper.ContestAuthorizer
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.domain.event.SubmissionEvent
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.dto.response.submission.SubmissionWithCodeAndExecutionsResponseBodyDTO
import com.forsetijudge.core.port.dto.response.submission.toWithCodeAndExecutionResponseBodyDTO
import com.forsetijudge.core.port.input.usecase.submission.ResubmitSubmissionUseCase
import com.forsetijudge.core.port.output.repository.MemberRepository
import com.forsetijudge.core.port.output.repository.SubmissionRepository
import com.forsetijudge.core.util.SafeLogger
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class ResubmitSubmissionService(
    private val submissionRepository: SubmissionRepository,
    private val memberRepository: MemberRepository,
    private val businessEventPublisher: BusinessEventPublisher,
) : ResubmitSubmissionUseCase {
    private val logger = SafeLogger(this::class)

    /**
     * Resubmits a submission by its ID, resting its status and returning the updated details along with the code.
     *
     * @param command The command containing the submission ID to be rerun.
     * @return The result of the resubmission operation, including the submission details and code.
     */
    @Transactional
    override fun execute(command: ResubmitSubmissionUseCase.Command): SubmissionWithCodeAndExecutionsResponseBodyDTO {
        val contextMemberId = AuthenticationHelper.getCurrentMemberId()

        logger.info("Resetting submission with id: ${command.submissionId}")

        val submission =
            submissionRepository.findByIdAndContestId(command.submissionId, command.contestId)
                ?: throw NotFoundException("Could not find submission with id: ${command.submissionId} in this contest")
        val member =
            memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, command.contestId)
                ?: throw NotFoundException("Could not find member with id: ${command.contestId} in this contest")

        ContestAuthorizer(submission.contest, member)
            .requireMemberToBelong()
            .requireMemberType(Member.Type.ROOT, Member.Type.ADMIN, Member.Type.JUDGE)
            .throwIfErrors()

        submission.status = Submission.Status.JUDGING
        submission.answer = null

        submissionRepository.save(submission)
        businessEventPublisher.publish(SubmissionEvent.Resubmitted(submission.id))

        logger.info("Submission reset successfully")
        return submission.toWithCodeAndExecutionResponseBodyDTO()
    }
}
