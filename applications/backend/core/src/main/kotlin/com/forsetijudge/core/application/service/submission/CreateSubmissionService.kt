package com.forsetijudge.core.application.service.submission

import com.forsetijudge.core.domain.entity.Attachment
import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.domain.event.SubmissionCreatedEvent
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.driven.repository.AttachmentRepository
import com.forsetijudge.core.port.driven.repository.ContestRepository
import com.forsetijudge.core.port.driven.repository.MemberRepository
import com.forsetijudge.core.port.driven.repository.ProblemRepository
import com.forsetijudge.core.port.driven.repository.SubmissionRepository
import com.forsetijudge.core.port.driving.usecase.submission.CreateSubmissionUseCase
import com.forsetijudge.core.port.dto.input.submission.CreateSubmissionInputDTO
import jakarta.validation.Valid
import org.slf4j.LoggerFactory
import org.springframework.context.ApplicationEventPublisher
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.validation.annotation.Validated
import java.util.UUID

@Service
@Validated
class CreateSubmissionService(
    private val contestRepository: ContestRepository,
    private val attachmentRepository: AttachmentRepository,
    private val memberRepository: MemberRepository,
    private val problemRepository: ProblemRepository,
    private val submissionRepository: SubmissionRepository,
    private val applicationEventPublisher: ApplicationEventPublisher,
) : CreateSubmissionUseCase {
    private val logger = LoggerFactory.getLogger(this::class.java)

    /**
     * Creates a new submission.
     *
     * @param contestId ID of the contest where the submission is being made
     * @param memberId ID of the member creating the submission
     * @param inputDTO Data for creating the submission
     * @return The created submission
     * @throws NotFoundException if the member, problem, or code attachment is not found
     * @throws ForbiddenException if the language is not allowed or the contest is not active
     */
    @Transactional
    override fun create(
        contestId: UUID,
        memberId: UUID,
        @Valid inputDTO: CreateSubmissionInputDTO,
    ): Submission {
        logger.info("Creating submission for member with id: $memberId and problem with id: ${inputDTO.problemId}")

        val contest =
            contestRepository.findEntityById(contestId)
                ?: throw NotFoundException("Could not find contest with id = $contestId")
        val member =
            memberRepository.findEntityById(memberId)
                ?: throw NotFoundException("Could not find member with id = $memberId")
        val problem =
            problemRepository.findByIdAndContestId(inputDTO.problemId, contestId)
                ?: throw NotFoundException("Could not find problem with id = ${inputDTO.problemId} in contest")
        val code =
            attachmentRepository.findByIdAndContestId(inputDTO.code.id, contestId)
                ?: throw NotFoundException("Could not find code attachment with id = ${inputDTO.code.id} in contest")

        if (!contest.isActive()) {
            throw ForbiddenException("Contest is not active")
        }
        if (code.context != Attachment.Context.SUBMISSION_CODE) {
            throw ForbiddenException("Attachment with id = ${inputDTO.code.id} is not a submission code")
        }
        // A contest has a set of allowed languages, so we need to check if the input language is allowed
        if (contest.languages.none { it == inputDTO.language }) {
            throw ForbiddenException("Language ${inputDTO.language} is not allowed for this contest")
        }

        val submission =
            Submission(
                member = member,
                problem = problem,
                language = inputDTO.language,
                status = Submission.Status.JUDGING,
                code = code,
            )
        submissionRepository.save(submission)
        applicationEventPublisher.publishEvent(SubmissionCreatedEvent(this, submission))

        logger.info("Submission created")
        return submission
    }
}
