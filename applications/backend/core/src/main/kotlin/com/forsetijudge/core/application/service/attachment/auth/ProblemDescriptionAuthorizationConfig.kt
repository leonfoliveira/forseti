package com.forsetijudge.core.application.service.attachment.auth

import com.forsetijudge.core.domain.entity.Attachment
import com.forsetijudge.core.domain.entity.Contest
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.exception.ForbiddenException
import org.springframework.stereotype.Component

@Component
class ProblemDescriptionAuthorizationConfig : AttachmentAuthorizationConfig {
    override fun getContext(): Attachment.Context = Attachment.Context.PROBLEM_DESCRIPTION

    override fun authorizeAdminUpload(
        contest: Contest,
        member: Member,
    ) {
    }

    override fun authorizeJudgeUpload(
        contest: Contest,
        member: Member,
    ) = throw ForbiddenException("Judges cannot upload problem description attachments")

    override fun authorizeContestantUpload(
        contest: Contest,
        member: Member,
    ) = throw ForbiddenException("Contestants cannot upload problem description attachments")

    override fun authorizePublicUpload(contest: Contest): Unit =
        throw ForbiddenException("Guest users cannot upload problem description attachments")

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
        if (!contest.hasStarted()) {
            throw ForbiddenException("Contestants cannot download problem description attachments before the contest starts")
        }
    }

    override fun authorizePublicDownload(
        contest: Contest,
        attachment: Attachment,
    ) {
        if (!contest.hasStarted()) {
            throw ForbiddenException("Guests cannot download problem description attachments before the contest starts")
        }
    }
}
