package com.forsetijudge.core.application.service.attachment.auth

import com.forsetijudge.core.application.util.ContestAuthorizer
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
        // Admin can upload problem description attachments
    }

    override fun authorizeStaffUpload(
        contest: Contest,
        member: Member,
    ) = throw ForbiddenException("Staff cannot upload problem description attachments")

    override fun authorizeJudgeUpload(
        contest: Contest,
        member: Member,
    ) = throw ForbiddenException("Judges cannot upload problem description attachments")

    override fun authorizeContestantUpload(
        contest: Contest,
        member: Member,
    ) = throw ForbiddenException("Contestants cannot upload problem description attachments")

    override fun authorizePublicUpload(contest: Contest) =
        throw ForbiddenException("Guest users cannot upload problem description attachments")

    override fun authorizeAdminDownload(
        contest: Contest,
        member: Member,
        attachment: Attachment,
    ) {
        // Admin can download problem description attachments
    }

    override fun authorizeStaffDownload(
        contest: Contest,
        member: Member,
        attachment: Attachment,
    ) {
        // Staff can download problem description attachments
    }

    override fun authorizeJudgeDownload(
        contest: Contest,
        member: Member,
        attachment: Attachment,
    ) {
        // Judge can download problem description attachments
    }

    override fun authorizeContestantDownload(
        contest: Contest,
        member: Member,
        attachment: Attachment,
    ) {
        ContestAuthorizer(contest, member).checkContestStarted()
    }

    override fun authorizePublicDownload(
        contest: Contest,
        attachment: Attachment,
    ) {
        ContestAuthorizer(contest).checkContestStarted()
    }
}
