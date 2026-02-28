package com.forsetijudge.core.application.service.external.attachment.auth

import com.forsetijudge.core.application.util.ContestAuthorizer
import com.forsetijudge.core.domain.entity.Attachment
import com.forsetijudge.core.domain.entity.Contest
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.exception.ForbiddenException

class ProblemDescriptionAuthorizationConfig : AttachmentAuthorizationConfig() {
    // Upload authorizations

    override fun authorizeAdminUpload(
        contest: Contest,
        member: Member,
    ) {}

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

    // Download authorizations

    override fun authorizeAdminDownload(
        contest: Contest,
        member: Member,
        attachment: Attachment,
    ) {}

    override fun authorizeStaffDownload(
        contest: Contest,
        member: Member,
        attachment: Attachment,
    ) {}

    override fun authorizeJudgeDownload(
        contest: Contest,
        member: Member,
        attachment: Attachment,
    ) {}

    override fun authorizeContestantDownload(
        contest: Contest,
        member: Member,
        attachment: Attachment,
    ) {
        ContestAuthorizer(contest)
            .requireContestStarted()
            .throwIfErrors()
    }

    override fun authorizeGuestDownload(
        contest: Contest,
        attachment: Attachment,
    ) {
        ContestAuthorizer(contest)
            .requireContestStarted()
            .throwIfErrors()
    }
}
