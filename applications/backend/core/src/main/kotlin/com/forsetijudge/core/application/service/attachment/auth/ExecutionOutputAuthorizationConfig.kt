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
    ): Unit = throw ForbiddenException("Admin cannot upload execution outputs")

    override fun authorizeJudgeUpload(
        contest: Contest,
        member: Member,
    ): Unit = throw ForbiddenException("Judge cannot upload execution outputs")

    override fun authorizeContestantUpload(
        contest: Contest,
        member: Member,
    ): Unit = throw ForbiddenException("Contestant cannot upload execution outputs")

    override fun authorizePublicUpload(contest: Contest): Unit = throw ForbiddenException("Public cannot upload execution outputs")

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
    ): Unit = throw ForbiddenException("Contestant cannot download execution outputs")

    override fun authorizePublicDownload(
        contest: Contest,
        attachment: Attachment,
    ): Unit = throw ForbiddenException("Public cannot download execution outputs")
}
