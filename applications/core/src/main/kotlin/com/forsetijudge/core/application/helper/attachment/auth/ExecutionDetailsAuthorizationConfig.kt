package com.forsetijudge.core.application.helper.attachment.auth

import com.forsetijudge.core.application.helper.ContestAuthorizer
import com.forsetijudge.core.domain.entity.Attachment
import com.forsetijudge.core.domain.entity.Contest
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.exception.ForbiddenException

class ExecutionDetailsAuthorizationConfig : AttachmentAuthorizationConfig() {
    // Upload authorizations

    override fun authorizeAdminUpload(
        contest: Contest,
        member: Member,
    ) = throw ForbiddenException("Admins cannot upload execution details attachments")

    override fun authorizeJudgeUpload(
        contest: Contest,
        member: Member,
    ) = throw ForbiddenException("Judges cannot upload execution details attachments")

    override fun authorizeContestantUpload(
        contest: Contest,
        member: Member,
    ) = throw ForbiddenException("Contestants cannot upload execution details attachments")

    // Download authorizations

    override fun authorizeAdminDownload(
        contest: Contest,
        member: Member,
        attachment: Attachment,
    ) {
        ContestAuthorizer(contest, member).requireMemberToBelong().throwIfErrors()
    }

    override fun authorizeJudgeDownload(
        contest: Contest,
        member: Member,
        attachment: Attachment,
    ) {
        ContestAuthorizer(contest, member).requireMemberToBelong().throwIfErrors()
    }

    override fun authorizeContestantDownload(
        contest: Contest,
        member: Member,
        attachment: Attachment,
    ) = throw ForbiddenException("Contestants cannot download execution details attachments")

    override fun authorizeGuestDownload(
        contest: Contest,
        attachment: Attachment,
    ) = throw ForbiddenException("Guest users cannot download execution details attachments")
}
