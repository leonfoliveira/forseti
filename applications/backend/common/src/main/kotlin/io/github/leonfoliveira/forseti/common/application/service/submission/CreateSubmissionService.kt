package io.github.leonfoliveira.forseti.common.application.service.submission

import io.github.leonfoliveira.forseti.common.application.domain.entity.Submission
import io.github.leonfoliveira.forseti.common.application.domain.event.SubmissionCreatedEvent
import io.github.leonfoliveira.forseti.common.application.domain.exception.ForbiddenException
import io.github.leonfoliveira.forseti.common.application.domain.exception.NotFoundException
import io.github.leonfoliveira.forseti.common.application.port.driven.repository.AttachmentRepository
import io.github.leonfoliveira.forseti.common.application.port.driven.repository.MemberRepository
import io.github.leonfoliveira.forseti.common.application.port.driven.repository.ProblemRepository
import io.github.leonfoliveira.forseti.common.application.port.driven.repository.SubmissionRepository
import io.github.leonfoliveira.forseti.common.application.service.dto.input.submission.CreateSubmissionInputDTO
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
    private val attachmentRepository: AttachmentRepository,
    private val memberRepository: MemberRepository,
    private val problemRepository: ProblemRepository,
    private val submissionRepository: SubmissionRepository,
    private val applicationEventPublisher: ApplicationEventPublisher,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    /**
     * Creates a new submission.
     *
     * @param memberId ID of the member creating the submission
     * @param inputDTO Data for creating the submission
     * @return The created submission
     * @throws NotFoundException if the member, problem, or code attachment is not found
     * @throws ForbiddenException if the language is not allowed or the contest is not active
     */
    @Transactional
    fun create(
        memberId: UUID,
        @Valid inputDTO: CreateSubmissionInputDTO,
    ): Submission {
        logger.info("Creating submission for member with id: $memberId and problem with id: ${inputDTO.problemId}")

        val member =
            memberRepository.findEntityById(memberId)
                ?: throw NotFoundException("Could not find member with id = $memberId")
        val problem =
            problemRepository.findEntityById(inputDTO.problemId)
                ?: throw NotFoundException("Could not find problem with id = ${inputDTO.problemId}")
        val code =
            attachmentRepository.findEntityById(inputDTO.code.id)
                ?: throw NotFoundException("Could not find code attachment with id = ${inputDTO.code.id}")
        val contest = problem.contest

        // A contest has a set of allowed languages, so we need to check if the input language is allowed
        if (contest.languages.none { it == inputDTO.language }) {
            throw ForbiddenException("Language ${inputDTO.language} is not allowed for this contest")
        }
        // Business rule: Submissions can only be created if the contest is active
        if (!contest.isActive()) {
            throw ForbiddenException("Contest is not active")
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
