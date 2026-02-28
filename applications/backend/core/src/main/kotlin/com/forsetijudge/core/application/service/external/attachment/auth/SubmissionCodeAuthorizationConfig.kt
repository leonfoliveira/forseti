package com.forsetijudge.core.application.service.external.attachment.auth

import com.forsetijudge.core.application.util.ContestAuthorizer
import com.forsetijudge.core.domain.entity.Attachment
import com.forsetijudge.core.domain.entity.Contest
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.exception.ForbiddenException

class SubmissionCodeAuthorizationConfig : AttachmentAuthorizationConfig() {
    // Upload authorizations

    override fun authorizeAdminUpload(
        contest: Contest,
        member: Member,
    ) = throw ForbiddenException("Admins cannot upload submission code attachments")

    override fun authorizeStaffUpload(
        contest: Contest,
        member: Member,
    ) = throw ForbiddenException("Staff cannot upload submission code attachments")

    override fun authorizeJudgeUpload(
        contest: Contest,
        member: Member,
    ) = throw ForbiddenException("Judges cannot upload submission code attachments")

    override fun authorizeContestantUpload(
        contest: Contest,
        member: Member,
    ) {
        ContestAuthorizer(contest, member)
            .requireContestActive()
    }

    // Download authorizations

    override fun authorizeAdminDownload(
        contest: Contest,
        member: Member,
        attachment: Attachment,
    ) {}

    override fun authorizeJudgeDownload(
        contest: Contest,
        member: Member,
        attachment: Attachment,
    ) {}

    override fun authorizeStaffDownload(
        contest: Contest,
        member: Member,
        attachment: Attachment,
    ) = throw ForbiddenException("Staff cannot download submission code attachments")

    override fun authorizeContestantDownload(
        contest: Contest,
        member: Member,
        attachment: Attachment,
    ) {
        ContestAuthorizer(contest, member)
            .requireContestStarted()
            .throwIfErrors()
        if (attachment.member.id != member.id) {
            throw ForbiddenException("Contestants can only download their own submission code attachments")
        }
    }

    override fun authorizeGuestDownload(
        contest: Contest,
        attachment: Attachment,
    ) = throw ForbiddenException("Guest users cannot download submission code attachments")
}
