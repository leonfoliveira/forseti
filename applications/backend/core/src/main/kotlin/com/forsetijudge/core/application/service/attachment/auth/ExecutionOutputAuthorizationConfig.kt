package com.forsetijudge.core.application.service.attachment.auth

import com.forsetijudge.core.domain.entity.Attachment
import com.forsetijudge.core.domain.entity.Contest
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.exception.ForbiddenException
import org.springframework.stereotype.Component

@Component
class ExecutionOutputAuthorizationConfig : AttachmentAuthorizationConfig {
    override fun getContext(): Attachment.Context = Attachment.Context.EXECUTION_OUTPUT

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

    override fun authorizePublicUpload(contest: Contest): Unit = throw ForbiddenException("Public cannot upload execution outputs")

    override fun authorizeAdminDownload(
        contest: Contest,
        member: Member,
        attachment: Attachment,
    ) {
        // Admin can download execution outputs
    }

    override fun authorizeStaffDownload(
        contest: Contest,
        member: Member,
        attachment: Attachment,
    ) = throw ForbiddenException("Staff cannot download execution outputs")

    override fun authorizeJudgeDownload(
        contest: Contest,
        member: Member,
        attachment: Attachment,
    ) {
        // Judge can download execution outputs
    }

    override fun authorizeContestantDownload(
        contest: Contest,
        member: Member,
        attachment: Attachment,
    ) = throw ForbiddenException("Contestant cannot download execution outputs")

    override fun authorizePublicDownload(
        contest: Contest,
        attachment: Attachment,
    ) = throw ForbiddenException("Public cannot download execution outputs")
}
