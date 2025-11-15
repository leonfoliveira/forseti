package io.github.leonfoliveira.forseti.api.application.service.attachment

import io.github.leonfoliveira.forseti.api.application.port.driving.AttachmentAuthorizationUseCase
import io.github.leonfoliveira.forseti.common.application.domain.entity.Attachment
import io.github.leonfoliveira.forseti.common.application.domain.entity.Member
import io.github.leonfoliveira.forseti.common.application.domain.exception.ForbiddenException
import io.github.leonfoliveira.forseti.common.application.domain.exception.NotFoundException
import io.github.leonfoliveira.forseti.common.application.domain.model.RequestContext
import io.github.leonfoliveira.forseti.common.application.port.driven.repository.AttachmentRepository
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class AttachmentAuthorizationService(
    private val attachmentRepository: AttachmentRepository,
    configs: List<AttachmentAuthorizationConfig>,
) : AttachmentAuthorizationUseCase {
    private val configMap = configs.associateBy { it.getContext() }

    /**
     * Authorizes the upload of an attachment in a contest with a given context.
     *
     * @param contestId The ID of the contest.
     * @param context The context of the attachment to be uploaded.
     * @throws ForbiddenException if the upload is not authorized.
     */
    override fun authorizeUpload(
        contestId: UUID,
        context: Attachment.Context,
    ) {
        val member = RequestContext.getContext().session?.member
        // ROOT members can upload anything
        if (member?.type == Member.Type.ROOT) {
            return
        }

        val config =
            configMap[context]
                ?: throw ForbiddenException("Cannot upload attachments with context $context")

        when (member?.type) {
            Member.Type.ADMIN -> config.authorizeAdminUpload(contestId, member)
            Member.Type.JUDGE -> config.authorizeJudgeUpload(contestId, member)
            Member.Type.CONTESTANT -> config.authorizeContestantUpload(contestId, member)
            else -> config.authorizePublicUpload(contestId)
        }
    }

    /**
     * Authorizes the download of an attachment in a contest.
     *
     * @param contestId The ID of the contest.
     * @param attachmentId The ID of the attachment to be downloaded.
     * @throws ForbiddenException if the download is not authorized.
     */
    override fun authorizeDownload(
        contestId: UUID,
        attachmentId: UUID,
    ) {
        val attachment =
            attachmentRepository.findEntityById(attachmentId)
                ?: throw NotFoundException("Could not find attachment with id = $attachmentId")

        if (attachment.contest.id != contestId) {
            throw ForbiddenException("This attachment does not belong to this contest")
        }

        val member = RequestContext.getContext().session?.member
        // ROOT members can download anything
        if (member?.type == Member.Type.ROOT) {
            return
        }

        val config =
            configMap[attachment.context]
                ?: throw ForbiddenException("Cannot download attachments with context ${attachment.context}")

        when (member?.type) {
            Member.Type.ADMIN -> config.authorizeAdminDownload(contestId, member, attachment)
            Member.Type.JUDGE -> config.authorizeJudgeDownload(contestId, member, attachment)
            Member.Type.CONTESTANT -> config.authorizeContestantDownload(contestId, member, attachment)
            else -> config.authorizePublicDownload(contestId, attachment)
        }
    }
}
