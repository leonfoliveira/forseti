package com.forsetijudge.core.application.service.attachment

import com.forsetijudge.core.application.helper.AuthenticationHelper
import com.forsetijudge.core.application.helper.attachment.auth.ProblemDescriptionAuthorizationConfig
import com.forsetijudge.core.application.helper.attachment.auth.ProblemTestCasesAuthorizationConfig
import com.forsetijudge.core.application.helper.attachment.auth.SubmissionCodeAuthorizationConfig
import com.forsetijudge.core.domain.entity.Attachment
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.dto.response.attachment.SignedDownloadAttachmentResponseDTO
import com.forsetijudge.core.port.dto.response.attachment.toDownloadSignedResponseBodyDTO
import com.forsetijudge.core.port.input.usecase.attachment.SignedDownloadAttachmentUseCase
import com.forsetijudge.core.port.output.bucket.AttachmentBucket
import com.forsetijudge.core.port.output.repository.AttachmentRepository
import com.forsetijudge.core.port.output.repository.MemberRepository
import com.forsetijudge.core.util.SafeLogger
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class SignedDownloadAttachmentService(
    private val memberRepository: MemberRepository,
    private val attachmentRepository: AttachmentRepository,
    private val attachmentBucket: AttachmentBucket,
) : SignedDownloadAttachmentUseCase {
    private val logger = SafeLogger(this::class)

    private val authorizationConfigsByContext =
        mapOf(
            Attachment.Context.PROBLEM_DESCRIPTION to ProblemDescriptionAuthorizationConfig(),
            Attachment.Context.PROBLEM_TEST_CASES to ProblemTestCasesAuthorizationConfig(),
            Attachment.Context.SUBMISSION_CODE to SubmissionCodeAuthorizationConfig(),
        )

    /**
     * Downloads an attachment by its ID and returns the download metadata.
     *
     * @param command The command containing the ID of the attachment to be downloaded.
     * @return A pair containing the attachment metadata and the byte array of the attachment content.
     */
    @Transactional(readOnly = true)
    override fun execute(command: SignedDownloadAttachmentUseCase.Command): SignedDownloadAttachmentResponseDTO {
        val contextMemberId = AuthenticationHelper.getCurrentMemberIdNullable()

        logger.info("Downloading attachment with id: ${command.attachmentId}")

        val member =
            contextMemberId?.let {
                memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, command.contestId)
                    ?: throw NotFoundException("Could not find member with id = $contextMemberId in this contest")
            }
        val attachment =
            attachmentRepository.findByIdAndContestId(command.attachmentId, command.contestId)
                ?: throw NotFoundException("Could not find attachment with id = ${command.attachmentId} in this contest")

        authorizationConfigsByContext[attachment.context]
            ?.authorizeDownload(attachment.contest, member, attachment)
            ?: throw ForbiddenException("Cannot download attachment with context ${attachment.context}")

        val downloadUrl = attachmentBucket.getDownloadUrl(attachment)

        logger.info("Attachment downloaded successfully")
        return attachment.toDownloadSignedResponseBodyDTO(downloadUrl)
    }
}
