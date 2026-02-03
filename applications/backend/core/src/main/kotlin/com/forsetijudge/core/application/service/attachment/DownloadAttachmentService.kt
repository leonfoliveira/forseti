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
import com.forsetijudge.core.port.driving.usecase.attachment.DownloadAttachmentUseCase
import com.forsetijudge.core.port.dto.output.AttachmentDownloadOutputDTO
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
class DownloadAttachmentService(
    private val attachmentRepository: AttachmentRepository,
    private val attachmentBucket: AttachmentBucket,
    private val contestRepository: ContestRepository,
    private val memberRepository: MemberRepository,
    configs: List<AttachmentAuthorizationConfig>,
) : DownloadAttachmentUseCase {
    private val logger = LoggerFactory.getLogger(this::class.java)
    private val configMap = configs.associateBy { it.getContext() }

    /**
     * Downloads an attachment from the storage bucket.
     *
     * @param contestId The ID of the contest where the attachment belongs.
     * @param memberId The ID of the member requesting the download.
     * @param id The ID of the attachment to be downloaded.
     * @return An AttachmentDownloadOutputDTO containing the attachment metadata and its byte content.
     * @throws NotFoundException if the attachment with the given ID does not exist.
     */
    @Transactional(readOnly = true)
    override fun download(
        contestId: UUID,
        memberId: UUID?,
        id: UUID,
    ): AttachmentDownloadOutputDTO {
        val contest =
            contestRepository.findEntityById(contestId)
                ?: throw NotFoundException("Could not find contest with id = $contestId")
        val member =
            memberId?.let {
                memberRepository.findEntityById(memberId)
                    ?: throw NotFoundException("Could not find member with id = $memberId")
            }
        val attachment =
            attachmentRepository.findEntityById(id)
                ?: throw NotFoundException("Could not find attachment with id = $id")

        val config =
            configMap[attachment.context]
                ?: throw ForbiddenException("Cannot download attachments with context ${attachment.context}")

        when (member?.type) {
            Member.Type.ROOT -> {
                // ROOT members can download anything
            }
            Member.Type.ADMIN -> config.authorizeAdminDownload(contest, member, attachment)
            Member.Type.JUDGE -> config.authorizeJudgeDownload(contest, member, attachment)
            Member.Type.CONTESTANT -> config.authorizeContestantDownload(contest, member, attachment)
            else -> config.authorizePublicDownload(contest, attachment)
        }

        return AttachmentDownloadOutputDTO(
            attachment = attachment,
            bytes = download(attachment),
        )
    }

    /**
     * Downloads an attachment from the storage bucket.
     *
     * @param attachment The Attachment entity to be downloaded.
     * @return An AttachmentDownloadOutputDTO containing the attachment metadata and its byte content.
     * @throws NotFoundException if the attachment does not exist.
     */
    @Transactional(readOnly = true)
    override fun download(attachment: Attachment): ByteArray {
        logger.info("Downloading attachment with id: ${attachment.id}")
        val attachment =
            attachmentRepository.findEntityById(attachment.id)
                ?: throw NotFoundException("Could not find attachment with id = ${attachment.id}")
        val bytes = attachmentBucket.download(attachment)

        logger.info("Finished downloading attachment")
        return bytes
    }
}
