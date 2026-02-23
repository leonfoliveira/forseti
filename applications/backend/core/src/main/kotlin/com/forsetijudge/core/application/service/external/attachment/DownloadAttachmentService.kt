package com.forsetijudge.core.application.service.external.attachment

import com.forsetijudge.core.application.service.external.attachment.auth.ExecutionOutputAuthorizationConfig
import com.forsetijudge.core.application.service.external.attachment.auth.ProblemDescriptionAuthorizationConfig
import com.forsetijudge.core.application.service.external.attachment.auth.ProblemTestCasesAuthorizationConfig
import com.forsetijudge.core.application.service.external.attachment.auth.SubmissionCodeAuthorizationConfig
import com.forsetijudge.core.domain.entity.Attachment
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.domain.model.ExecutionContext
import com.forsetijudge.core.port.driven.AttachmentBucket
import com.forsetijudge.core.port.driven.repository.AttachmentRepository
import com.forsetijudge.core.port.driven.repository.MemberRepository
import com.forsetijudge.core.port.driving.usecase.external.attachment.DownloadAttachmentUseCase
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class DownloadAttachmentService(
    private val memberRepository: MemberRepository,
    private val attachmentRepository: AttachmentRepository,
    private val attachmentBucket: AttachmentBucket,
) : DownloadAttachmentUseCase {
    private val logger = LoggerFactory.getLogger(this::class.java)

    private val authorizationConfigsByContext =
        mapOf(
            Attachment.Context.EXECUTION_OUTPUT to ExecutionOutputAuthorizationConfig(),
            Attachment.Context.PROBLEM_DESCRIPTION to ProblemDescriptionAuthorizationConfig(),
            Attachment.Context.PROBLEM_TEST_CASES to ProblemTestCasesAuthorizationConfig(),
            Attachment.Context.SUBMISSION_CODE to SubmissionCodeAuthorizationConfig(),
        )

    @Transactional(readOnly = true)
    override fun execute(command: DownloadAttachmentUseCase.Command): Pair<Attachment, ByteArray> {
        val contextContestId = ExecutionContext.getContestId()
        val contextMemberId = ExecutionContext.getMemberIdNullable()

        logger.info("Downloading attachment with id: {}", command.attachmentId)

        val member =
            contextMemberId?.let {
                memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId)
                    ?: throw NotFoundException("Could not find member with id = $contextMemberId in this contest")
            }
        val attachment =
            attachmentRepository.findByIdAndContestId(command.attachmentId, contextContestId)
                ?: throw NotFoundException("Could not find attachment with id = ${command.attachmentId} in this contest")

        authorizationConfigsByContext[attachment.context]
            ?.authorizeDownload(attachment.contest, member, attachment)
            ?: throw ForbiddenException("Cannot download attachment with context ${attachment.context}")

        val bytes = attachmentBucket.download(attachment)

        logger.info("Attachment downloaded successfully")
        return attachment to bytes
    }
}
