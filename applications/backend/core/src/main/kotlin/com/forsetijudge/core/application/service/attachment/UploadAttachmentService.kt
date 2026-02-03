package com.forsetijudge.core.application.service.attachment

import com.forsetijudge.core.application.service.attachment.auth.AttachmentAuthorizationConfig
import com.forsetijudge.core.domain.entity.Attachment
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.driven.AttachmentBucket
import com.forsetijudge.core.port.driven.repository.AttachmentRepository
import com.forsetijudge.core.port.driven.repository.ContestRepository
import com.forsetijudge.core.port.driven.repository.MemberRepository
import com.forsetijudge.core.port.driving.usecase.attachment.UploadAttachmentUseCase
import com.github.f4b6a3.uuid.UuidCreator
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
class UploadAttachmentService(
    private val contestRepository: ContestRepository,
    private val memberRepository: MemberRepository,
    private val attachmentRepository: AttachmentRepository,
    private val attachmentBucket: AttachmentBucket,
    configs: List<AttachmentAuthorizationConfig>,
) : UploadAttachmentUseCase {
    private val logger = LoggerFactory.getLogger(this::class.java)
    private val configMap = configs.associateBy { it.getContext() }

    /**
     * Uploads an attachment to the storage bucket and saves its metadata in the repository.
     *
     * @param contestId The ID of the contest to which the attachment belongs.
     * @param memberId The ID of the member uploading the attachment. It can be null for service operations.
     * @param filename The original filename of the attachment. If null, the attachment generated ID will be used.
     * @param contentType The MIME type of the attachment. If null, "application/octet-stream" will be used.
     * @param context The context in which the attachment is used. It is used for authorization purposes.
     * @param bytes The byte array representing the content of the attachment.
     * @return The saved Attachment entity.
     * @throws NotFoundException if the contest or member (if provided) does not exist.
     */
    @Transactional
    override fun upload(
        contestId: UUID,
        memberId: UUID?,
        filename: String?,
        contentType: String?,
        context: Attachment.Context,
        bytes: ByteArray,
    ): Attachment {
        val contest =
            contestRepository.findEntityById(contestId)
                ?: throw NotFoundException("Could not find contest with id = $contestId")
        val member =
            memberId?.let {
                memberRepository.findEntityById(memberId)
                    ?: throw NotFoundException("Could not find member with id = $memberId")
            }

        val config =
            configMap[context]
                ?: throw ForbiddenException("Cannot upload attachments with context $context")

        when (member?.type) {
            Member.Type.ROOT -> {
                // ROOT members can upload anything
            }
            Member.Type.AUTOJUDGE -> {
                // AUTOJUDGE system members can upload anything
            }
            Member.Type.ADMIN -> config.authorizeAdminUpload(contest, member)
            Member.Type.JUDGE -> config.authorizeJudgeUpload(contest, member)
            Member.Type.CONTESTANT -> config.authorizeContestantUpload(contest, member)
            else -> config.authorizePublicUpload(contest)
        }

        val id = UuidCreator.getTimeOrderedEpoch()
        val attachment =
            Attachment(
                id = id,
                contest = contest,
                member = member,
                filename = filename ?: id.toString(),
                contentType = contentType ?: "application/octet-stream",
                context = context,
            )
        logger.info("Uploading ${bytes.size} bytes to attachment with id: ${attachment.id}")
        attachmentRepository.save(attachment)
        attachmentBucket.upload(attachment, bytes)

        logger.info("Finished uploading attachment")
        return attachment
    }
}
