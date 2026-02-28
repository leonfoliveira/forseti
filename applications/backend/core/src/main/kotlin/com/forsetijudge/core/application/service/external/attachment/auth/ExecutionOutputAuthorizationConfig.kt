package com.forsetijudge.core.application.service.external.attachment.auth

import com.forsetijudge.core.domain.entity.Attachment
import com.forsetijudge.core.domain.entity.Contest
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.exception.ForbiddenException

class ExecutionOutputAuthorizationConfig : AttachmentAuthorizationConfig() {
    // Upload authorizations

    override fun authorizeAdminUpload(
        contest: Contest,
        member: Member,
    ) = throw ForbiddenException("Admin cannot upload execution outputs")

    override fun authorizeStaffUpload(
        contest: Contest,
        member: Member,
    ) = throw ForbiddenException("Staff cannot upload execution outputs")

    override fun authorizeJudgeUpload(
        contest: Contest,
        member: Member,
    ) = throw ForbiddenException("Judge cannot upload execution outputs")

    override fun authorizeContestantUpload(
        contest: Contest,
        member: Member,
    ) = throw ForbiddenException("Contestant cannot upload execution outputs")

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
    ) = throw ForbiddenException("Staff cannot download execution outputs")

    override fun authorizeJudgeDownload(
        contest: Contest,
        member: Member,
        attachment: Attachment,
    ) {}

    override fun authorizeContestantDownload(
        contest: Contest,
        member: Member,
        attachment: Attachment,
    ) = throw ForbiddenException("Contestant cannot download execution outputs")

    override fun authorizeGuestDownload(
        contest: Contest,
        attachment: Attachment,
    ) = throw ForbiddenException("Guest cannot download execution outputs")
}
