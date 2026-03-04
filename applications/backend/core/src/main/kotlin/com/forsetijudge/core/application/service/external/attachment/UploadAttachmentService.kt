package com.forsetijudge.core.application.service.external.attachment

import com.forsetijudge.core.application.service.external.attachment.auth.ExecutionOutputAuthorizationConfig
import com.forsetijudge.core.application.service.external.attachment.auth.ProblemDescriptionAuthorizationConfig
import com.forsetijudge.core.application.service.external.attachment.auth.ProblemTestCasesAuthorizationConfig
import com.forsetijudge.core.application.service.external.attachment.auth.SubmissionCodeAuthorizationConfig
import com.forsetijudge.core.application.util.ContestAuthorizer
import com.forsetijudge.core.application.util.IdGenerator
import com.forsetijudge.core.application.util.SafeLogger
import com.forsetijudge.core.domain.entity.Attachment
import com.forsetijudge.core.domain.event.AttachmentsEvent
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.domain.model.ExecutionContext
import com.forsetijudge.core.port.driven.bucket.AttachmentBucket
import com.forsetijudge.core.port.driven.file.FileAnalyser
import com.forsetijudge.core.port.driven.repository.AttachmentRepository
import com.forsetijudge.core.port.driven.repository.ContestRepository
import com.forsetijudge.core.port.driven.repository.MemberRepository
import com.forsetijudge.core.port.driving.usecase.external.attachment.UploadAttachmentUseCase
import com.forsetijudge.core.port.dto.response.attachment.AttachmentResponseDTO
import com.forsetijudge.core.port.dto.response.attachment.toResponseBodyDTO
import org.springframework.context.ApplicationEventPublisher
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class UploadAttachmentService(
    private val attachmentRepository: AttachmentRepository,
    private val contestRepository: ContestRepository,
    private val memberRepository: MemberRepository,
    private val fileAnalyser: FileAnalyser,
    private val attachmentBucket: AttachmentBucket,
    private val applicationEventPublisher: ApplicationEventPublisher,
) : UploadAttachmentUseCase {
    private val logger = SafeLogger(this::class)

    private val authorizationConfigsByContext =
        mapOf(
            Attachment.Context.EXECUTION_OUTPUT to ExecutionOutputAuthorizationConfig(),
            Attachment.Context.PROBLEM_DESCRIPTION to ProblemDescriptionAuthorizationConfig(),
            Attachment.Context.PROBLEM_TEST_CASES to ProblemTestCasesAuthorizationConfig(),
            Attachment.Context.SUBMISSION_CODE to SubmissionCodeAuthorizationConfig(),
        )

    @Transactional
    override fun execute(command: UploadAttachmentUseCase.Command): Pair<AttachmentResponseDTO, ByteArray> {
        val contextContestId = ExecutionContext.getContestId()
        val contextMemberId = ExecutionContext.getMemberId()

        logger.info("Uploading attachment")

        val contest =
            contestRepository.findById(contextContestId)
                ?: throw NotFoundException("Could not find contest with id = $contextContestId")
        val member =
            memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId)
                ?: throw NotFoundException("Could not find member with id = $contextMemberId in this contest")

        ContestAuthorizer(contest, member)
            .requireContestNotEnded()
            .throwIfErrors()

        authorizationConfigsByContext[command.context]
            ?.authorizeUpload(contest, member)
            ?: throw ForbiddenException("Cannot upload attachment with context ${command.context}")

        val contentType = fileAnalyser.getMimeType(command.bytes)

        when (command.context) {
            Attachment.Context.PROBLEM_DESCRIPTION -> {
                if (contentType != "application/pdf") {
                    throw ForbiddenException("Only PDF files are allowed for context ${command.context}")
                }
            }
            Attachment.Context.PROBLEM_TEST_CASES -> {
                if (contentType != "text/csv") {
                    throw ForbiddenException("Only csv files are allowed for context ${command.context}")
                }
            }
            else -> {}
        }

        val id = IdGenerator.getUUID()
        val attachment =
            Attachment(
                id = id,
                contest = contest,
                member = member,
                filename = command.filename ?: id.toString(),
                contentType = contentType,
                context = command.context,
            )
        logger.info("Uploading ${command.bytes.size} bytes")
        attachmentRepository.save(attachment)
        attachmentBucket.upload(attachment, command.bytes)
        applicationEventPublisher.publishEvent(AttachmentsEvent.Uploaded(attachment.id))

        logger.info("Attachment uploaded successfully with id = ${attachment.id}")
        return attachment.toResponseBodyDTO() to command.bytes
    }
}
