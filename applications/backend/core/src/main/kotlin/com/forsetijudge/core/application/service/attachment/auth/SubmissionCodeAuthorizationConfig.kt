package com.forsetijudge.core.application.service.attachment.auth

import com.forsetijudge.core.domain.entity.Attachment
import com.forsetijudge.core.domain.entity.Contest
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.exception.ForbiddenException
import org.springframework.stereotype.Component

@Component
class SubmissionCodeAuthorizationConfig : AttachmentAuthorizationConfig {
    override fun getContext(): Attachment.Context = Attachment.Context.SUBMISSION_CODE

    override fun authorizeAdminUpload(
        contest: Contest,
        member: Member,
    ) = throw ForbiddenException("Admins cannot upload submission code attachments")

    override fun authorizeJudgeUpload(
        contest: Contest,
        member: Member,
    ) = throw ForbiddenException("Judges cannot upload submission code attachments")

    override fun authorizeContestantUpload(
        contest: Contest,
        member: Member,
    ) {
        if (!contest.hasStarted()) {
            throw ForbiddenException("Contestants cannot upload submission code attachments before the contest starts")
        }
    }

    override fun authorizePublicUpload(contest: Contest): Unit =
        throw ForbiddenException("Guest users cannot upload submission code attachments")

    override fun authorizeAdminDownload(
        contest: Contest,
        member: Member,
        attachment: Attachment,
    ) {
    }

    override fun authorizeJudgeDownload(
        contest: Contest,
        member: Member,
        attachment: Attachment,
    ) {
    }

    override fun authorizeContestantDownload(
        contest: Contest,
        member: Member,
        attachment: Attachment,
    ) {
        if (attachment.member?.id != member.id) {
            throw ForbiddenException("Contestants can only download their own submission code attachments")
        }
    }

    override fun authorizePublicDownload(
        contest: Contest,
        attachment: Attachment,
    ) = throw ForbiddenException("Guest users cannot download submission code attachments")
}
