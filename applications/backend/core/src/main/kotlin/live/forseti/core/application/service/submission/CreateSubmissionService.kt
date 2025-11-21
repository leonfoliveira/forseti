package live.forseti.core.application.service.submission

import jakarta.validation.Valid
import live.forseti.core.domain.entity.Attachment
import live.forseti.core.domain.entity.Submission
import live.forseti.core.domain.event.SubmissionCreatedEvent
import live.forseti.core.domain.exception.ForbiddenException
import live.forseti.core.domain.exception.NotFoundException
import live.forseti.core.port.driven.repository.AttachmentRepository
import live.forseti.core.port.driven.repository.MemberRepository
import live.forseti.core.port.driven.repository.ProblemRepository
import live.forseti.core.port.driven.repository.SubmissionRepository
import live.forseti.core.port.driving.usecase.submission.CreateSubmissionUseCase
import live.forseti.core.port.dto.input.submission.CreateSubmissionInputDTO
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
) : CreateSubmissionUseCase {
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
    override fun create(
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
        if (code.context != Attachment.Context.SUBMISSION_CODE) {
            throw ForbiddenException("Attachment with id = ${inputDTO.code.id} is not a submission code")
        }
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
