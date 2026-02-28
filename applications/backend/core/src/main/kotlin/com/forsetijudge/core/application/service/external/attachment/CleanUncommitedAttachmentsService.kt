package com.forsetijudge.core.application.service.external.attachment

import com.forsetijudge.core.application.util.ContestAuthorizer
import com.forsetijudge.core.application.util.SafeLogger
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.domain.model.ExecutionContext
import com.forsetijudge.core.port.driven.bucket.AttachmentBucket
import com.forsetijudge.core.port.driven.repository.AttachmentRepository
import com.forsetijudge.core.port.driven.repository.MemberRepository
import com.forsetijudge.core.port.driving.usecase.external.attachment.CleanUncommitedAttachmentsUseCase
import org.springframework.stereotype.Service

@Service
class CleanUncommitedAttachmentsService(
    private val memberRepository: MemberRepository,
    private val attachmentRepository: AttachmentRepository,
    private val attachmentBucket: AttachmentBucket,
) : CleanUncommitedAttachmentsUseCase {
    private val logger = SafeLogger(this::class)

    companion object {
        const val OFFSET_SECONDS = 1L * 60 * 60
    }

    override fun execute() {
        val contextMemberId = ExecutionContext.getMemberId()

        logger.info("Starting attachment cleanup")

        val member =
            memberRepository.findById(contextMemberId)
                ?: throw NotFoundException("Could not find member with id: $contextMemberId")

        ContestAuthorizer(null, member)
            .requireMemberType(Member.Type.API)
            .throwIfErrors()

        val attachmentsToClean =
            attachmentRepository.findAllByIsCommitedFalseAndCreatedAtLessThan(
                ExecutionContext.get().startedAt.minusSeconds(OFFSET_SECONDS),
            )

        attachmentsToClean.forEach { it.deletedAt = ExecutionContext.get().startedAt }
        attachmentBucket.deleteAll(attachmentsToClean)
        attachmentRepository.saveAll(attachmentsToClean)

        logger.info("Finished cleaning up ${attachmentsToClean.size} attachments")
    }
}
