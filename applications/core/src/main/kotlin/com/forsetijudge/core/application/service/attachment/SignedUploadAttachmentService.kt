package com.forsetijudge.core.application.service.attachment

import com.forsetijudge.core.application.helper.AuthenticationHelper
import com.forsetijudge.core.application.helper.ContestAuthorizer
import com.forsetijudge.core.application.helper.attachment.auth.ProblemDescriptionAuthorizationConfig
import com.forsetijudge.core.application.helper.attachment.auth.ProblemTestCasesAuthorizationConfig
import com.forsetijudge.core.application.helper.attachment.auth.SubmissionCodeAuthorizationConfig
import com.forsetijudge.core.domain.entity.Attachment
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.dto.response.attachment.SignedUploadAttachmentResponseDTO
import com.forsetijudge.core.port.dto.response.attachment.toUploadSignedResponseBodyDTO
import com.forsetijudge.core.port.input.usecase.attachment.SignedUploadAttachmentUseCase
import com.forsetijudge.core.port.output.bucket.AttachmentBucket
import com.forsetijudge.core.port.output.repository.AttachmentRepository
import com.forsetijudge.core.port.output.repository.ContestRepository
import com.forsetijudge.core.port.output.repository.MemberRepository
import com.forsetijudge.core.util.IdGenerator
import com.forsetijudge.core.util.SafeLogger
import jakarta.validation.Valid
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.validation.annotation.Validated

@Service
@Validated
class SignedUploadAttachmentService(
    private val attachmentRepository: AttachmentRepository,
    private val contestRepository: ContestRepository,
    private val memberRepository: MemberRepository,
    private val attachmentBucket: AttachmentBucket,
) : SignedUploadAttachmentUseCase {
    private val logger = SafeLogger(this::class)

    private val authorizationConfigsByContext =
        mapOf(
            Attachment.Context.PROBLEM_DESCRIPTION to ProblemDescriptionAuthorizationConfig(),
            Attachment.Context.PROBLEM_TEST_CASES to ProblemTestCasesAuthorizationConfig(),
            Attachment.Context.SUBMISSION_CODE to SubmissionCodeAuthorizationConfig(),
        )

    /**
     * Uploads an attachment to a contest.
     *
     * @param command The command containing the details of the attachment to be uploaded.
     * @return The uploaded attachment entity, including its ID and metadata.
     */
    @Transactional
    override fun execute(
        @Valid command: SignedUploadAttachmentUseCase.Command,
    ): SignedUploadAttachmentResponseDTO {
        val contextMemberId = AuthenticationHelper.getCurrentMemberId()

        logger.info("Uploading attachment")

        val contest =
            contestRepository.findById(command.contestId)
                ?: throw NotFoundException("Could not find contest with id = ${command.contestId}")
        val member =
            memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, command.contestId)
                ?: throw NotFoundException("Could not find member with id = $contextMemberId in this contest")

        ContestAuthorizer(contest, member)
            .requireMemberToBelong()
            .requireContestNotEnded()
            .throwIfErrors()

        authorizationConfigsByContext[command.context]
            ?.authorizeUpload(contest, member)
            ?: throw ForbiddenException("Cannot upload attachment with context ${command.context}")

        val id = IdGenerator.getUUID()
        val attachment =
            Attachment(
                id = id,
                contest = contest,
                member = member,
                filename = command.filename ?: id.toString(),
                contentType = command.contentType,
                context = command.context,
            )
        attachmentRepository.save(attachment)
        val uploadUrl = attachmentBucket.getUploadUrl(attachment)

        logger.info("Attachment uploaded successfully with id = ${attachment.id}")
        return attachment.toUploadSignedResponseBodyDTO(uploadUrl)
    }
}
