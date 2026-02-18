package com.forsetijudge.core.application.service.attachment.auth

import com.forsetijudge.core.domain.entity.Attachment
import com.forsetijudge.core.domain.entity.Contest
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.exception.ForbiddenException
import org.springframework.stereotype.Component

@Component
class ProblemTestCasesAuthorizationConfig : AttachmentAuthorizationConfig {
    override fun getContext(): Attachment.Context = Attachment.Context.PROBLEM_TEST_CASES

    override fun authorizeAdminUpload(
        contest: Contest,
        member: Member,
    ) {
        // Admin can upload test cases description attachments
    }

    override fun authorizeStaffUpload(
        contest: Contest,
        member: Member,
    ) = throw ForbiddenException("Staff cannot upload test cases description attachments")

    override fun authorizeJudgeUpload(
        contest: Contest,
        member: Member,
    ) = throw ForbiddenException("Judges cannot upload test cases description attachments")

    override fun authorizeContestantUpload(
        contest: Contest,
        member: Member,
    ) = throw ForbiddenException("Contestants cannot upload test cases description attachments")

    override fun authorizePublicUpload(contest: Contest): Unit =
        throw ForbiddenException("Guest users cannot upload test cases description attachments")

    override fun authorizeAdminDownload(
        contest: Contest,
        member: Member,
        attachment: Attachment,
    ) {
        // Admin can download test cases attachments
    }

    override fun authorizeStaffDownload(
        contest: Contest,
        member: Member,
        attachment: Attachment,
    ) = throw ForbiddenException("Staff cannot download test cases attachments")

    override fun authorizeJudgeDownload(
        contest: Contest,
        member: Member,
        attachment: Attachment,
    ) = throw ForbiddenException("Judges cannot download test cases attachments")

    override fun authorizeContestantDownload(
        contest: Contest,
        member: Member,
        attachment: Attachment,
    ) = throw ForbiddenException("Contestants cannot download test cases attachments")

    override fun authorizePublicDownload(
        contest: Contest,
        attachment: Attachment,
    ) = throw ForbiddenException("Guest users cannot download test cases attachments")
}
