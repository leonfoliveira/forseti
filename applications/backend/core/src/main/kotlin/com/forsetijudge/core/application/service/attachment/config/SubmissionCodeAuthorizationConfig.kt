package com.forsetijudge.core.application.service.attachment.config

import com.forsetijudge.core.application.service.attachment.AttachmentAuthorizationConfig
import com.forsetijudge.core.application.service.contest.AuthorizeContestService
import com.forsetijudge.core.domain.entity.Attachment
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.exception.ForbiddenException
import org.springframework.stereotype.Component
import java.util.UUID

@Component
class SubmissionCodeAuthorizationConfig(
    private val authorizeContestService: AuthorizeContestService,
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
        authorizeContestService.checkIfStarted(contestId)
        authorizeContestService.checkIfMemberBelongsToContest(contestId)
    }

    override fun authorizePublicUpload(contestId: UUID): Unit =
        throw ForbiddenException("Guest users cannot upload submission code attachments")

    override fun authorizeAdminDownload(
        contestId: UUID,
        member: Member,
        attachment: Attachment,
    ) {
        authorizeContestService.checkIfMemberBelongsToContest(contestId)
    }

    override fun authorizeJudgeDownload(
        contestId: UUID,
        member: Member,
        attachment: Attachment,
    ) {
        authorizeContestService.checkIfStarted(contestId)
        authorizeContestService.checkIfMemberBelongsToContest(contestId)
    }

    override fun authorizeContestantDownload(
        contestId: UUID,
        member: Member,
        attachment: Attachment,
    ) {
        authorizeContestService.checkIfStarted(contestId)
        authorizeContestService.checkIfMemberBelongsToContest(contestId)
        if (attachment.member?.id != member.id) {
            throw ForbiddenException("Contestants can only download their own submission code attachments")
        }
    }

    override fun authorizePublicDownload(
        contestId: UUID,
        attachment: Attachment,
    ) = throw ForbiddenException("Guest users cannot download submission code attachments")
}
