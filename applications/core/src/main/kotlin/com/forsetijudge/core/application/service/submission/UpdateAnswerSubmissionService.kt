package com.forsetijudge.core.application.service.submission

import com.forsetijudge.core.application.helper.ContestAuthorizer
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.dto.response.submission.SubmissionWithCodeAndExecutionsResponseBodyDTO
import com.forsetijudge.core.port.dto.response.submission.toWithCodeAndExecutionResponseBodyDTO
import com.forsetijudge.core.port.input.usecase.submission.UpdateAnswerSubmissionUseCase
import com.forsetijudge.core.port.output.repository.MemberRepository
import com.forsetijudge.core.port.output.repository.SubmissionRepository
import com.forsetijudge.core.util.ExecutionContext
import com.forsetijudge.core.util.SafeLogger
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class UpdateAnswerSubmissionService(
    private val submissionRepository: SubmissionRepository,
    private val memberRepository: MemberRepository,
) : UpdateAnswerSubmissionUseCase {
    private val logger = SafeLogger(this::class)

    /**
     * Updates the answer of an existing submission.
     *
     * @param command The command containing the submission ID and the new answer.
     * @return The updated submission with its code result.
     */
    @Transactional
    override fun execute(command: UpdateAnswerSubmissionUseCase.Command): SubmissionWithCodeAndExecutionsResponseBodyDTO {
        val contextMemberId = ExecutionContext.getMemberId()

        logger.info(
            "Updating answer for submission with id: ${command.submissionId} to answer: ${command.answer}",
        )

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

        submission.status = Submission.Status.JUDGED
        submission.answer = command.answer

        submissionRepository.save(submission)

        logger.info("Submission answer updated successfully")
        return submission.toWithCodeAndExecutionResponseBodyDTO()
    }
}
