package io.github.leonfoliveira.forseti.api.service.attachment.config

import io.github.leonfoliveira.forseti.api.service.attachment.AttachmentAuthorizationConfig
import io.github.leonfoliveira.forseti.api.util.ContestAuthFilter
import io.github.leonfoliveira.forseti.common.domain.entity.Attachment
import io.github.leonfoliveira.forseti.common.domain.entity.Member
import io.github.leonfoliveira.forseti.common.domain.exception.ForbiddenException
import org.springframework.stereotype.Component
import java.util.UUID

@Component
class SubmissionCodeAuthorizationConfig(
    private val contestAuthFilter: ContestAuthFilter,
) : AttachmentAuthorizationConfig {
    override fun getContext(): Attachment.Context = Attachment.Context.SUBMISSION_CODE

    override fun authorizeAdminUpload(
        contestId: UUID,
        member: Member,
    ) = throw ForbiddenException("Admins cannot upload submission code attachments")

    override fun authorizeJudgeUpload(
        contestId: UUID,
        member: Member,
    ) = throw ForbiddenException("Judges cannot upload submission code attachments")

    override fun authorizeContestantUpload(
        contestId: UUID,
        member: Member,
    ) {
        contestAuthFilter.checkIfStarted(contestId)
        contestAuthFilter.checkIfMemberBelongsToContest(contestId)
    }

    override fun authorizePublicUpload(contestId: UUID): Unit =
        throw ForbiddenException("Guest users cannot upload submission code attachments")

    override fun authorizeAdminDownload(
        contestId: UUID,
        member: Member,
        attachment: Attachment,
    ) {
        contestAuthFilter.checkIfMemberBelongsToContest(contestId)
    }

    override fun authorizeJudgeDownload(
        contestId: UUID,
        member: Member,
        attachment: Attachment,
    ) {
        contestAuthFilter.checkIfStarted(contestId)
        contestAuthFilter.checkIfMemberBelongsToContest(contestId)
    }

    override fun authorizeContestantDownload(
        contestId: UUID,
        member: Member,
        attachment: Attachment,
    ) {
        contestAuthFilter.checkIfStarted(contestId)
        contestAuthFilter.checkIfMemberBelongsToContest(contestId)
        if (attachment.member?.id != member.id) {
            throw ForbiddenException("Contestants can only download their own submission code attachments")
        }
    }

    override fun authorizePublicDownload(
        contestId: UUID,
        attachment: Attachment,
    ) = throw ForbiddenException("Guest users cannot download submission code attachments")
}
